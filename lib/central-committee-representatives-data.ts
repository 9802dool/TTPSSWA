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
      "The Inter-Agency Task Force (IATF) is a specialized TTPS unit focused on joint operations and interdepartmental collaboration. Your Central Committee Representative for this section is listed below.",
    representatives: [
      {
        name: "Sergeant Jason Johnson",
        role: "Central Committee Representative — IATF",
        summary:
          "Sergeant Johnson is currently assigned to the Inter Agency Task Force and has also served in the Western Division. He is a Trustee of the TTPS Social and Welfare Association and a former Treasurer and Central Committee Representative, with a strong record in financial stewardship and officer advocacy. He holds a BSc in Political Science (minor in Criminology), is pursuing a Law Degree, and holds certifications including Radiological Security, Heavy Equipment Operations, and Emergency Medical Training.",
      },
    ],
  },
};
