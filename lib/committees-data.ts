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
  "education-committee": {
    metaDescription:
      "TTPSSWA Education Committee — grants, scholarships, book discounts, tertiary support, and Police Credit Union starter accounts for members’ children.",
    heroDescription:
      "The Education Committee supports members’ children and families with grants, scholarships, book discounts, and partnerships across Trinidad and Tobago.",
    sectionHeading: "Programmes and initiatives",
    highlights: [
      "SEA/CSEC/CAPE Grants and Awards function for members’ children across Trinidad and Tobago",
      "Book Store Discounts with Charran, Mohammed, Naipaul Holdings, Nelson’s Tobago",
      "Part Time and Full Time Tertiary Scholarship",
      "Tertiary Education Grant",
      "Book bartering initiative",
      "Starter Accounts partnering with Police Credit Union",
    ],
  },
  "events-committee": {
    metaDescription:
      "TTPSSWA Events Committee — seasonal events, cultural programmes, competitions, anniversary activities, and regional conferences.",
    heroDescription:
      "The Events Committee organises member gatherings, cultural celebrations, competitions, and milestone activities for the Association.",
    sectionHeading: "Events and activities",
    highlights: [
      "Christmas Dinner",
      "Children Christmas Treat",
      "Boatride",
      "Divali Cultural Show",
      "Protective Arms Monarch Competition",
      "30th Anniversary Week of Activities (Interfaith Thanksgiving Service, Fun and Family Day, Health Fair, Socarobics, Awards Ceremony, Curry Tabanca Cookout, Chow and All Fours Competition, Football Tournament, Executive and Central Committee Retreat)",
      "Hosting the Caribbean Federation of Police Welfare Association 10th Intercessional Conference",
    ],
  },
  "legal-aid-committee": {
    metaDescription:
      "TTPSSWA Legal Aid Committee — policy, legal assistance, tribunal and industrial court representation, and workmen’s compensation.",
    heroDescription:
      "The Legal Aid Committee advances policy, direct assistance, and representation for members in judicial, tribunal, and industrial matters.",
    sectionHeading: "Focus areas",
    highlights: [
      "Policy Revision",
      "Legal Aid Assistance",
      "Introduction of Judicial Reviews",
      "Maintained indictable and summary matters",
      "Tribunal Aid Training and Representation",
      "Industrial Court Representation",
      "Workmen’s Compensation",
    ],
  },
  "special-purpose-committee": {
    metaDescription:
      "TTPSSWA Special Purpose Committee — rule book, SRP and municipal representation, HR collaboration, and Special Reserve Police proposals.",
    heroDescription:
      "The Special Purpose Committee leads structural and regulatory initiatives that shape how the Association governs and represents SRP and municipal interests.",
    sectionHeading: "Priorities",
    highlights: [
      "Revised Association’s Rule Book",
      "Extension of SRP and Municipal placement on Executive",
      "Job evaluation exercise in collaboration with HR and CPO’s office",
      "Proposal re-Special Reserve Police Regulations",
      "Proposal for Special Reserve Police re promotion, absorption",
    ],
  },
};

export function getCommitteeDetailContent(slug: string) {
  return COMMITTEE_DETAIL_CONTENT[slug as CommitteeSlug];
}

export function getCommitteeBySlug(slug: string) {
  return COMMITTEES.find((c) => c.slug === slug);
}
