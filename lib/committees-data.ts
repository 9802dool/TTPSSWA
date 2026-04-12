/** Committees list with stable URL slugs for detail pages. */
export const COMMITTEES = [
  { id: 1, slug: "education-committee", title: "Education Committee" },
  { id: 2, slug: "events-committee", title: "Events Committee" },
  { id: 3, slug: "welfare-committee", title: "Welfare Committee" },
  { id: 4, slug: "entrepreneur-committee", title: "Entrepreneur Committee" },
  { id: 5, slug: "communication-committee", title: "Communication Committee" },
  { id: 6, slug: "housing-committee", title: "Housing Committee" },
  { id: 7, slug: "transitioning-committee", title: "Transitioning Committee" },
  { id: 8, slug: "special-projects-committee", title: "Special Projects Committee" },
  { id: 9, slug: "special-purpose-committee", title: "Special Purpose Committee" },
  { id: 10, slug: "tobago-committee", title: "Tobago Committee" },
  { id: 11, slug: "marketing-committee", title: "Marketing Committee" },
  { id: 12, slug: "municipal-committee", title: "Municipal Committee" },
  { id: 13, slug: "srp-committee", title: "SRP Committee" },
  { id: 14, slug: "disciplinary-committee", title: "Disciplinary Committee" },
  { id: 15, slug: "finance-committee", title: "Finance Committee" },
  { id: 16, slug: "legal-aid-committee", title: "Legal Aid Committee" },
  { id: 17, slug: "elections-committee", title: "Elections Committee" },
] as const;

export type CommitteeSlug = (typeof COMMITTEES)[number]["slug"];

export function getCommitteeBySlug(slug: string) {
  return COMMITTEES.find((c) => c.slug === slug);
}
