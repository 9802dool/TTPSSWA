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

/** Long-form section (housing-style pages with sub-bullets). */
export type CommitteeRichSection = {
  title?: string;
  paragraphs: string[];
  bullets?: string[];
  /** Paragraph immediately after the bullet list. */
  afterBullets?: string;
};

/** Optional copy for committee detail pages (`/committees/[slug]`). */
export type CommitteeDetailContent = {
  /** SEO / social preview (optional). */
  metaDescription?: string;
  /** Hero supporting paragraph under the committee title. */
  heroDescription: string;
  /** Optional heading above the highlight list. */
  sectionHeading?: string;
  /** Main bullet points for this committee (simple list pages). */
  highlights?: string[];
  /** Intro line(s) between hero and body (e.g. overview sentence). */
  overviewIntro?: string;
  /** Structured sections; when set, rendered instead of `highlights`. */
  richSections?: CommitteeRichSection[];
};

export const COMMITTEE_DETAIL_CONTENT: Partial<
  Record<CommitteeSlug, CommitteeDetailContent>
> = {
  "housing-committee": {
    metaDescription:
      "TTPSSWA Housing Committee — HDC and LSA support, Hardware & Beyond, and Blue Legacy at Baker Trace, Sangre Grande.",
    heroDescription:
      "The Housing Committee is dedicated to helping members access affordable, secure, and sustainable housing opportunities. Through strategic partnerships and member-focused initiatives, the committee provides guidance, support, and pathways to homeownership and land acquisition.",
    overviewIntro:
      "Below is an overview of the key services and programmes managed or facilitated by the Housing Committee.",
    richSections: [
      {
        title: "Housing Development Corporation (HDC)",
        paragraphs: [
          "The committee assists members in navigating the Housing Development Corporation (HDC) application process.",
          "Support includes:",
        ],
        bullets: [
          "Guidance on eligibility and documentation",
          "Updates on available housing developments",
          "Advocacy to ensure members have fair access to opportunities",
        ],
        afterBullets:
          "This helps members move closer to owning a modern, government-supported home.",
      },
      {
        title: "Land Parcels Through the Land Settlement Agency",
        paragraphs: [
          "For members interested in building their own homes, the committee works with the Land Settlement Agency (LSA) to provide access to residential land parcels.",
          "The committee supports members by:",
        ],
        bullets: [
          "Sharing information on available parcels",
          "Assisting with application requirements",
          "Helping members understand land development and construction options",
        ],
        afterBullets: "This programme empowers members to build at their own pace.",
      },
      {
        title: "Hardware & Beyond Initiative",
        paragraphs: [
          "The Housing Committee also manages the Hardware and Beyond Initiative, which allows members to access building materials on credit.",
          "This initiative supports:",
        ],
        bullets: [
          "Home construction",
          "Renovations and expansions",
          "Completion of LSA or HDC projects",
        ],
        afterBullets:
          "It reduces financial strain and ensures members can access quality materials when they need them.",
      },
      {
        title: "Blue Legacy – Baker Trace, Sangre Grande",
        paragraphs: [
          "The committee provides members with priority information and support for Blue Legacy, a new housing development at Baker Trace, Sangre Grande.",
          "Members benefit from:",
        ],
        bullets: [
          "Early updates on project progress",
          "Guidance on application and allocation",
          "Access to modern, affordable housing options",
        ],
        afterBullets:
          "This development represents a long-term investment in community growth and member well-being.",
      },
      {
        paragraphs: [
          "The Housing Committee exists to support members on every step of their housing journey, whether they are applying for a home, securing land, building, or renovating.",
          "Its mission is simple: to make homeownership more accessible, affordable, and achievable for all members.",
        ],
      },
    ],
  },
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
      "TTPSSWA Events Committee — annual member and family events, anniversary programmes, and regional conferences including CFPA.",
    heroDescription:
      "The Events Committee plans and hosts activities that bring our members and their families together. The committee organizes major annual events such as the Christmas Dinner, Children’s Christmas Treat, Boatride, Divali Cultural Show, and the Protective Arms Monarch Competition.",
    richSections: [
      {
        paragraphs: [
          "It also coordinates large-scale initiatives, including the 30th Anniversary Week of Activities—featuring the Interfaith Thanksgiving Service, Fun and Family Day, Health Fair, Socarobics, Awards Ceremony, Curry Tabanca Cookout, Chow and All Fours Competition, Football Tournament, and the Executive & Central Committee Retreat.",
          "The committee further represents the organization by hosting regional gatherings such as the Caribbean Federation of Police Welfare Association 10th Intercessional Conference.",
          "In short, the Events Committee ensures a vibrant calendar of cultural, social, and family-focused activities for all members.",
        ],
      },
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
