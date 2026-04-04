import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { RULE_BOOK_DOC_PATH } from '@/lib/rule-book';

export const metadata: Metadata = {
  title: 'Rule Book | TTPSSWA',
  description: 'Read the TTPSSWA association rule book online or download the original document.',
};

async function absoluteDocUrl(): Promise<string> {
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const forwarded = h.get('x-forwarded-proto');
  const proto =
    forwarded?.split(',')[0]?.trim() ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}${encodeURI(RULE_BOOK_DOC_PATH)}`;
}

export default async function RuleBookPage() {
  const fileUrl = await absoluteDocUrl();
  const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] border-b border-line bg-[#e8ecf1] pt-[var(--site-header-stack)] dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
            <iframe
              title="Rule Book — digital reader"
              src={viewerUrl}
              className="h-[min(85vh,1200px)] w-full border-0 bg-slate-100 dark:bg-slate-900"
              allowFullScreen
            />
          </div>
          <p className="mt-4 text-center text-xs text-muted dark:text-slate-500">
            Digital reader uses Microsoft&apos;s online viewer. The document must be reachable at a public URL (works on
            your live site). If it does not load, use <strong>Download original</strong>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
