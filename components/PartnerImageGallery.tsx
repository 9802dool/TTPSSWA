"use client";

import { useCallback, useState } from "react";

type Props = {
  /** Public folder name under /Partners/ (e.g. "Antar", "Dream Builders") */
  folder: string;
  count: number;
  /** Alt text prefix, e.g. "Antar Auto Repairs partner" */
  imageAltPrefix: string;
};

export function PartnerImageGallery({ folder, count, imageAltPrefix }: Props) {
  const base = `/Partners/${encodeURIComponent(folder)}`;
  const sources = Array.from(
    { length: count },
    (_, i) => `${base}/${i + 1}.JPG`,
  );

  const [index, setIndex] = useState(0);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  return (
    <div className="mt-4">
      <div className="flex items-stretch gap-2 sm:gap-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous image"
          className="inline-flex w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-1 py-4 text-navy shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:w-14"
        >
          <svg
            className="h-7 w-7 text-navy dark:text-slate-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-navy dark:text-slate-200">
            Back
          </span>
        </button>

        <div className="flex min-h-[200px] min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-line bg-slate-100 px-2 py-4 shadow-inner dark:bg-slate-900/80 sm:min-h-[280px]">
          <img
            src={sources[index]}
            alt={`${imageAltPrefix} image ${index + 1} of ${count}`}
            className="h-auto max-h-[min(70vh,560px)] w-full max-w-full object-contain"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next image"
          className="inline-flex w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-1 py-4 text-navy shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:w-14"
        >
          <svg
            className="h-7 w-7 text-navy dark:text-slate-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-navy dark:text-slate-200">
            Fwd
          </span>
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted" aria-live="polite">
        Image {index + 1} of {count}
      </p>
    </div>
  );
}
