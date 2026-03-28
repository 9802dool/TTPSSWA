import type { CentralCommitteeRegionSlug } from "@/lib/central-committee-regions";

export type CommitteeRepresentative = {
  name: string;
  role: string;
  /** Short blurb for the card (not the full executive bio). */
  summary: string;
  phone?: string;
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
        role: "Central Committee Representative — IATF",
        summary: "Reg. No. 10364",
        phone: "(868) 612-0102",
        email: "darneldavid@live.com",
      },
      {
        name: "PC Nolan Tash",
        role: "Central Committee Representative — IATF",
        summary: "Reg. No. 10428",
        phone: "(868) 789-7497",
        email: "n_tash@hotmail.com",
      },
      {
        name: "PC Khamael Benoit",
        role: "Central Committee Representative — IATF",
        summary: "Reg. No. 20964",
        phone: "(868) 612-0102 ext. 75412",
        email: "Khamael24@gmail.com",
      },
    ],
  },
};
