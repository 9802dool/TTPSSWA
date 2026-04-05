import fs from 'fs/promises';
import path from 'path';
import type { Cheerio } from 'cheerio';
import type { Element } from 'domhandler';
import * as cheerio from 'cheerio';
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

function isTableOfContentsTitle($el: Cheerio<Element>): boolean {
  const t = $el.text().replace(/\s+/g, ' ').trim().toLowerCase();
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

function serializeFragment($: cheerio.CheerioAPI): string {
  return $.root()
    .children()
    .toArray()
    .map((node) => $.html(node))
    .join('');
}

/**
 * Adds stable `id`s to headings and wraps Table of Contents lines in links to those headings.
 */
export function addHeadingIdsAndTocLinks(html: string): string {
  const $ = cheerio.load(html, null, false);
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

  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const $h = $(el);
    const text = $h.text().replace(/\u00a0/g, ' ').trim();
    if (!text) return;
    const id = uniqueSlug(slugFromHeadingText(text));
    $h.attr('id', id);
    headings.push({ id, norm: normalizeTocMatch(text) });
  });

  let inToc = false;

  $('h1, h2, h3, h4, h5, h6, p, li, td, th').each((_, el) => {
    const $el = $(el);
    const tag = el.tagName.toLowerCase();

    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
      if (isTableOfContentsTitle($el)) {
        inToc = true;
        return;
      }
      if (inToc) inToc = false;
      return;
    }

    const isTocLineEl = tag === 'p' || tag === 'li' || tag === 'td' || tag === 'th';

    if (!isTocLineEl) return;

    if (!inToc) {
      if (isTableOfContentsTitle($el)) inToc = true;
      return;
    }

    if (isTableOfContentsTitle($el)) return;

    if (tag === 'td' || tag === 'th') {
      if ($el.children().length > 0) return;
    }

    if ((tag === 'p' || tag === 'li') && $el.parent().is('a.rule-book-toc-link')) return;

    const rawText = $el.text().replace(/\u00a0/g, ' ').trim();
    if (!rawText || rawText.length > 500) return;

    const lineNorm = normalizeTocMatch(rawText);
    const id = bestHeadingId(lineNorm, headings);
    if (!id) return;

    const inner = $el.html();
    if (!inner) return;

    const existing = $el.find('a').first();
    if (existing.length) {
      existing.attr('href', `#${id}`).addClass('rule-book-toc-link');
      return;
    }

    const onlyLink = $el.children().length === 1 && $el.children().first().is('a.rule-book-toc-link');
    if (onlyLink) {
      $el.find('a.rule-book-toc-link').attr('href', `#${id}`);
      return;
    }

    $el.html(`<a href="#${id}" class="rule-book-toc-link">${inner}</a>`);
  });

  return serializeFragment($);
}
