import fs from 'fs/promises';
import path from 'path';
import parse, { HTMLElement as HtmlElement, Node as HtmlNode, NodeType } from 'node-html-parser';
import mammoth from 'mammoth';
import { RULE_BOOK_DOC_FILENAME } from '@/lib/rule-book';

/**
 * Converts the rule book .docx from /public to HTML on the server (no Microsoft iframe).
 */
export async function getRuleBookHtml(): Promise<{ html: string; error?: string }> {
  try {
    const fullPath = path.join(process.cwd(), 'public', RULE_BOOK_DOC_FILENAME);
    const buffer = await fs.readFile(fullPath);
    const result = await mammoth.convertToHtml({ buffer });
    return { html: addHeadingIdsAndTocLinks(result.value) };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not load rule book.';
    return { html: '', error: message };
  }
}

function slugFromHeadingText(text: string): string {
  const t = text.replace(/\u00a0/g, ' ').trim();
  const ascii = t
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return ascii || 'section';
}

/** Strip dot leaders / trailing page numbers from a TOC line. */
function normalizeTocMatch(text: string): string {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\.{2,}\s*\d+\s*$/, '')
    .replace(/\s+\d+\s*$/, '')
    .trim()
    .toLowerCase();
}

function isTableOfContentsTitle(el: HtmlElement): boolean {
  const t = el.text.replace(/\s+/g, ' ').trim().toLowerCase();
  return t === 'table of contents' || t === 'contents' || /^table of contents\b/.test(t);
}

function bestHeadingId(
  lineNorm: string,
  headings: { id: string; norm: string }[],
): string | null {
  if (lineNorm.length < 2) return null;
  for (const h of headings) {
    if (h.norm === lineNorm) return h.id;
  }
  for (const h of headings) {
    if (!h.norm || !lineNorm) continue;
    if (lineNorm.startsWith(h.norm) || h.norm.startsWith(lineNorm)) return h.id;
  }
  for (const h of headings) {
    if (h.norm.length > 5 && lineNorm.includes(h.norm)) return h.id;
    if (lineNorm.length > 5 && h.norm.includes(lineNorm)) return h.id;
  }
  return null;
}

const DOC_ORDER_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'th']);

function isElement(n: HtmlNode): n is HtmlElement {
  return n.nodeType === NodeType.ELEMENT_NODE;
}

/** Document-order list of block/TOC elements (same traversal as cheerio’s combined selector). */
function elementsInDocumentOrder(root: HtmlElement): HtmlElement[] {
  const ordered: HtmlElement[] = [];
  function walk(node: HtmlNode) {
    if (!isElement(node)) return;
    const tag = node.rawTagName.toLowerCase();
    if (DOC_ORDER_TAGS.has(tag)) ordered.push(node);
    for (const c of node.childNodes) walk(c);
  }
  for (const c of root.childNodes) walk(c);
  return ordered;
}

function parentIsRuleBookTocLink(el: HtmlElement): boolean {
  const p = el.parentNode;
  return isElement(p) && p.matches('a.rule-book-toc-link');
}

/**
 * Adds stable `id`s to headings and wraps Table of Contents lines in links to those headings.
 */
export function addHeadingIdsAndTocLinks(html: string): string {
  const root = parse(html, { lowerCaseTagName: true });
  const usedIds = new Set<string>();

  function uniqueSlug(base: string): string {
    let id = base || 'section';
    let n = 0;
    while (usedIds.has(id)) {
      n += 1;
      id = `${base}-${n}`;
    }
    usedIds.add(id);
    return id;
  }

  const headings: { id: string; norm: string }[] = [];

  for (const h of root.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    const text = h.text.replace(/\u00a0/g, ' ').trim();
    if (!text) continue;
    const id = uniqueSlug(slugFromHeadingText(text));
    h.setAttribute('id', id);
    headings.push({ id, norm: normalizeTocMatch(text) });
  }

  let inToc = false;

  for (const $el of elementsInDocumentOrder(root)) {
    const tag = $el.rawTagName.toLowerCase();

    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
      if (isTableOfContentsTitle($el)) {
        inToc = true;
        continue;
      }
      if (inToc) inToc = false;
      continue;
    }

    const isTocLineEl = tag === 'p' || tag === 'li' || tag === 'td' || tag === 'th';

    if (!isTocLineEl) continue;

    if (!inToc) {
      if (isTableOfContentsTitle($el)) inToc = true;
      continue;
    }

    if (isTableOfContentsTitle($el)) continue;

    if (tag === 'td' || tag === 'th') {
      if ($el.childElementCount > 0) continue;
    }

    if ((tag === 'p' || tag === 'li') && parentIsRuleBookTocLink($el)) continue;

    const rawText = $el.text.replace(/\u00a0/g, ' ').trim();
    if (!rawText || rawText.length > 500) continue;

    const lineNorm = normalizeTocMatch(rawText);
    const id = bestHeadingId(lineNorm, headings);
    if (!id) continue;

    const inner = $el.innerHTML;
    if (!inner) continue;

    const existing = $el.querySelector('a');
    if (existing) {
      existing.setAttribute('href', `#${id}`);
      existing.classList.add('rule-book-toc-link');
      continue;
    }

    const first = $el.firstElementChild;
    if ($el.childElementCount === 1 && first?.matches('a.rule-book-toc-link')) {
      first.setAttribute('href', `#${id}`);
      continue;
    }

    $el.innerHTML = `<a href="#${id}" class="rule-book-toc-link">${inner}</a>`;
  }

  return root.innerHTML;
}
