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
    return { html: addHeadingIdsAndTocLinks(fixHeadingLevels(result.value)) };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not load rule book.';
    return { html: '', error: message };
  }
}

/**
 * Converts all H1 tags except the first one to H2 to maintain proper heading hierarchy.
 */
function fixHeadingLevels(html: string): string {
  const root = parse(html, { lowerCaseTagName: true });
  const h1Elements = root.querySelectorAll('h1');
  
  // Keep the first H1, convert the rest to H2
  h1Elements.forEach((h1, index) => {
    if (index > 0) {
      const h2 = parse(`<h2>${h1.innerHTML}</h2>`).firstChild as HtmlElement;
      if (h1.id) h2.setAttribute('id', h1.id);
      for (const [key, value] of Object.entries(h1.attributes)) {
        if (key !== 'id') h2.setAttribute(key, value);
      }
      h1.replaceWith(h2);
    }
  });
  
  return root.innerHTML;
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

/** Ellipsis / dot leaders Word uses before a TOC page number (U+2026, ".", etc.). */
const PAGE_LEADER = /(?:[.\u2024\u2025\u2026\u00b7\u22ef]{2,})\s*\d{1,3}\s*$/;

const STOP_WORDS = new Set(['a', 'an', 'and', 'the', 'of', 'for', 'to', 'in', 'on', 'all', 'other', 'by']);

function isElement(n: HtmlNode): n is HtmlElement {
  return n.nodeType === NodeType.ELEMENT_NODE;
}

function elementText(el: HtmlElement): string {
  return el.text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function isTableOfContentsTitle(el: HtmlElement): boolean {
  const t = elementText(el).toLowerCase();
  return t === 'table of contents' || t === 'contents' || t === 'chapters';
}

function tagName(el: HtmlElement): string {
  return el.rawTagName.toLowerCase();
}

function isHeadingTag(tag: string): boolean {
  return tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6';
}

function hasTrailingPageNumber(text: string): boolean {
  return PAGE_LEADER.test(text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim());
}

function stripPageNumber(text: string): string {
  return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().replace(PAGE_LEADER, '').trim();
}

/** Comparable chapter title: no page number, no leading "12." / "(a)". */
function canonTitle(text: string): string {
  let t = stripPageNumber(text).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  t = t.replace(/^\d+\s*[\.)]?\s*/, '');
  t = t.replace(/^\(\s*[a-z0-9]+\s*\)\s*/, '');
  t = t.replace(/[^a-z0-9]+/g, ' ').trim();
  return t;
}

function stemToken(token: string): string {
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

function contentTokens(canon: string): string[] {
  return canon
    .split(' ')
    .filter((token) => token && !STOP_WORDS.has(token))
    .map(stemToken);
}

function uniqueTokens(list: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < list.length; i += 1) {
    if (out.indexOf(list[i]) === -1) out.push(list[i]);
  }
  return out;
}

function jaccard(a: string[], b: string[]): number {
  const left = uniqueTokens(a);
  const right = uniqueTokens(b);
  if (!left.length || !right.length) return 0;
  let inter = 0;
  for (let i = 0; i < left.length; i += 1) {
    if (right.indexOf(left[i]) !== -1) inter += 1;
  }
  const union = left.length + right.length - inter;
  return union === 0 ? 0 : inter / union;
}

function titleSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const ta = contentTokens(a);
  const tb = contentTokens(b);
  const scores = [jaccard(ta, tb), jaccard(a.split(' '), b.split(' '))];
  if (ta.length && tb.length) {
    const [shorter, longer] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
    const longSet = new Set(longer);
    const hit = shorter.filter((token) => longSet.has(token)).length / shorter.length;
    if (shorter.length >= 2 && hit === 1 && shorter.length / longer.length >= 0.6) scores.push(0.92);
    if (shorter.length === 1 && longer.length === 1 && hit === 1) scores.push(1);
  }
  return Math.max(...scores);
}

function directListItems(ol: HtmlElement): HtmlElement[] {
  return ol.childNodes.filter((child): child is HtmlElement => isElement(child) && tagName(child) === 'li');
}

/**
 * TOC lines between the contents title and the first real heading.
 * Wrapped titles (a list item with no page number, then a following paragraph) are one entry.
 */
