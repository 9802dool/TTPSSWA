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

/** Optional copy for committee detail pages (`/committees/[slug]`). */
export type CommitteeDetailContent = {
  /** SEO / social preview (optional). */
  metaDescription?: string;
  /** Hero supporting paragraph under the committee title. */
  heroDescription: string;
  /** Optional heading above the highlight list. */
  sectionHeading?: string;
  /** Main bullet points for this committee. */
  highlights: string[];
};

export const COMMITTEE_DETAIL_CONTENT: Partial<
  Record<CommitteeSlug, CommitteeDetailContent>
> = {
  "communication-committee": {
    metaDescription:
      "TTPSSWA Communication Committee — social media, Zoom, podcasts, bulletins, and I 95 FM radio every Wednesday.",
    heroDescription:
      "The Communication Committee keeps members informed through social media, virtual and hybrid meetings, live broadcasts, print, and radio.",
    sectionHeading: "Channels and activities",
    highlights: [
      "Sharing of information via social media platforms such as Instagram, Facebook, YouTube, TikTok",
      "Virtual and Hybrid meetings via Zoom",
      "Podcasts/Facebook Live",
      "Posters/Bulletins",
      "Radio Program on I 95 FM every Wednesday (conversations with the Executive, Bacchanal Wednesday, meeting the various committee members and learning about their functions)",
    ],
  },
};

export function getCommitteeDetailContent(slug: string) {
  return COMMITTEE_DETAIL_CONTENT[slug as CommitteeSlug];
}

export function getCommitteeBySlug(slug: string) {
  return COMMITTEES.find((c) => c.slug === slug);
}
