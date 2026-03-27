/** Divisions / sections for Central Committee Representative navigation. */
export const CENTRAL_COMMITTEE_REGIONS = [
  { slug: "port-of-spain", name: "Port of Spain" },
  { slug: "western", name: "Western" },
  { slug: "central", name: "Central" },
  { slug: "southern", name: "Southern" },
  { slug: "south-western", name: "South Western" },
  { slug: "north", name: "North" },
  { slug: "north-central", name: "North Central" },
  { slug: "eastern", name: "Eastern" },
  { slug: "north-eastern", name: "North Eastern" },
  { slug: "tobago", name: "Tobago" },
  { slug: "iatf", name: "IATF" },
  { slug: "geb", name: "GEB" },
  { slug: "acib", name: "ACIB" },
  { slug: "notf", name: "NOTF" },
  { slug: "mops", name: "MOPS" },
  { slug: "mounted-and-k9", name: "Mounted and K9" },
  { slug: "e999", name: "E999" },
] as const;

export type CentralCommitteeRegionSlug =
  (typeof CENTRAL_COMMITTEE_REGIONS)[number]["slug"];

export function getRegionBySlug(slug: string) {
  return CENTRAL_COMMITTEE_REGIONS.find((r) => r.slug === slug);
}
