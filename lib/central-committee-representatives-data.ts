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
  "special-branch": {
    intro:
      "Central Committee Representatives for Special Branch are listed below.",
    representatives: [
      {
        name: "Cpl Joshua Balfour",
        summary: "Reg. No. 16976",
        photoSrc: "/ex-pics/cc-rep/sb-16976.jpg",
        workPhone: "(868) 687-5860 ext. 13090",
        email: "joshuabalfour@yahoo.com",
      },
      {
        name: "W/Cpl Donna Marshall-John",
        summary: "Reg. No. 18551",
        photoSrc: "/ex-pics/cc-rep/sb-18551.jpg",
        workPhone: "(868) 627-5217 ext. 12057/12005",
        email: "donnajohn626@gmail.com",
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
  tobago: {
    intro:
      "Central Committee Representatives for Tobago are listed below.",
    representatives: [
      {
        name: "Ag Cpl Sekou Moses",
        summary: "Reg. No. 20279",
        photoSrc: "/ex-pics/cc-rep/tobago-20279.jpg",
        workPhone: "(868) 639-2515",
        email: "sekou.moses@ttps.gov.tt",
      },
    ],
  },
  "transport-telecom": {
    intro:
      "Central Committee Representatives for Transport & Telecom are listed below.",
    representatives: [
      {
        name: "Cpl Jason Pascall",
        summary: "Reg. No. 16964",
        photoSrc: "/ex-pics/cc-rep/transport-telecom-16964.jpg",
        workPhone: "(868) 675-0567",
        email: "jason_pascall@yahoo.com",
      },
    ],
  },
  "south-western": {
    intro:
      "Central Committee Representatives for South Western are listed below.",
    representatives: [
      {
        name: "PC Aelon Andrews",
        summary: "Reg. No. 19252",
        photoSrc: "/ex-pics/cc-rep/sw-19252.jpg",
        workPhone: "(868) 678-9748 / (868) 647-8888",
        email: "Aelon.Andrews@ttps.gov.tt",
      },
      {
        name: "Ag Sgt Avelon Monsegue",
        summary: "Reg. No. 17225",
        photoSrc: "/ex-pics/cc-rep/sw-17225.jpg",
        workPhone: "(868) 649-2333",
        email: "avelondiamond@gmail.com",
      },
    ],
  },
  southern: {
    intro:
      "Central Committee Representatives for Southern are listed below.",
    representatives: [
      {
        name: "Sgt Kashmear Rosan",
        summary: "Reg. No. 14791",
        photoSrc: "/ex-pics/cc-rep/southern-14791.jpg",
        workPhone: "(868) 360-1316 ext. 6530735",
        email: "krosan54321@gmail.com",
      },
      {
        name: "W/Cpl Jisselle Ballantyne",
        summary: "Reg. No. 18084",
        photoSrc: "/ex-pics/cc-rep/southern-18084.jpg",
        workPhone: "(868) 652-3206 ext. 43000",
        email: "jisselle-torres@hotmail.com",
      },
      {
        name: "WPC Trisha Cupid",
        summary: "Reg. No. 7003",
        photoSrc: "/ex-pics/cc-rep/southern-7003.jpg",
        workPhone: "(868) 721-1816 ext. 6552231",
        email: "trishacupid42@gmail.com",
      },
    ],
  },
  "mounted-and-k9": {
    intro:
      "Central Committee Representatives for Mounted & Canine are listed below.",
    representatives: [
      {
        name: "Cpl Tamika Tannis",
        summary: "Reg. No. 18542",
        photoSrc: "/ex-pics/cc-rep/mounted-k9-18542.jpg",
        workPhone: "(868) 612-2470 ext. 21205",
        email: "kakatannis@yahoo.com",
      },
    ],
  },
  complaints: {
    intro:
      "Central Committee Representatives for Complaints are listed below.",
    representatives: [
      {
        name: "W/Sgt Ria Montique-Clement",
        summary: "Reg. No. 14657",
        photoSrc: "/ex-pics/cc-rep/complaints-14657.jpg",
        workPhone: "(868) 653-8110",
        cellPhone: "(868) 352-9324",
        email: "Ria.Montique-Clement@ttps.gov.tt",
      },
    ],
  },
  "police-band": {
    intro:
      "Central Committee Representatives for Police Band are listed below.",
    representatives: [
      {
        name: "Ag Sgt Derick Thomas",
        summary: "Reg. No. 17206",
        photoSrc: "/ex-pics/cc-rep/police-band-17206.jpg",
        workPhone: "(868) 612-2470 ext. 13560",
        email: "derickthomas2@hotmail.com",
      },
    ],
  },
  municipal: {
    intro:
      "Central Committee Representatives for Municipal are listed below.",
    representatives: [
      {
        name: "Ag Sgt Vanessa Williams",
        summary: "Reg. No. 3206",
        photoSrc: "/ex-pics/cc-rep/municipal-3206.jpg",
        workPhone: "(868) 299-0870 ext. 2326",
        email: "vmelville64@gmail.com",
      },
      {
        name: "WPC Shivonne Baptiste",
        summary: "Reg. No. 12345",
        photoSrc: "/ex-pics/cc-rep/municipal-12345.jpg",
        workPhone: "(868) 299-0870 ext. 4",
        email: "shivonnebapiste7@gmail.com",
      },
      {
        name: "WPC Dashia Luke",
        summary: "Reg. No. 12361",
        photoSrc: "/ex-pics/cc-rep/municipal-12361.jpg",
        workPhone: "(868) 299-0870 ext. 2804/2806/2807",
        email: "dashialuke364@yahoo.com",
      },
    ],
  },
  "court-process": {
    intro:
      "Central Committee Representatives for Court & Process are listed below.",
    representatives: [
      {
        name: "Sgt Anthony Pierre",
        summary: "Reg. No. 16102",
        photoSrc: "/ex-pics/cc-rep/court-process-16102.jpg",
        workPhone: "(868) 612-2470 ext. 13937",
        email: "anthonyjpierre@gmail.com",
      },
      {
        name: "WPC Kamaria Guy",
        summary: "Reg. No. 7245",
        photoSrc: "/ex-pics/cc-rep/court-process-7245.jpg",
        workPhone: "(868) 387-8313 ext. 13940",
        email: "fayolakguy@gmail.com",
      },
    ],
  },
  "community-oriented-policing": {
    intro:
      "Central Committee Representatives for Community Oriented Policing are listed below.",
    representatives: [
      {
        name: "WPC Linda Alleyne",
        summary: "Reg. No. 20005",
        photoSrc: "/ex-pics/cc-rep/cop-20005.jpg",
        workPhone: "(868) 333-3071 ext. 13100",
        email: "alleynelinda@yahoo.com",
      },
      {
        name: "PC Lawrence Bradshaw",
        summary: "Reg. No. 21082",
        photoSrc: "/ex-pics/cc-rep/cop-21082.jpg",
        workPhone: "(868) 612-0301 ext. 13100",
        email: "lawrencebradshaw75@gmail.com",
      },
    ],
  },
  "traffic-highway-patrol": {
    intro:
      "Central Committee Representatives for Traffic & Highway Patrol are listed below.",
    representatives: [
      {
        name: "A/Sgt Kizzie Marcelle",
        summary: "Reg. No. 17180",
        photoSrc: "/ex-pics/cc-rep/thp-17180.jpg",
        workPhone: "(868) 674-1822 ext. 75262",
        email: "michellemarcelle@hotmail.com",
      },
      {
        name: "W/Cpl Giselle Lakhan",
        summary: "Reg. No. 17553",
        photoSrc: "/ex-pics/cc-rep/thp-17553.jpg",
        workPhone: "(868) 674-1822 ext. 75262",
        email: "gisellelakhan27@gmail.com",
      },
      {
        name: "WPC Patrice Williams",
        summary: "Reg. No. 9795",
        photoSrc: "/ex-pics/cc-rep/thp-9795.jpg",
        workPhone: "(868) 674-1822",
      },
    ],
  },
  "north-central": {
    intro:
      "Central Committee Representatives for North Central are listed below.",
    representatives: [
      {
        name: "WPC Selma Adams",
        summary: "Reg. No. 18541",
        photoSrc: "/ex-pics/cc-rep/nc-18541.jpg",
        workPhone: "(868) 662-2522 ext. 6624038",
        email: "selma.adams@ttps.gov.tt",
      },
      {
        name: "WPC Michelle Olliverrie",
        summary: "Reg. No. 5303",
        photoSrc: "/ex-pics/cc-rep/nc-5303.jpg",
        workPhone: "(868) 692-6724",
        email: "michelle1olliverrie@gmail.com",
      },
    ],
  },
  northern: {
    intro:
      "Central Committee Representatives for Northern are listed below.",
    representatives: [
      {
        name: "Sgt Timmy Naitram",
        summary: "Reg. No. 16555",
        photoSrc: "/ex-pics/cc-rep/northern-16555.jpg",
        workPhone: "(868) 720-9444 ext. 61015",
        email: "timmynaitram@gmail.com",
      },
      {
        name: "WPC Lindy Mohammed",
        summary: "Reg. No. 19697",
        photoSrc: "/ex-pics/cc-rep/northern-19697.jpg",
        workPhone: "(868) 667-3563 ext. 61027 / 61041",
      },
      {
        name: "WPC Kim Hamit",
        summary: "Reg. No. 10200",
        photoSrc: "/ex-pics/cc-rep/northern-10200.jpg",
        workPhone: "(868) 686-6120 ext. 61031",
        email: "kimhamit@gmail.com",
      },
    ],
  },
  "human-resource": {
    intro:
      "Central Committee Representatives for Human Resource are listed below.",
    representatives: [
      {
        name: "Ag Insp Kevin Denny",
        summary: "Reg. No. 14251",
        photoSrc: "/ex-pics/cc-rep/hr-14251.jpg",
        workPhone: "(868) 627-5217 ext. 12494/12402",
        email: "kevindenny1973@gmail.com",
      },
      {
        name: "Ag/Cpl Collin Marcelin",
        summary: "Reg. No. 18075",
        photoSrc: "/ex-pics/cc-rep/hr-18075.jpg",
        workPhone: "(868) 627-5217 ext. 12409/12400",
        email: "marcelincollin@gmail.com",
      },
    ],
  },
  "police-academy": {
    intro:
      "Central Committee Representatives for Police Academy are listed below.",
    representatives: [
      {
        name: "Sgt Zalika Mills",
        summary: "Reg. No. 16697",
        photoSrc: "/ex-pics/cc-rep/pa-16697.jpg",
        workPhone: "(868) 623-3171 ext. 22102-22106",
        email: "zalika.mills@ttps.gov.tt",
      },
      {
        name: "Cpl Kevon Beatrice",
        summary: "Reg. No. 17057",
        photoSrc: "/ex-pics/cc-rep/pa-17057.jpg",
        workPhone: "(868) 622-3171 ext. 22102-22106",
        email: "simone.thomas@ttps.gov.tt",
      },
    ],
  },
  "coastal-air-support": {
    intro:
      "Central Committee Representatives for Coastal & Air Support are listed below.",
    representatives: [
      {
        name: "WPC Wendy Guevara",
        summary: "Reg. No. 19618",
        photoSrc: "/ex-pics/cc-rep/cas-19618.jpg",
        workPhone: "(868) 499-5475 ext. 21051",
        email: "wendy.guevaratt@ttps.gov.tt",
      },
    ],
  },
  "cyber-social-media": {
    intro:
      "Central Committee Representatives for Cyber & Social Media are listed below.",
    representatives: [
      {
        name: "PC Vimal Boodoo",
        summary: "Reg. No. 10799",
        photoSrc: "/ex-pics/cc-rep/cyber-10799.jpg",
        workPhone: "(868) 715-2072 ext. 13232",
        email: "vimal.boodoo@ttps.gov.tt",
      },
    ],
  },
  "corporate-communications": {
    intro:
      "Central Committee Representatives for Corporate Communications are listed below.",
    representatives: [
      {
        name: "W/Cpl Lovenia Warner",
        summary: "Reg. No. 16419",
        photoSrc: "/ex-pics/cc-rep/corpcomm-16419.jpg",
        workPhone: "(868) 627-5217 ext. 12210",
        email: "reachlovenia@gmail.com",
      },
    ],
  },
  finance: {
    intro:
      "Central Committee Representatives for Finance are listed below.",
    representatives: [
      {
        name: "W/Ag Cpl Simone Skeete",
        summary: "Reg. No. 19725",
        photoSrc: "/ex-pics/cc-rep/fin-19725.jpg",
        workPhone: "(868) 612-0102 ext. 12306-12308",
        email: "simoneskeete19@gmail.com",
      },
    ],
  },
  geb: {
    intro: "Central Committee Representatives for GEB are listed below.",
    representatives: [
      {
        name: "Cpl Clinton Glasgow",
        summary: "Reg. No. 17048",
        photoSrc: "/ex-pics/cc-rep/geb-17048.jpg",
        workPhone: "(868) 675-5759",
        email: "clintonglasgow@outlook.com",
      },
      {
        name: "WPC Calisha E Harry",
        summary: "Reg. No. 19415",
        photoSrc: "/ex-pics/cc-rep/geb-19415.jpg",
        workPhone: "(868) 674-6316 ext. 75443",
        email: "calishaharry98@gmail.com",
      },
    ],
  },
  "fraud-squad": {
    intro:
      "Central Committee Representatives for Fraud Squad are listed below.",
    representatives: [
      {
        name: "Sgt (Ag) Terrence Hamilton",
        summary: "Reg. No. 14690",
        photoSrc: "/ex-pics/cc-rep/fraud-14690.jpg",
        workPhone: "(868) 739-5875 ext. 15020",
        email: "terrence2109@gmail.com",
      },
    ],
  },
  "cid-cro": {
    intro:
      "Central Committee Representatives for CID / CRO are listed below.",
    representatives: [
      {
        name: "PC Che Duprey",
        summary: "Reg. No. 14523",
        photoSrc: "/ex-pics/cc-rep/cid-14523.jpg",
        workPhone: "(868) 612-2470 ext. 12888-13870",
        email: "cheduprey@gmail.com",
      },
      {
        name: "Cpl Ryan Ramoutar",
        summary: "Reg. No. 1709",
        photoSrc: "/ex-pics/cc-rep/cid-1709.jpg",
        workPhone: "(868) 768-8203 ext. 13865",
        email: "ramoutar17090@gmail.com",
      },
    ],
  },
  "special-victims": {
    intro:
      "Central Committee Representatives for Special Victims are listed below.",
    representatives: [
      {
        name: "Cpl Fay-Anne Worrell Lopez",
        summary: "Reg. No. 17913",
        photoSrc: "/ex-pics/cc-rep/sv-17913.jpg",
        workPhone: "(868) 797-7692 ext. 16073",
        email: "fayanneworrelllopez@gmail.com",
      },
      {
        name: "Cpl Abigail Simmons",
        summary: "Reg. No. 19197",
        photoSrc: "/ex-pics/cc-rep/sv-19197.jpg",
        workPhone: "(868) 612-2470 ext. 66013",
        email: "abigail.simmons@ttps.gov.tt",
      },
    ],
  },
  psb: {
    intro: "Central Committee Representatives for PSB are listed below.",
    representatives: [
      {
        name: "W/Ag Cpl Candice Sampson",
        summary: "Reg. No. 18828",
        photoSrc: "/ex-pics/cc-rep/psb-18828.jpg",
        workPhone: "(868) 612-2470 ext. 11111",
        email: "candicejsampson@outlook.com",
      },
    ],
  },
  occ: {
    intro: "Central Committee Representatives for OCC are listed below.",
    representatives: [
      {
        name: "WPC Avalon Phillip",
        summary: "Reg. No. 17129",
        photoSrc: "/ex-pics/cc-rep/occ-17129.jpg",
        workPhone: "(868) 708-0234 ext. 13522",
        email: "hott_ava@yahoo.com",
      },
    ],
  },
  homicide: {
    intro:
      "Central Committee Representatives for Homicide are listed below.",
    representatives: [
      {
        name: "Ag Sgt Anika Jules",
        summary: "Reg. No. 13587",
        photoSrc: "/ex-pics/cc-rep/hom-13587.jpg",
        workPhone: "(868) 267-4059",
        email: "anikajules1@gmail.com",
      },
      {
        name: "PC Johnan Salvary",
        role: "Region One, Tobago Sub Office",
        summary: "Reg. No. 19978",
        photoSrc: "/ex-pics/cc-rep/hom-19978.jpg",
        workPhone: "(868) 612-2470 ext. 14085/14086",
        email: "johnan.salvary@ttps.gov.tt",
      },
      {
        name: "WPC Renee Blackman-Singh",
        summary: "Reg. No. 20263",
        photoSrc: "/ex-pics/cc-rep/hom-20263.jpg",
        workPhone: "(868) 612-0102 ext. 62060",
        email: "renee.blackman@ttps.gov.tt",
      },
    ],
  },
  "e999-erp": {
    intro:
      "Central Committee Representatives for E999 / ERP are listed below.",
    representatives: [
      {
        name: "W/Ag Cpl Michelle Greenidge",
        summary: "Reg. No. 18506",
        photoSrc: "/ex-pics/cc-rep/e999-18506.jpg",
        workPhone: "(868) 622-5412",
        email: "michellegreenidge18506@gmail.com",
      },
    ],
  },
  capa: {
    intro: "Central Committee Representatives for CAPA are listed below.",
    representatives: [
      {
        name: "Cpl Vanessa Phillips",
        summary: "Reg. No. 17929",
        photoSrc: "/ex-pics/cc-rep/capa-17929.jpg",
        workPhone: "(868) 612-2470 ext. 11086/11091/11068",
        email: "v_phillips@live.com",
      },
    ],
  },
  acib: {
    intro: "Central Committee Representatives for ACIB are listed below.",
    representatives: [
      {
        name: "W/Cpl (Ag) Rachel George-Thomas",
        summary: "Reg. No. 19860",
        photoSrc: "/ex-pics/cc-rep/acib-19860.jpg",
        workPhone: "(868) 612-2470 ext. 17006/17007",
        email: "rachel.george-thomas@ttps.gov.tt",
      },
    ],
  },
  fib: {
    intro: "Central Committee Representatives for FIB are listed below.",
    representatives: [
      {
        name: "Sgt (Ag) Junior Nisbett",
        summary: "Reg. No. 16311",
        photoSrc: "/ex-pics/cc-rep/fib-16311.jpg",
        workPhone: "(868) 612-0102 ext. 13441",
        email: "juniornisbett@hotmail.com",
      },
    ],
  },
};
