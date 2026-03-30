/** Divisions / sections for Central Committee Representative navigation (only pillars with roster data). */
export const CENTRAL_COMMITTEE_REGIONS = [
  { slug: "port-of-spain", name: "Port of Spain" },
  { slug: "western", name: "Western" },
  { slug: "central", name: "Central" },
  { slug: "southern", name: "Southern" },
  { slug: "south-western", name: "South Western" },
  { slug: "eastern", name: "Eastern" },
  { slug: "north-eastern", name: "North Eastern (NED)" },
  { slug: "north-central", name: "North Central" },
  { slug: "northern", name: "Northern" },
  { slug: "tobago", name: "Tobago" },
  { slug: "transport-telecom", name: "Transport & Telecom" },
  { slug: "iatf", name: "IATF" },
  { slug: "siu", name: "SIU" },
  { slug: "special-branch", name: "Special Branch" },
  { slug: "mounted-and-k9", name: "Mounted & Canine" },
  { slug: "complaints", name: "Complaints" },
  { slug: "police-band", name: "Police Band" },
  { slug: "municipal", name: "Municipal" },
  { slug: "court-process", name: "Court & Process" },
  { slug: "community-oriented-policing", name: "Community Oriented Policing" },
  { slug: "traffic-highway-patrol", name: "Traffic & Highway Patrol" },
  { slug: "human-resource", name: "Human Resource" },
  { slug: "police-academy", name: "Police Academy" },
  { slug: "coastal-air-support", name: "Coastal & Air Support" },
  { slug: "cyber-social-media", name: "Cyber & Social Media" },
  { slug: "corporate-communications", name: "Corporate Communications" },
  { slug: "finance", name: "Finance" },
] as const;

export type CentralCommitteeRegionSlug =
  (typeof CENTRAL_COMMITTEE_REGIONS)[number]["slug"];

export function getRegionBySlug(slug: string) {
  return CENTRAL_COMMITTEE_REGIONS.find((r) => r.slug === slug);
}
