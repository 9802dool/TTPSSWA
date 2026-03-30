/** Divisions / sections for Central Committee Representative navigation (includes partnership pillars; rosters may be added in data). */
export const CENTRAL_COMMITTEE_REGIONS = [
  { slug: "acib", name: "ACIB" },
  { slug: "capa", name: "CAPA" },
  { slug: "central", name: "Central" },
  { slug: "cid-cro", name: "CID / CRO" },
  { slug: "coastal-air-support", name: "Coastal & Air Support" },
  {
    slug: "community-oriented-policing",
    name: "Community Oriented Policing",
  },
  { slug: "complaints", name: "Complaints" },
  { slug: "corporate-communications", name: "Corporate Communications" },
  { slug: "court-process", name: "Court & Process" },
  { slug: "cyber-social-media", name: "Cyber & Social Media" },
  { slug: "e999-erp", name: "E999 / ERP" },
  { slug: "eastern", name: "Eastern" },
  { slug: "fib", name: "FIB" },
  { slug: "finance", name: "Finance" },
  { slug: "fraud-squad", name: "Fraud Squad" },
  { slug: "geb", name: "GEB" },
  { slug: "hardware-and-beyond", name: "Hardware and Beyond" },
  { slug: "homicide", name: "Homicide" },
  { slug: "human-resource", name: "Human Resource" },
  { slug: "iatf", name: "IATF" },
  { slug: "mounted-and-k9", name: "Mounted & Canine" },
  { slug: "municipal", name: "Municipal" },
  { slug: "north-central", name: "North Central" },
  { slug: "north-eastern", name: "North Eastern (NED)" },
  { slug: "northern", name: "Northern" },
  { slug: "occ", name: "OCC" },
  { slug: "police-academy", name: "Police Academy" },
  { slug: "police-band", name: "Police Band" },
  { slug: "port-of-spain", name: "Port of Spain" },
  { slug: "psb", name: "PSB" },
  { slug: "siu", name: "SIU" },
  { slug: "south-western", name: "South Western" },
  { slug: "southern", name: "Southern" },
  { slug: "special-branch", name: "Special Branch" },
  { slug: "special-victims", name: "Special Victims" },
  { slug: "tobago", name: "Tobago" },
  { slug: "traffic-highway-patrol", name: "Traffic & Highway Patrol" },
  { slug: "transport-telecom", name: "Transport & Telecom" },
  { slug: "western", name: "Western" },
] as const;

export type CentralCommitteeRegionSlug =
  (typeof CENTRAL_COMMITTEE_REGIONS)[number]["slug"];

export function getRegionBySlug(slug: string) {
  return CENTRAL_COMMITTEE_REGIONS.find((r) => r.slug === slug);
}
