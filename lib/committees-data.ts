/** Officer shown on a committee page, using the same card shape as Central Committee representatives. */
export type CommitteeMember = {
  name: string;
  /** Committee post (e.g. Chairman). */
  role?: string;
  /** Short line under the name (e.g. reg. no. and division). */
  summary?: string;
  /** Square photo under `public/`. */
  photoSrc?: string;
  phone?: string;
  email?: string;
};

/** Committees list with stable URL slugs and optional per-committee content. */
export type Committee = {
  id: number;
  slug: string;
  title: string;
  /** Short lead paragraph shown in the page hero. */
  summary?: string;
  /** Optional heading above the bullet list (defaults on the detail page). */
  channelsHeading?: string;
  /** Bulleted list of channels, services, or activities. */
  channels?: readonly string[];
  /** Named officers for this committee. */
  members?: readonly CommitteeMember[];
};

export const COMMITTEES: readonly Committee[] = [
  {
    id: 1,
    slug: "education-committee",
    title: "Education Committee",
    summary:
      "The Education Committee supports members’ children and families by widening access to learning—from national examinations through tertiary study—through grants, scholarships, bookstore partnerships, and practical programmes that make education more affordable and achievable.",
    channels: [
      "SEA, CSEC, and CAPE grants and awards for members’ children across Trinidad and Tobago.",
      "Bookstore discounts with Charran’s, Mohammed’s, Naipaul Holdings, and Nelson’s (Tobago).",
      "Part-time and full-time tertiary scholarships.",
      "Tertiary education grants.",
      "Book bartering initiative.",
      "Starter accounts in partnership with the Police Credit Union.",
    ],
    members: [
      {
        name: "W/Ag ASP Nathalie John",
        role: "Executive",
        phone: "(868) 798-5562",
      },
      {
        name: "W/Sgt Etta Brown",
        role: "Chairman",
        summary: "Reg. No. 14120 · HRB",
        phone: "(868) 794-1686",
      },
      {
        name: "W/Ag Cpl Rachel George-Thomas",
        role: "Secretary",
        summary: "Reg. No. 19860 · ACIB",
        phone: "(868) 739-7230",
      },
    ],
  },
  {
    id: 2,
    slug: "events-committee",
    title: "Events Committee",
    summary:
      "The Events Committee plans and delivers flagship member and family programmes, cultural celebrations, and regional gatherings that strengthen camaraderie and showcase the Association at home and across the Caribbean.",
    channels: [
      "Christmas dinner.",
      "Children’s Christmas treat.",
      "Boat cruise.",
      "Divali cultural show.",
      "Protective Arms Monarch competition.",
      "30th anniversary week of activities: interfaith thanksgiving service, fun and family day, health fair, socarobics, awards ceremony, curry tabanca cookout, chow and all fours competition, football tournament, and executive and central committee retreat.",
      "Hosting the Caribbean Federation of Police Welfare Associations’ 10th intersessional conference.",
    ],
    members: [
      {
        name: "Sgt Adrian Andrews",
        role: "Executive",
        summary: "Reg. No. 13281 · Central Division",
        phone: "(868) 763-5033",
      },
      {
        name: "Cpl Fermine-Garcia",
        role: "Chairman",
        summary: "Reg. No. 17930 · North Eastern Division",
        phone: "(868) 313-1727",
      },
      {
        name: "WPC Shivonne Baptiste",
        role: "Secretary",
        summary: "Reg. No. 12345 · POS Municipal",
        phone: "(868) 713-2929",
      },
    ],
  },
  {
    id: 3,
    slug: "welfare-committee",
    title: "Welfare Committee",
    summary:
      "The Welfare Committee provides relief, care, and practical support for members and their families in times of hardship, disaster, or incarceration, and helps maintain dignity and opportunity through targeted assistance and outreach.",
    channels: [
      "Grocery and fruit hampers.",
      "Flood and fire relief.",
      "Daycare partnership.",
      "Financial and medical aid for affected members.",
      "Quarterly prison visits and financial contributions to incarcerated officers (for example industrial fans, coolers, and trolley wheels).",
      "Outreach extended to incarcerated officers’ family members and children.",
      "Promotion study material and interview preparation for incarcerated officers.",
    ],
  },
  {
    id: 4,
    slug: "entrepreneur-committee",
    title: "Entrepreneur Committee",
    members: [
      {
        name: "W/Ag Sgt Tricia Durant-Charles",
        role: "Executive",
        summary: "Reg. No. 16940 · Special Victims",
        phone: "(868) 336-7776",
      },
      {
        name: "Sgt Jacey Small",
        role: "Chairman",
        summary: "Reg. No. 16589 · Central Division",
        phone: "(868) 282-8256",
      },
      {
        name: "WPC Thompson",
        role: "Vice Chairman",
        summary: "Reg. No. 20617 · Special Branch",
      },
      {
        name: "WPC McClatchie-Gabriel",
        role: "Secretary",
        summary: "Reg. No. 19079 · Special Victims",
        phone: "(868) 282-4555",
      },
    ],
  },
  {
    id: 5,
    slug: "communication-committee",
    title: "Communication Committee",
    summary:
      "The Communication Committee keeps TTPSSWA members informed, connected, and engaged. We share timely news and updates from the Association through a broad mix of digital, broadcast, and print channels, and we provide members with direct access to the Executive and to every committee.",
    channelsHeading: "How we keep members informed",
    channels: [
      "Official social media presence across Instagram, Facebook, YouTube, and TikTok, where announcements, highlights, and member-focused content are published regularly.",
      "Virtual and hybrid meetings hosted via Zoom, allowing members across Trinidad and Tobago to participate in association business remotely.",
      "Podcasts and live broadcasts on Facebook Live, providing in-depth discussions on issues affecting members and their families.",
      "Official posters and bulletins distributed online and at divisional stations to communicate notices, events, and member benefits.",
      "A dedicated weekly radio program on I 95 FM every Wednesday, featuring conversations with the Executive, the popular Bacchanal Wednesday segment, and introductions to each committee and the work its members do on behalf of the Association.",
    ],
    members: [
      {
        name: "Ag ASP Ishmael Pitt",
        role: "Executive Office",
        photoSrc: "/ex-pics/p1.JPG",
        phone: "(868) 487-5093",
      },
      {
        name: "Sgt Marlon King",
        role: "Chairman",
        summary: "Reg. No. 13137 · Central Division",
        photoSrc: "/ex-pics/cc-rep/central-13137.jpg",
        phone: "(868) 384-1919",
      },
      {
        name: "Ag Sgt Adrian Smith",
        role: "Secretary",
        summary: "Reg. No. 16854 · PSB",
        phone: "(868) 749-2920",
      },
      {
        name: "WPC Calisha Harry",
        role: "Information Manager",
        summary: "Reg. No. 19415 · GEB",
        photoSrc: "/ex-pics/cc-rep/geb-19415.jpg",
        phone: "(868) 492-0291",
      },
    ],
  },
  {
    id: 6,
    slug: "housing-committee",
    title: "Housing Committee",
    summary:
      "The Housing Committee helps members secure housing and land, and access building materials and development opportunities in partnership with public agencies and approved private-sector programmes.",
    channels: [
      "HDC homes for members.",
      "Parcels of land through the Land Settlement Agency (LSA).",
      "Hardware and Beyond initiative (building materials on credit).",
      "Blue Legacy housing development at Baker Trace, Sangre Grande.",
    ],
    members: [
      {
        name: "Ag ASP Owie Russell",
        role: "Executive",
        summary: "Corporate Communications",
        phone: "(868) 787-4478",
      },
      {
        name: "Insp Mohammed",
        role: "Chairman",
        summary: "Reg. No. 10694 · Police Academy",
        phone: "(868) 350-5460",
      },
      {
        name: "W/Sgt Andrews",
        role: "Secretary",
        summary: "Reg. No. 16700 · Complaints",
        phone: "(868) 383-4717",
      },
    ],
  },
  { id: 7, slug: "transitioning-committee", title: "Transitioning Committee" },
  {
    id: 8,
    slug: "special-projects-committee",
    title: "Special Projects Committee",
    summary:
      "The Special Projects Committee delivers high-profile recognition programmes and major capital initiatives that honour members and expand the Association’s facilities and long-term value for the membership.",
    channels: [
      "President’s Award.",
      "First annual retirees function.",
      "Approvals for the Waterloo project: a multi-purpose complex including a PriceSmart-style supermarket, indoor range, office space, auditorium, kiosk, sports bar, and members club.",
      "Surveying of the outdoor range in Cumuto (in partnership with the TTPS Range).",
    ],
  },
  {
    id: 9,
    slug: "special-purpose-committee",
    title: "Special Purpose Committee",
    summary:
      "The Special Purpose Committee advances governance, representation, and human-resources alignment so the rule book, executive composition, and Special Reserve Police matters reflect members’ needs and national policy direction.",
    channels: [
      "Revised association rule book.",
      "Extension of SRP and municipal placement on the executive.",
      "Job evaluation exercise in collaboration with HR and the Office of the Commissioner of Police.",
      "Proposals regarding Special Reserve Police regulations.",
      "Proposals regarding Special Reserve Police promotion and absorption.",
    ],
  },
  {
    id: 10,
    slug: "tobago-committee",
    title: "Tobago Committee",
    summary:
      "The Tobago Committee develops and upgrades facilities and services that support members and operations on the sister isle.",
    channels: [
      "Upgraded Tobago building: rooms, air conditioning, and security gate.",
      "Construction of a swimming pool.",
      "Tobago mess.",
    ],
  },
  { id: 11, slug: "marketing-committee", title: "Marketing Committee" },
  { id: 12, slug: "municipal-committee", title: "Municipal Committee" },
  { id: 13, slug: "srp-committee", title: "SRP Committee" },
  { id: 14, slug: "disciplinary-committee", title: "Disciplinary Committee" },
  { id: 15, slug: "finance-committee", title: "Finance Committee" },
  {
    id: 16,
    slug: "legal-aid-committee",
    title: "Legal Aid Committee",
    summary:
      "The Legal Aid Committee strengthens policy and delivers training and representation so members are supported in criminal, disciplinary, tribunal, industrial, and workplace-injury matters.",
    channels: [
      "Policy revision.",
      "Legal aid assistance.",
      "Introduction of judicial reviews.",
      "Ongoing casework in indictable and summary matters.",
      "Tribunal aid, training, and representation.",
      "Industrial Court representation.",
      "Workmen’s compensation.",
    ],
  },
  {
    id: 17,
    slug: "elections-committee",
    title: "Elections Committee",
    summary:
      "The Elections Committee plans and runs transparent, orderly elections for the Association’s governing bodies, in line with the rule book and membership expectations.",
    channels: [
      "Conducted an incident-free and transparent election for Central Committee representatives for the period 2023–2025.",
      "Oversees the next executive and Central Committee elections for the period 2025–2027.",
    ],
  },
];

export type CommitteeSlug = (typeof COMMITTEES)[number]["slug"];

export function getCommitteeBySlug(slug: string) {
  return COMMITTEES.find((c) => c.slug === slug);
}
