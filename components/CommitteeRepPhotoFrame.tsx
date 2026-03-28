"use client";

import { useState } from "react";

/**
 * 1×1 square frame for a representative photo. Drop an image at `photoSrc`
 * under `public/` (e.g. `/ex-pics/cc-rep/iatf-10364.jpg`); if missing or broken, initials show.
 */
export function CommitteeRepPhotoFrame({
  name,
  photoSrc,
}: {
  name: string;
  photoSrc?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const [failed, setFailed] = useState(false);

  const showImage = Boolean(photoSrc) && !failed;

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[11rem] shrink-0 overflow-hidden rounded-xl border-2 border-line bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner ring-1 ring-black/5 dark:border-slate-600 dark:from-slate-800 dark:to-slate-900 dark:ring-white/10 sm:mx-0"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- dynamic public path + onError fallback
        <img
          src={photoSrc}
          alt={`${name} photo`}
          className="h-full w-full object-cover object-center"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full min-h-0 w-full items-center justify-center p-4 text-center">
          <span className="text-2xl font-bold tracking-tight text-muted/90 dark:text-slate-400">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}
