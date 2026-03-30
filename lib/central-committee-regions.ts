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
  { slug: "north-eastern", name: "North Eastern (NED)" },
  { slug: "tobago", name: "Tobago" },
  { slug: "transport-telecom", name: "Transport & Telecom" },
  { slug: "iatf", name: "IATF" },
  { slug: "siu", name: "SIU" },
  { slug: "special-branch", name: "Special Branch" },
  { slug: "geb", name: "GEB" },
  { slug: "acib", name: "ACIB" },
  { slug: "notf", name: "NOTF" },
  { slug: "mops", name: "MOPS" },
  { slug: "mounted-and-k9", name: "Mounted & Canine" },
  { slug: "complaints", name: "Complaints" },
  { slug: "police-band", name: "Police Band" },
  { slug: "municipal", name: "Municipal" },
  { slug: "court-process", name: "Court & Process" },
  { slug: "community-oriented-policing", name: "Community Oriented Policing" },
  { slug: "traffic-highway-patrol", name: "Traffic & Highway Patrol" },
  { slug: "e999", name: "E999" },
] as const;

export type CentralCommitteeRegionSlug =
  (typeof CENTRAL_COMMITTEE_REGIONS)[number]["slug"];

export function getRegionBySlug(slug: string) {
  return CENTRAL_COMMITTEE_REGIONS.find((r) => r.slug === slug);
}
