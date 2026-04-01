"use client";

import { useState } from "react";
import { DreamBuilderPartnerGallery } from "@/components/DreamBuilderPartnerGallery";
import ExpandableBenefit from "@/components/ExpandableBenefit";

type PartnershipPillar = {
  key: number;
  id: string;
  title: string;
  body: string;
  placement: string;
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
          <>
            <p className="text-sm leading-relaxed text-muted">{p.body}</p>
            {p.key === 3 ? <DreamBuilderPartnerGallery /> : null}
          </>
        </ExpandableBenefit>
      ))}
    </ul>
  );
}
