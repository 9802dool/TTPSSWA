"use client";

import { useState } from "react";
import ExpandableBenefit from "@/components/ExpandableBenefit";

const DREAM_BUILDERS_VIDEO = "/dream%20builders.MOV";

type PartnershipPillar = {
  key: number;
  id: string;
  title: string;
  body: string;
  placement: string;
  videoSrc?: string;
};

const PILLARS: PartnershipPillar[] = [
  {
    key: 1,
    id: "hardware-and-beyond",
    title: "Hardware and Beyond",
    body:
      "Hardware and Beyond is a TTPSSWA partnership program. Further details and contact information will be published here as they become available.",
    placement: "sm:col-start-1 sm:row-start-1",
  },
  {
    key: 2,
    id: "antar-auto-repairs-and-parts",
    title: "Antar auto Repairs And Parts",
    body:
      "Antar auto Repairs And Parts is a TTPSSWA partnership program. Further details and contact information will be published here as they become available.",
    placement: "sm:col-start-1 sm:row-start-2",
  },
  {
    key: 3,
    id: "dream-builder-colour-studio-ltd",
    title: "Dream Builder Colour Studio Ltd",
    body:
      "Dream Builder Colour Studio Ltd is a TTPSSWA partnership program. Further details and contact information will be published here as they become available.",
    placement: "sm:col-start-2 sm:row-span-2 sm:row-start-1",
    videoSrc: DREAM_BUILDERS_VIDEO,
  },
];

export function PartnershipPillars() {
  const [openKey, setOpenKey] = useState<number | null>(null);

  function toggle(key: number) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  return (
    <ul
      className="mt-8 grid list-none gap-3 p-0 sm:grid-cols-2 sm:gap-3.5"
      aria-label="Partnership programs"
    >
      {PILLARS.map((p) => (
        <ExpandableBenefit
          key={p.key}
          benefitKey={p.key}
          id={p.id}
          title={p.title}
          isOpen={openKey === p.key}
          onToggle={() => toggle(p.key)}
          className={p.placement}
        >
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted">{p.body}</p>
            {p.videoSrc ? (
              <div className="overflow-hidden rounded-lg border border-line bg-black shadow-inner">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="h-auto w-full max-w-full object-contain"
                  aria-label="Dream Builder Colour Studio video"
                >
                  <source src={p.videoSrc} type="video/quicktime" />
                  Your browser does not support embedded video.{" "}
                  <a
                    href={DREAM_BUILDERS_VIDEO}
                    className="font-semibold text-brand underline underline-offset-2"
                  >
                    Download the video
                  </a>
                  .
                </video>
              </div>
            ) : null}
          </div>
        </ExpandableBenefit>
      ))}
    </ul>
  );
}
