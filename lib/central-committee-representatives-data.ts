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
  geb: {
    intro:
      "Central Committee Representatives for GEB are listed below.",
    representatives: [
      {
        name: "Sgt Ricardo Williams",
        summary: "Reg. No. 16116",
        photoSrc: "/ex-pics/cc-rep/geb-16116.jpg",
        phone: "(868) 668-2502 ext. 71004-10",
        email: "rwilliams17@hotmail.com",
      },
      {
        name: "WPC Janelle Stephen-Sammy",
        summary: "Reg. No. 18071",
        photoSrc: "/ex-pics/cc-rep/geb-18071.jpg",
        phone: "(868) 612-2470 ext. 71002/5",
        email: "janelle.sammy1010@gmail.com",
      },
      {
        name: "PC Selwyn Yee Shong",
        summary: "Reg. No. 9087",
        photoSrc: "/ex-pics/cc-rep/geb-9087.jpg",
        phone: "(868) 789-2901 ext. 71070",
        email: "selwyn_34@yahoo.co",
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
