"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import {
  EXECUTIVE_TEAM,
  EXEC_PHOTOS,
  PRESIDENT_NAME,
  type ExecutiveMember,
} from "@/lib/executive-team";

function gridMemberName(role: ExecutiveMember): string {
  const n = role.name?.trim();
  if (n) return n;
  if (role.title === "President") return PRESIDENT_NAME;
  return "Name to be announced";
}

const DEFAULT_BIO =
  "A full biography will be posted here soon. Contact the association office for more information.";

type ExecutiveTeamGridProps = {
  /** Dark page background (e.g. /executive); default matches home tab on light slate. */
  tone?: "light" | "dark";
};

export function ExecutiveTeamGrid({ tone = "light" }: ExecutiveTeamGridProps) {
  const darkPage = tone === "dark";
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
      <section className="bg-transparent py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p
            className={
              darkPage
                ? "mb-8 max-w-2xl text-sm font-medium text-sky-300"
                : "mb-8 max-w-2xl text-sm font-medium text-brand dark:text-sky-300"
            }
          >
            Tap or click a photo to open a short biography.
          </p>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXECUTIVE_TEAM.map((role, index) => (
              <li
                key={`${role.title}-${index}`}
                className={
                  darkPage
                    ? "flex flex-col overflow-hidden rounded-xl border border-slate-600 bg-slate-800/55 shadow-corp transition hover:shadow-corp-md"
                    : "flex flex-col overflow-hidden rounded-xl border border-line bg-slate-200/35 shadow-corp transition hover:shadow-corp-md dark:border-slate-600 dark:bg-slate-800/50"
                }
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  className={
                    darkPage
                      ? "group relative aspect-square w-full cursor-pointer border-0 bg-gradient-to-br from-slate-800 to-slate-950 p-0 text-left ring-slate-600 transition hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                      : "group relative aspect-square w-full cursor-pointer border-0 bg-gradient-to-br from-slate-200 to-slate-300 p-0 text-left ring-line transition hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:from-slate-800 dark:to-slate-900"
                  }
                  aria-label={`Open biography: ${gridMemberName(role)}, ${role.title}`}
                >
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
                      <span
                        className={
                          darkPage
                            ? "text-xs font-semibold uppercase tracking-wider text-sky-400"
                            : "text-xs font-semibold uppercase tracking-wider text-brand"
                        }
                      >
                        Photo
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/88 via-black/45 to-transparent px-3 pb-3 pt-16 text-left sm:px-4 sm:pb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300 sm:text-[11px]">
                      {role.title}
                    </p>
                    <p className="mt-0.5 text-base font-semibold leading-snug text-white drop-shadow-md sm:text-lg">
                      {gridMemberName(role)}
                    </p>
                  </div>
                </button>
                <div className="flex flex-1 flex-col justify-center border-t border-line p-6 dark:border-slate-600">
                  <h2
                    className={
                      darkPage
                        ? "text-base font-bold text-sky-400 md:text-lg"
                        : "text-base font-bold text-brand md:text-lg"
                    }
                  >
                    {role.title}
                  </h2>
                  <p
                    className={
                      darkPage
                        ? "mt-3 text-xl font-semibold leading-snug text-white md:text-2xl"
                        : "mt-3 text-xl font-semibold leading-snug text-ink md:text-2xl"
                    }
                  >
                    {gridMemberName(role)}
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
            className={
              darkPage
                ? "relative z-10 max-h-[min(92vh,40rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-600 bg-slate-900 p-6 pt-12 shadow-corp-md"
                : "relative z-10 max-h-[min(92vh,40rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6 pt-12 shadow-corp-md dark:bg-surface"
            }
          >
            <button
              type="button"
              onClick={close}
              className={
                darkPage
                  ? "absolute right-3 top-3 z-20 rounded-xl border border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  : "site-btn-modal-close absolute right-3 top-3 z-20"
              }
            >
              Close
            </button>
            {modalPhotoSrc ? (
              <div
                className={
                  darkPage
                    ? "relative mb-5 aspect-square w-full max-w-[16rem] overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-950"
                    : "relative mb-5 aspect-square w-full max-w-[16rem] overflow-hidden rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900"
                }
              >
                <Image
                  src={modalPhotoSrc}
                  alt={`Portrait of ${displayName}`}
                  fill
                  sizes="256px"
                  className="object-contain object-center"
                />
              </div>
            ) : null}
            <p
              className={
                darkPage
                  ? "pr-14 text-xs font-semibold uppercase tracking-[0.12em] text-sky-400"
                  : "pr-14 text-xs font-semibold uppercase tracking-[0.12em] text-brand"
              }
            >
              {member.title}
            </p>
            <h2
              id={dialogTitleId}
              className={
                darkPage
                  ? "mt-1 text-2xl font-bold tracking-tight text-white"
                  : "mt-1 text-2xl font-bold tracking-tight text-ink"
              }
            >
              {displayName}
            </h2>
            <p
              className={
                darkPage
                  ? "mt-5 whitespace-pre-line text-base leading-relaxed text-slate-400"
                  : "mt-5 whitespace-pre-line text-base leading-relaxed text-muted"
              }
            >
              {bioText}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