function collectTocEntries(root: HtmlElement): HtmlElement[] {
  const lines: HtmlElement[] = [];
  let inToc = false;
  let stopped = false;

  function walk(node: HtmlNode) {
    if (stopped || !isElement(node)) return;
    const tag = tagName(node);
    if (inToc && isHeadingTag(tag) && elementText(node) && !isTableOfContentsTitle(node)) {
      stopped = true;
      return;
    }
    if (!inToc && isTableOfContentsTitle(node) && (tag === 'p' || isHeadingTag(tag))) {
      inToc = true;
      return;
    }
    if (inToc && (tag === 'p' || tag === 'li' || tag === 'td' || tag === 'th')) {
      if (elementText(node) && !isTableOfContentsTitle(node)) lines.push(node);
      return;
    }
    for (const child of node.childNodes) walk(child);
  }

  for (const child of root.childNodes) walk(child);

  const groups: HtmlElement[][] = [];
  for (const line of lines) {
    const prev = groups[groups.length - 1];
    const prevText = prev ? prev.map((el) => el.text).join(' ') : '';
    if (prev && !hasTrailingPageNumber(prevText)) prev.push(line);
    else groups.push([line]);
  }

  return groups.map((group) => {
    const host = group[0];
    if (group.length > 1) {
      host.innerHTML = group
        .map((el) => el.innerHTML.trim())
        .filter(Boolean)
        .join(' ');
      for (const extra of group.slice(1)) extra.remove();
    }
    return host;
  });
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function linkTocEntry(el: HtmlElement, id: string) {
  const label = escapeAttr(stripPageNumber(elementText(el)));
  const existing = el.querySelector('a.rule-book-toc-link');
  if (existing) {
    existing.setAttribute('href', `#${id}`);
    if (label) existing.setAttribute('aria-label', label);
    existing.classList.add('rule-book-toc-link');
    return;
  }
  const inner = el.innerHTML;
  if (!inner) return;
  const aria = label ? ` aria-label="${label}"` : '';
  el.innerHTML = `<a href="#${id}" class="rule-book-toc-link"${aria}>${inner}</a>`;
}

/** Keep chapter numbers continuous when Word's wrapped lines split one list into several `<ol>`s. */
function renumberTocLists(root: HtmlElement) {
  let inToc = false;
  let stopped = false;
  let next = 1;

  function walk(node: HtmlNode) {
    if (stopped || !isElement(node)) return;
    const tag = tagName(node);
    if (inToc && isHeadingTag(tag) && elementText(node) && !isTableOfContentsTitle(node)) {
      stopped = true;
      return;
    }
    if (!inToc && isTableOfContentsTitle(node) && (tag === 'p' || isHeadingTag(tag))) {
      inToc = true;
    }
    if (inToc && tag === 'ol') {
      node.setAttribute('start', String(next));
      next += directListItems(node).length;
      return;
    }
    for (const child of node.childNodes) walk(child);
  }

  for (const child of root.childNodes) walk(child);
}

type ChapterTarget = { el: HtmlElement; canon: string };

function looksLikeChapterLabel(text: string): boolean {
  const letters = text.replace(/[^A-Za-z]/g, '');
  if (!letters) return false;
  let caps = 0;
  for (let i = 0; i < letters.length; i += 1) {
    const ch = letters.charAt(i);
    if (ch === ch.toUpperCase()) caps += 1;
  }
  return caps / letters.length >= 0.75 || /^\s*\d+\s*[\.)]/.test(text);
}

/**
 * Adds stable ids to chapter headings and links every table-of-contents entry to its chapter.
 * Titles that disagree with the heading ("Modes" / "Mode", "(b) Committee" / "Tribunal") still match,
 * and a chapter that was not styled as a heading (Inspection of the Books) gets an id too.
 */
