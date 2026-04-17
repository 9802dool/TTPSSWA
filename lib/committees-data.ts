/** Committees list with stable URL slugs and optional per-committee content. */
export type Committee = {
  id: number;
  slug: string;
  title: string;
  /** Short lead paragraph shown in the page hero. */
  summary?: string;
  /** Bulleted list of channels, services, or activities. */
  channels?: readonly string[];
};

export const COMMITTEES: readonly Committee[] = [
  { id: 1, slug: "education-committee", title: "Education Committee" },
  { id: 2, slug: "events-committee", title: "Events Committee" },
  { id: 3, slug: "welfare-committee", title: "Welfare Committee" },
  { id: 4, slug: "entrepreneur-committee", title: "Entrepreneur Committee" },
  {
    id: 5,
    slug: "communication-committee",
    title: "Communication Committee",
    summary:
      "The Communication Committee keeps TTPSSWA members informed, connected, and engaged. We share timely news and updates from the Association through a broad mix of digital, broadcast, and print channels, and we provide members with direct access to the Executive and to every committee.",
    channels: [
      "Official social media presence across Instagram, Facebook, YouTube, and TikTok, where announcements, highlights, and member-focused content are published regularly.",
      "Virtual and hybrid meetings hosted via Zoom, allowing members across Trinidad and Tobago to participate in association business remotely.",
      "Podcasts and live broadcasts on Facebook Live, providing in-depth discussions on issues affecting members and their families.",
      "Official posters and bulletins distributed online and at divisional stations to communicate notices, events, and member benefits.",
      "A dedicated weekly radio program on I 95 FM every Wednesday, featuring conversations with the Executive, the popular Bacchanal Wednesday segment, and introductions to each committee and the work its members do on behalf of the Association.",
    ],
  },
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
];

export type CommitteeSlug = (typeof COMMITTEES)[number]["slug"];

export function getCommitteeBySlug(slug: string) {
  return COMMITTEES.find((c) => c.slug === slug);
}
