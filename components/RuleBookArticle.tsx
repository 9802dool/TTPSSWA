'use client';

import { useLayoutEffect } from 'react';

function scrollToHash() {
  const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
  if (!hash) return;
  const id = decodeURIComponent(hash.replace(/\+/g, ' '));
  const el = document.getElementById(id);
  if (!el) return;
  const reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

type Props = {
  html: string;
  className?: string;
};

export default function RuleBookArticle({ html, className }: Props) {
  useLayoutEffect(() => {
    scrollToHash();
  }, [html]);

  useLayoutEffect(() => {
    const onHashChange = () => scrollToHash();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const articleClass = ['rule-book-body', className].filter(Boolean).join(' ');

  return <article className={articleClass} dangerouslySetInnerHTML={{ __html: html }} />;
}