export function addHeadingIdsAndTocLinks(html: string): string {
  const root = parse(html, { lowerCaseTagName: true });
  const usedIds = new Set<string>();

  function uniqueSlug(base: string): string {
    let id = base || 'section';
    let n = 0;
    while (usedIds.has(id)) {
      n += 1;
      id = `${base || 'section'}-${n}`;
    }
    usedIds.add(id);
    return id;
  }

  function assignAnchor(el: HtmlElement, text: string) {
    const existing = el.getAttribute('id');
    if (existing && !existing.startsWith('_Toc')) {
      el.classList.add('rule-book-anchor');
      usedIds.add(existing);
      return existing;
    }
    const id = uniqueSlug(slugFromHeadingText(text));
    el.setAttribute('id', id);
    el.classList.add('rule-book-anchor');
    return id;
  }

  const headingTargets: ChapterTarget[] = [];
  for (const heading of root.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    const text = elementText(heading);
    if (!text || isTableOfContentsTitle(heading)) continue;
    assignAnchor(heading, text);
    headingTargets.push({ el: heading, canon: canonTitle(text) });
  }

  const tocEntries = collectTocEntries(root);
  const tocNodes = new Set(tocEntries);

  const targets: ChapterTarget[] = [...headingTargets];

  for (const entry of tocEntries) {
    const entryCanon = canonTitle(elementText(entry));
    if (!entryCanon) continue;
    const headingScore = headingTargets.reduce(
      (best, target) => Math.max(best, titleSimilarity(entryCanon, target.canon)),
      0,
    );
    if (headingScore >= 0.55) continue;

    let bestPara: HtmlElement | null = null;
    let bestScore = 0;
    for (const para of root.querySelectorAll('p')) {
      if (tocNodes.has(para)) continue;
      const text = elementText(para);
      if (text.length < 4 || text.length > 140) continue;
      if (!looksLikeChapterLabel(text)) continue;
      const score = titleSimilarity(entryCanon, canonTitle(text));
      if (score > bestScore) {
        bestScore = score;
        bestPara = para;
      }
    }
    if (bestPara && bestScore >= 0.8 && !targets.some((target) => target.el === bestPara)) {
      assignAnchor(bestPara, elementText(bestPara));
      targets.push({ el: bestPara, canon: canonTitle(elementText(bestPara)) });
    }
  }

  const position = new Map<HtmlElement, number>();
  let seq = 0;
  function mark(node: HtmlNode) {
    if (!isElement(node)) return;
    position.set(node, seq);
    seq += 1;
    for (const child of node.childNodes) mark(child);
  }
  for (const child of root.childNodes) mark(child);
  targets.sort((a, b) => (position.get(a.el) ?? 0) - (position.get(b.el) ?? 0));

  const match = new Map<HtmlElement, ChapterTarget>();
  const usedTargets = new Set<HtmlElement>();
  let cursor = 0;

  for (const entry of tocEntries) {
    const entryCanon = canonTitle(elementText(entry));
    if (entryCanon.length < 2) continue;
    let bestIndex = -1;
    let bestScore = 0;
    for (let i = cursor; i < targets.length; i += 1) {
      if (usedTargets.has(targets[i].el)) continue;
      const score = titleSimilarity(entryCanon, targets[i].canon);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
    if (bestIndex >= 0 && bestScore >= 0.62) {
      match.set(entry, targets[bestIndex]);
      usedTargets.add(targets[bestIndex].el);
      cursor = bestIndex + 1;
    }
  }

  const matchedIndexes = tocEntries
    .map((entry, index) => (match.has(entry) ? index : -1))
    .filter((index) => index >= 0);

  const gaps: Array<[number, number]> = [];
  const first = matchedIndexes[0];
  if (first !== undefined && first > 0) gaps.push([-1, first]);
  for (let i = 0; i < matchedIndexes.length - 1; i += 1) {
    gaps.push([matchedIndexes[i], matchedIndexes[i + 1]]);
  }
  const last = matchedIndexes[matchedIndexes.length - 1];
  if (last !== undefined && last < tocEntries.length - 1) gaps.push([last, tocEntries.length]);

  for (const [left, right] of gaps) {
    const pendingEntries = tocEntries.slice(left + 1, right).filter((entry) => !match.has(entry));
    const leftTarget = left >= 0 ? match.get(tocEntries[left]) : undefined;
    const rightTarget = right < tocEntries.length ? match.get(tocEntries[right]) : undefined;
    const leftPos = leftTarget ? (position.get(leftTarget.el) ?? -1) : -1;
    const rightPos = rightTarget ? (position.get(rightTarget.el) ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
    const pendingTargets = targets.filter((target) => {
      if (usedTargets.has(target.el)) return false;
      const pos = position.get(target.el) ?? 0;
      return pos > leftPos && pos < rightPos;
    });
    if (
      pendingEntries.length === 0 ||
      pendingEntries.length !== pendingTargets.length ||
      pendingEntries.length > 2
    ) {
      continue;
    }
    pendingEntries.forEach((entry, i) => {
      match.set(entry, pendingTargets[i]);
      usedTargets.add(pendingTargets[i].el);
    });
  }

  for (const entry of tocEntries) {
    const target = match.get(entry);
    const id = target?.el.getAttribute('id');
    if (!id) continue;
    linkTocEntry(entry, id);
  }

  renumberTocLists(root);
  return root.innerHTML;
}
