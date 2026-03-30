import type { CentralCommitteeRegionSlug } from "@/lib/central-committee-regions";

export type CommitteeRepresentative = {
  name: string;
  /** Optional subtitle (e.g. committee title). Omit when not needed. */
  role?: string;
  /** Short line (e.g. reg. no.). */
  summary: string;
  /** Square photo under `public/` — e.g. `/ex-pics/cc-rep/iatf-10364.jpg`. */
  photoSrc?: string;
  /** Single line when only one number is shown. */
  phone?: string;
  /** Optional work / cell split (e.g. both shown with labels). */
  workPhone?: string;
  cellPhone?: string;
  email?: string;
};

export type CommitteeRegionContent = {
  /** Optional intro under the hero (e.g. what this section/unit is). */
  intro?: string;
  representatives: CommitteeRepresentative[];
};

/**
 * Per-division CC Rep roster. Regions without an entry use the generic placeholder on the slug page.
 */
export const COMMITTEE_REPRESENTATIVES: Partial<
  Record<CentralCommitteeRegionSlug, CommitteeRegionContent>
> = {
  "port-of-spain": {
    intro:
      "Central Committee Representatives for Port of Spain are listed below.",
    representatives: [
      {
        name: "WPC Jamila Phillip",
        summary: "Reg. No. 19021",
        photoSrc: "/ex-pics/cc-rep/pos-19021.jpg",
        workPhone: "(868) 366-5353 ext. 6231395",
        email: "jamazingbeau@gmail.com",
      },
      {
        name: "W/Ag Sgt Giselle Thomas",
        summary: "Reg. No. 18264",
        photoSrc: "/ex-pics/cc-rep/pos-18264.jpg",
        workPhone: "(868) 281-7970",
        email: "gisellethomas22@gmail.com",
      },
    ],
  },
  iatf: {
    intro:
      "The Inter-Agency Task Force (IATF) is a specialized TTPS unit focused on joint operations and interdepartmental collaboration. Central Committee Representatives for this section are listed below.",
    representatives: [
      {
        name: "PC Darnel David",
        summary: "Reg. No. 10364",
        photoSrc: "/ex-pics/cc-rep/iatf-10364.jpg",
        phone: "(868) 612-0102",
        email: "darneldavid@live.com",
      },
      {
        name: "PC Nolan Tash",
        summary: "Reg. No. 10428",
        photoSrc: "/ex-pics/cc-rep/iatf-10428.jpg",
        phone: "(868) 789-7497",
        email: "n_tash@hotmail.com",
      },
      {
        name: "PC Khamael Benoit",
        summary: "Reg. No. 20964",
        photoSrc: "/ex-pics/cc-rep/iatf-20964.jpg",
        phone: "(868) 612-0102 ext. 75412",
        email: "Khamael24@gmail.com",
      },
    ],
  },
  siu: {
    intro:
      "Central Committee Representatives for SIU are listed below.",
    representatives: [
      {
        name: "Cpl Kwesi Carmona",
        summary: "Reg. No. 17065",
        photoSrc: "/ex-pics/cc-rep/siu-17065.jpg",
        workPhone: "(868) 612-2470 ext. 12032",
        email: "earlcarmona@hotmail.com",
      },
      {
        name: "Cpl Matthew Ramirez",
        summary: "Reg. No. 18392",
        photoSrc: "/ex-pics/cc-rep/siu-18392.jpg",
        workPhone: "(868) 740-1824",
        email: "matthew.ramirez@ttps.gov.tt",
      },
    ],
  },
  eastern: {
    intro:
      "Central Committee Representatives for the Eastern division are listed below.",
    representatives: [
      {
        name: "Sgt Ricardo Williams",
        summary: "Reg. No. 16116",
        photoSrc: "/ex-pics/cc-rep/eastern-16116.jpg",
        workPhone: "(868) 668-2502 ext. 71004-10",
        email: "rwilliams17@hotmail.com",
      },
      {
        name: "WPC Janelle Stephen-Sammy",
        summary: "Reg. No. 18071",
        photoSrc: "/ex-pics/cc-rep/eastern-18071.jpg",
        workPhone: "(868) 612-2470 ext. 71002/5",
        email: "janelle.sammy1010@gmail.com",
      },
      {
        name: "PC Selwyn Yee Shong",
        summary: "Reg. No. 9087",
        photoSrc: "/ex-pics/cc-rep/eastern-9087.jpg",
        workPhone: "(868) 612-2470 ext. 71070",
        cellPhone: "(868) 789-2901",
        email: "selwyn_34@yahoo.com",
      },
    ],
  },
  western: {
    intro:
      "Central Committee Representatives for the Western division are listed below.",
    representatives: [
      {
        name: "WPC Afiya Plentie",
        summary: "Reg. No. 18724",
        photoSrc: "/ex-pics/cc-rep/western-18724.jpg",
        workPhone: "(868) 637-3860 ext. 21370",
        email: "afiyastarr@gmail.com",
      },
      {
        name: "Ag Cpl Keishaa Duke",
        summary: "Reg. No. 20268",
        photoSrc: "/ex-pics/cc-rep/western-20268.jpg",
        workPhone: "(868) 622-3695 ext. 21019",
        email: "brewsterkd@gmail.com",
      },
      {
        name: "WPC Jiselle Douglas",
        summary: "Reg. No. 20822",
        photoSrc: "/ex-pics/cc-rep/western-20822.jpg",
        workPhone: "(868) 283-6754 ext. 6373123",
        email: "jisdouglas@outlook.com",
      },
    ],
  },
  "north-eastern": {
    intro:
      "Central Committee Representatives for North Eastern (NED) are listed below.",
    representatives: [
      {
        name: "W/Sgt Helen Solomon",
        summary: "Reg. No. 14953",
        photoSrc: "/ex-pics/cc-rep/ned-14953.jpg",
        workPhone: "(868) 674-0100",
        email: "helnak75@outlook.com",
      },
      {
        name: "W/Cpl Sonya George",
        summary: "Reg. No. 18586",
        photoSrc: "/ex-pics/cc-rep/ned-18586.jpg",
        workPhone: "(868) 627-2981",
        email: "sonya-george@hotmail.com",
      },
      {
        name: "Ag Sgt Shelley Durant",
        summary: "Reg. No. 17164",
        photoSrc: "/ex-pics/cc-rep/ned-17164.jpg",
        workPhone: "(868) 674-0100 ext. 75706/75707",
        email: "lovable-sd@live.com",
      },
    ],
  },
  central: {
    intro:
      "Central Committee Representatives for the Central division are listed below.",
    representatives: [
      {
        name: "Sgt Jacey Small",
        summary: "Reg. No. 16589",
        photoSrc: "/ex-pics/cc-rep/central-16589.jpg",
        workPhone: "(868) 612-2470 ext. 30050-60 / 30100",
        email: "jaceysmall@hotmail.com",
      },
      {
        name: "Sgt Marlon King",
        summary: "Reg. No. 13137",
        photoSrc: "/ex-pics/cc-rep/central-13137.jpg",
        workPhone: "(868) 612-2470 ext. 30030",
        cellPhone: "(868) 384-1919",
        email: "maklaf@hotmail.com",
      },
      {
        name: "WPC Shimerle Sampson",
        summary: "Reg. No. 5769",
        photoSrc: "/ex-pics/cc-rep/central-5769.jpg",
        workPhone: "(868) 612-0301 ext 30255",
        email: "glamempress@proton.me",
      },
    ],
  },
};
