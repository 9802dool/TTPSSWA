"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import {
  EXECUTIVE_TEAM,
  EXEC_PHOTOS,
  type ExecutiveMember,
} from "@/lib/executive-team";

const DEFAULT_BIO =
  "A full biography will be posted here soon. Contact the association office for more information.";

export function ExecutiveTeamGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogTitleId = useId();

  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex, close]);

  const member: ExecutiveMember | null =
    openIndex !== null ? EXECUTIVE_TEAM[openIndex]! : null;
  const displayName = member?.name ?? "Name to be announced";
  const bioText =
    member?.bio?.trim() && member.bio.trim().length > 0
      ? member.bio.trim()
      : DEFAULT_BIO;

  const modalPhotoSrc =
    openIndex !== null && openIndex < EXEC_PHOTOS.length
      ? EXEC_PHOTOS[openIndex]
      : null;

  return (
    <>
      <section className="bg-canvas py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 max-w-2xl text-sm text-muted">
            Tap or click a photo to open a short biography.
          </p>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXECUTIVE_TEAM.map((role, index) => (
              <li
                key={`${role.title}-${index}`}
                className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-corp transition hover:shadow-corp-md dark:bg-surface"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  className="group relative aspect-square w-full cursor-pointer border-0 bg-gradient-to-br from-slate-200 to-slate-300 p-0 text-left ring-line transition hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:from-slate-800 dark:to-slate-900"
                  aria-label={`Open biography: ${role.name ?? role.title}`}
                >
                  <span className="pointer-events-none absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-navy text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {index < EXEC_PHOTOS.length ? (
                    <Image
                      src={EXEC_PHOTOS[index]}
                      alt=""
                      fill
                      priority={index < 2}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain object-center transition group-hover:opacity-95"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Photo
                      </span>
                    </div>
                  )}
                </button>
                <div className="flex flex-1 flex-col justify-center p-6">
                  <h2 className="text-base font-bold text-ink md:text-lg">
                    {role.title}
                  </h2>
                  <p className="mt-3 text-xl font-semibold leading-snug text-ink md:text-2xl">
                    {role.name ?? "Name to be announced"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {member && openIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            aria-label="Close biography"
            onClick={close}
          />
          <div
            className="relative z-10 max-h-[min(92vh,40rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6 pt-12 shadow-corp-md dark:bg-surface"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-20 rounded-lg px-2 py-1 text-sm font-medium text-muted hover:bg-line/60 hover:text-ink"
            >
              Close
            </button>
            {modalPhotoSrc ? (
              <div className="relative mb-5 aspect-square w-full max-w-[16rem] overflow-hidden rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900">
                <Image
                  src={modalPhotoSrc}
                  alt={`Portrait of ${displayName}`}
                  fill
                  sizes="256px"
                  className="object-contain object-center"
                />
              </div>
            ) : null}
            <p className="pr-14 text-xs font-semibold uppercase tracking-wider text-brand">
              {member.title}
            </p>
            <h2
              id={dialogTitleId}
              className="mt-1 text-2xl font-bold tracking-tight text-ink"
            >
              {displayName}
            </h2>
            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted">
              {bioText}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
