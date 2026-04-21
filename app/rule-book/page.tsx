import type { Metadata } from 'next';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import RuleBookArticle from '@/components/RuleBookArticle';
import { getRuleBookHtml } from '@/lib/rule-book-html';
import { RULE_BOOK_DOC_PATH } from '@/lib/rule-book';

export const metadata: Metadata = {
  title: 'Rule Book | TTPSSWA',
  description: 'Read the TTPSSWA association rule book online or download the original document.',
};

export default async function RuleBookPage() {
  const { html, error } = await getRuleBookHtml();

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] border-b border-line bg-[#e8ecf1] pt-[var(--site-header-stack)] dark:bg-slate-900">
        <div className="site-container py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted dark:text-slate-400">
                Official document
              </p>
              <h1 className="mt-1 text-2xl font-bold text-ink dark:text-white">Rule Book</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={RULE_BOOK_DOC_PATH}
                download
                className="inline-flex rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-brand dark:border-slate-600 dark:bg-slate-950 dark:text-white"
              >
                Download original (.docx)
              </a>
              <Link
                href="/"
                className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
              >
                ← Back to home
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
            {error ? (
              <div className="p-8 text-center text-ink dark:text-white">
                <p className="font-semibold">Could not display the rule book online.</p>
                <p className="mt-2 text-sm text-muted dark:text-slate-400">{error}</p>
                <a
                  href={RULE_BOOK_DOC_PATH}
                  download
                  className="mt-6 inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Download .docx
                </a>
              </div>
            ) : (
              <RuleBookArticle
                html={html}
                className="prose prose-slate max-w-none px-6 py-8 sm:px-10 sm:py-12 prose-headings:scroll-mt-24 prose-headings:font-bold prose-a:text-brand prose-table:text-sm dark:prose-invert dark:prose-headings:text-white"
              />
            )}
          </div>
          <p className="mt-4 text-center text-xs text-muted dark:text-slate-500">
            Formatted from the official Word document. For printing or archival, use <strong>Download original</strong>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
