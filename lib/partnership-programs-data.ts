export type PartnershipProgram = {
  key: number;
  slug: string;
  title: string;
  body: string;
  /** Tailwind grid placement classes (sm+), same layout as partnership index */
  placement: string;
  hasGallery: boolean;
};

export const PARTNERSHIP_PROGRAMS: PartnershipProgram[] = [
  {
    key: 1,
    slug: "hardware-and-beyond",
    title: "Hardware and Beyond",
    body:
      "Hardware and Beyond is a TTPSSWA partnership program. Further details and contact information will be published here as they become available.",
    placement: "sm:col-start-1 sm:row-start-1",
    hasGallery: false,
  },
  {
    key: 2,
    slug: "antar-auto-repairs-and-parts",
    title: "Antar auto Repairs And Parts",
    body:
      "Antar auto Repairs And Parts is a TTPSSWA partnership program. Further details and contact information will be published here as they become available.",
    placement: "sm:col-start-1 sm:row-start-2",
    hasGallery: false,
  },
  {
    key: 3,
    slug: "dream-builder-colour-studio-ltd",
    title: "Dream Builder Colour Studio Ltd",
    body:
      "Dream Builder Colour Studio Ltd is a TTPSSWA partnership program. Further details and contact information will be published here as they become available.",
    placement: "sm:col-start-2 sm:row-span-2 sm:row-start-1",
    hasGallery: true,
  },
];

export function getPartnershipProgram(
  slug: string,
): PartnershipProgram | undefined {
  return PARTNERSHIP_PROGRAMS.find((p) => p.slug === slug);
}
