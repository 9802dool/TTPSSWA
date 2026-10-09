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
  acib: {
    intro: "Central Committee Representatives for ACIB are listed below.",
    representatives: [
      {
        name: "WPC Rachel George-Thomas",
        summary: "Reg. No. 19860",
        photoSrc: "/ex-pics/cc-rep/acib-19860.jpg",
        phone: "(868) 739-7230 / (868) 377-0317",
        email: "rachelgeorgie@hotmail.com",
      },
    ],
  },
  capa: {
    intro: "Central Committee Representatives for CAPA are listed below.",
    representatives: [
      {
        name: "W/Cpl Vanessa Phillips",
        summary: "Reg. No. 17929",
        photoSrc: "/ex-pics/cc-rep/capa-17929.jpg",
        phone: "(868) 723-0382",
        email: "v_phillips@live.com",
      },
    ],
  },
  central: {
    intro:
      "Central Committee Representatives for the Central division are listed below.",
    representatives: [
      {
        name: "Sgt Marlon King",
        summary: "Reg. No. 13137",
        photoSrc: "/ex-pics/cc-rep/central-13137.jpg",
        phone: "(868) 384-1919",
        email: "maklaf@hotmail.com",
      },
      {
        name: "WPC Shimerle Sampson",
        summary: "Reg. No. 5769",
        photoSrc: "/ex-pics/cc-rep/central-5769.jpg",
        phone: "(868) 317-6403 / (868) 738-3216",
        email: "Glamempress@proton.me",
      },
      {
        name: "Sgt Jacey Small",
        summary: "Reg. No. 16589",
        photoSrc: "/ex-pics/cc-rep/central-16589.jpg",
        phone: "(868) 282-8256",
        email: "jaceysmall@hotmail.com",
      },
    ],
  },
  "cid-cro": {
    intro:
      "Central Committee Representatives for CID / CRO are listed below.",
    representatives: [
      {
        name: "Cpl Ryan Ramoutar",
        summary: "Reg. No. 17090",
        photoSrc: "/ex-pics/cc-rep/cid-17090.jpg",
        phone: "(868) 768-8203",
        email: "ramoutar17090@gmail.com",
      },
      {
        name: "PC Che Duprey",
        summary: "Reg. No. 14523",
        photoSrc: "/ex-pics/cc-rep/cid-14523.jpg",
        phone: "(868) 768-6746",
        email: "cheduprey@gmail.com",
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
        phone: "(868) 499-5475",
        email: "wendy.guevaratt@gmail.com",
      },
    ],
  },
  "community-oriented-policing": {
    intro:
      "Central Committee Representatives for Community Oriented Policing are listed below.",
    representatives: [
      {
        name: "PC Lawrence Bradshaw",
        summary: "Reg. No. 21082",
        photoSrc: "/ex-pics/cc-rep/cop-21082.jpg",
        phone: "(868) 305-6724",
        email: "lawrencebradshaw75@gmail.com",
      },
      {
        name: "WPC Linda Alleyne",
        summary: "Reg. No. 20005",
        photoSrc: "/ex-pics/cc-rep/cop-20005.jpg",
        phone: "(868) 333-3071",
        email: "alleynelinda@yahoo.com",
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
        phone: "(868) 352-9324",
        email: "ria.montique-clement@ttps.gov.tt",
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
        phone: "(868) 344-9305",
        email: "reachlovenia@gmail.com",
      },
    ],
  },
  "court-process": {
    intro:
      "Central Committee Representatives for Court & Process are listed below.",
    representatives: [
      {
        name: "WPC Kamaria Guy",
        summary: "Reg. No. 7245",
        photoSrc: "/ex-pics/cc-rep/court-process-7245.jpg",
        phone: "(868) 387-8313",
        email: "fayolakguy@gmail.com",
      },
      {
        name: "Sgt Anthony Pierre",
        summary: "Reg. No. 16102",
        photoSrc: "/ex-pics/cc-rep/court-process-16102.jpg",
        phone: "(868) 323-2343",
        email: "anthonyjpierre@gmail.com",
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
        phone: "(868) 333-6569",
        email: "vimal.boodoo@ttps.gov.tt",
      },
    ],
  },
  "e999-erp": {
    intro:
      "Central Committee Representatives for E999 / ERP are listed below.",
    representatives: [
      {
        name: "WPC Michelle Greenidge",
        summary: "Reg. No. 18506",
        photoSrc: "/ex-pics/cc-rep/e999-18506.jpg",
        phone: "(868) 473-4532",
        email: "michellegreenidge18506@gmail.com",
      },
      {
        name: "PC Cameron Garner",
        summary: "Reg. No. 15098",
        photoSrc: "/ex-pics/cc-rep/e999-15098.jpg",
        phone: "(868) 267-5005",
        email: "swattycc@gmail.com",
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
        phone: "(868) 685-9469",
        email: "rwilliams17@hotmail.com",
      },
      {
        name: "PC Selwyn Yee Shong",
        summary: "Reg. No. 9087",
        photoSrc: "/ex-pics/cc-rep/eastern-9087.jpg",
        phone: "(868) 789-2901",
        email: "selwyn_34@yahoo.com",
      },
      {
        name: "WPC Janelle Stephen-Sammy",
        summary: "Reg. No. 18071",
        photoSrc: "/ex-pics/cc-rep/eastern-18071.jpg",
        phone: "(868) 778-3436",
        email: "janelle.sammy10@gmail.com",
      },
    ],
  },
  fib: {
    intro: "Central Committee Representatives for FIB are listed below.",
    representatives: [
      {
        name: "Ag Sgt Junior Nisbett",
        summary: "Reg. No. 16311",
        photoSrc: "/ex-pics/cc-rep/fib-16311.jpg",
        phone: "(868) 366-2221",
        email: "juniornisbett@hotmail.com",
      },
    ],
  },
  finance: {
    intro:
      "Central Committee Representatives for Finance are listed below.",
    representatives: [
      {
        name: "WPC Simone Skeete",
        summary: "Reg. No. 19725",
        photoSrc: "/ex-pics/cc-rep/fin-19725.jpg",
        phone: "(868) 705-1955",
        email: "simoneskeeete19@gmail.com",
      },
    ],
  },
  "fraud-squad": {
    intro:
      "Central Committee Representatives for Fraud Squad are listed below.",
    representatives: [
      {
        name: "Cpl Terrance Hamilton",
        summary: "Reg. No. 14690",
        photoSrc: "/ex-pics/cc-rep/fraud-14690.jpg",
        phone: "(868) 739-5875",
        email: "terrence2109@gmail.com",
      },
    ],
  },
  geb: {
    intro: "Central Committee Representatives for GEB are listed below.",
    representatives: [
      {
        name: "WPC Calisha Harry",
        summary: "Reg. No. 19415",
        photoSrc: "/ex-pics/cc-rep/geb-19415.jpg",
        phone: "(868) 492-0291",
        email: "calishaharry98@gmail.com",
      },
      {
        name: "Cpl Clinton Glasgow",
        summary: "Reg. No. 17048",
        photoSrc: "/ex-pics/cc-rep/geb-17048.jpg",
        phone: "(868) 775-6883",
        email: "clintonglasgow@outlook.com",
      },
    ],
  },
  homicide: {
    intro:
      "Central Committee Representatives for Homicide are listed below.",
    representatives: [
      {
        name: "W/Cpl Anika Jules",
        summary: "Reg. No. 13587",
        photoSrc: "/ex-pics/cc-rep/hom-13587.jpg",
        phone: "(868) 267-4059",
        email: "anikajules1@gmail.com",
      },
      {
        name: "PC Johnan Salvary",
        summary: "Reg. No. 19978",
        photoSrc: "/ex-pics/cc-rep/hom-19978.jpg",
        phone: "(868) 774-1666",
        email: "johnan.salvary@ttps.gov.tt",
      },
      {
        name: "WPC Renee Blackman-Singh",
        summary: "Reg. No. 20263",
        photoSrc: "/ex-pics/cc-rep/hom-20263.jpg",
        phone: "(868) 293-3192",
        email: "renee.blackman@ttps.gov.tt",
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
        phone: "(868) 710-0066",
        email: "kevindenny1973@gmail.com",
      },
      {
        name: "Ag Cpl Collin Marcellin",
        summary: "Reg. No. 18075",
        photoSrc: "/ex-pics/cc-rep/hr-18075.jpg",
        phone: "(868) 363-6927",
        email: "marcellincollin@yahoo.com",
      },
    ],
  },
  iatf: {
    intro:
      "The Inter-Agency Task Force (IATF) is a specialized TTPS unit focused on joint operations and interdepartmental collaboration. Central Committee Representatives for this section are listed below.",
    representatives: [
      {
        name: "PC Khamael Benoit",
        summary: "Reg. No. 20964",
        photoSrc: "/ex-pics/cc-rep/iatf-20964.jpg",
        phone: "(868) 368-8280",
        email: "Khamael24@gmail.com",
      },
      {
        name: "PC Darnel David",
        summary: "Reg. No. 10364",
        photoSrc: "/ex-pics/cc-rep/iatf-10364.jpg",
        phone: "(868) 482-5485",
        email: "darneldavid@live.com",
      },
      {
        name: "PC Nolan Tash",
        summary: "Reg. No. 10428",
        photoSrc: "/ex-pics/cc-rep/iatf-10428.jpg",
        phone: "(868) 789-7497",
        email: "n_tash@hotmail.com",
      },
    ],
  },
  "mounted-and-k9": {
    intro:
      "Central Committee Representatives for Mounted & Canine are listed below.",
    representatives: [
      {
        name: "W/Cpl Tamika Tannis",
        summary: "Reg. No. 18542",
        photoSrc: "/ex-pics/cc-rep/mounted-k9-18542.jpg",
        phone: "(868) 338-4914",
        email: "kakatannis@yahoo.com",
      },
      {
        name: "PC Tristan Neale",
        summary: "Reg. No. 19296",
        photoSrc: "/ex-pics/cc-rep/mounted-k9-19296.jpg",
        phone: "(868) 745-8960",
        email: "tristanneale28@gmail.com",
      },
    ],
  },
  municipal: {
    intro:
      "Central Committee Representatives for Municipal are listed below.",
    representatives: [
      {
        name: "W/Ag Sgt Vanessa Williams",
        summary: "Reg. No. 3206",
        photoSrc: "/ex-pics/cc-rep/municipal-3206.jpg",
        phone: "(868) 378-8429 / (868) 749-7536",
        email: "vanessamelville@live.com",
      },
      {
        name: "WPC Shivonne Baptiste",
        summary: "Reg. No. 12345",
        photoSrc: "/ex-pics/cc-rep/municipal-12345.jpg",
        phone: "(868) 713-2929",
        email: "shivonnebaptiste7@gmail.com",
      },
      {
        name: "WPC Dashia Luke",
        summary: "Reg. No. 12361",
        photoSrc: "/ex-pics/cc-rep/municipal-12361.jpg",
        phone: "(868) 336-6697",
        email: "dashialuke364@yahoo.com",
      },
    ],
  },
  "north-central": {
    intro:
      "Central Committee Representatives for North Central are listed below.",
    representatives: [
      {
        name: "WPC Natasha Amour",
        summary: "Reg. No. 10247",
        photoSrc: "/ex-pics/cc-rep/nc-10247.jpg",
        phone: "(868) 717-6331 / (868) 302-3050",
        email: "amour.natash@yahoo.com",
      },
      {
        name: "WPC Selma Adams",
        summary: "Reg. No. 18541",
        photoSrc: "/ex-pics/cc-rep/nc-18541.jpg",
        phone: "(868) 761-5073",
        email: "melly2947@gmail.com",
      },
      {
        name: "WPC Michelle Olliverrie",
        summary: "Reg. No. 5303",
        photoSrc: "/ex-pics/cc-rep/nc-5303.jpg",
        phone: "(868) 357-6616",
        email: "michelle1olliverrie@gmail.com",
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
        phone: "(868) 778-7206",
        email: "helnak75@outlook.com",
      },
      {
        name: "W/Cpl Sonya George",
        summary: "Reg. No. 18586",
        photoSrc: "/ex-pics/cc-rep/ned-18586.jpg",
        phone: "(868) 704-1460",
        email: "sonya-george@hotmail.com",
      },
      {
        name: "W/Ag Sgt Shelley Durant",
        summary: "Reg. No. 17164",
        photoSrc: "/ex-pics/cc-rep/ned-17164.jpg",
        phone: "(868) 495-8373",
        email: "lovable-sd@live.com",
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
        phone: "(868) 720-9444",
        email: "timmynaitram@gmail.com",
      },
      {
        name: "WPC Lindy Mohammed",
        summary: "Reg. No. 19697",
        photoSrc: "/ex-pics/cc-rep/northern-19697.jpg",
        phone: "(868) 398-7690",
        email: "mohammedlindy29@gmail.com",
      },
      {
        name: "WPC Kim Hamit",
        summary: "Reg. No. 10200",
        photoSrc: "/ex-pics/cc-rep/northern-10200.jpg",
        phone: "(868) 685-9621",
        email: "kimhamit@gmail.com",
      },
    ],
  },
  occ: {
    intro: "Central Committee Representatives for OCC are listed below.",
    representatives: [
      {
        name: "WPC Avalon Phillip",
        summary: "Reg. No. 17219",
        photoSrc: "/ex-pics/cc-rep/occ-17219.jpg",
        phone: "(868) 716-3042",
        email: "hot_ava@yahoo.com",
      },
    ],
  },
  "police-academy": {
    intro:
      "Central Committee Representatives for Police Academy are listed below.",
    representatives: [
      {
        name: "Cpl Kevon Beatrice",
        summary: "Reg. No. 17057",
        photoSrc: "/ex-pics/cc-rep/pa-17057.jpg",
        phone: "(868) 709-9970",
        email: "nantambu.tt@gmail.com",
      },
      {
        name: "W/Sgt Zalika Mills",
        summary: "Reg. No. 16697",
        photoSrc: "/ex-pics/cc-rep/pa-16697.jpg",
        phone: "(868) 779-3250",
        email: "zalikamills1@hotmail.com",
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
        phone: "(868) 294-4757",
        email: "derickthomas2@hotmail.com",
      },
    ],
  },
  "port-of-spain": {
    intro:
      "Central Committee Representatives for Port of Spain are listed below.",
    representatives: [
      {
        name: "PC Nicholas James",
        summary: "Reg. No. 16532",
        photoSrc: "/ex-pics/cc-rep/pos-16532.jpg",
        phone: "(868) 281-3701",
        email: "nicksmurfjames@gmail.com",
      },
      {
        name: "WPC Jamila Phillip",
        summary: "Reg. No. 19021",
        photoSrc: "/ex-pics/cc-rep/pos-19021.jpg",
        phone: "(868) 366-5353",
        email: "jamazingbeau@gmail.com",
      },
      {
        name: "W/Ag Sgt Giselle Thomas",
        summary: "Reg. No. 18264",
        photoSrc: "/ex-pics/cc-rep/pos-18264.jpg",
        phone: "(868) 281-7970",
        email: "gisellethomas22@gmail.com",
      },
    ],
  },
  psb: {
    intro: "Central Committee Representatives for PSB are listed below.",
    representatives: [
      {
        name: "WPC Candice Sampson",
        summary: "Reg. No. 18828",
        photoSrc: "/ex-pics/cc-rep/psb-18828.jpg",
        phone: "(868) 313-7462",
        email: "candicejsampson@outlook.com",
      },
    ],
  },
  siu: {
    intro:
      "Central Committee Representatives for SIU are listed below.",
    representatives: [
      {
        name: "Cpl Matthew Ramirez",
        summary: "Reg. No. 18392",
        photoSrc: "/ex-pics/cc-rep/siu-18392.jpg",
        phone: "(868) 740-1824",
        email: "ramirezmathews@hotmail.com",
      },
      {
        name: "Cpl Kwesi Carmona",
        summary: "Reg. No. 17065",
        photoSrc: "/ex-pics/cc-rep/siu-17065.jpg",
        phone: "(868) 485-7818",
        email: "earlcarmona@hotmail.com",
      },
    ],
  },
  "south-western": {
    intro:
      "Central Committee Representatives for South Western are listed below.",
    representatives: [
      {
        name: "W/Cpl Avelon Monsegue",
        summary: "Reg. No. 17225",
        photoSrc: "/ex-pics/cc-rep/sw-17225.jpg",
        phone: "(868) 746-9658",
        email: "avelondiamond@gmail.com",
      },
      {
        name: "W/Cpl Liann Philandez",
        summary: "Reg. No. 19799",
        photoSrc: "/ex-pics/cc-rep/sw-19799.jpg",
        phone: "(868) 314-6455",
      },
      {
        name: "PC Aelon Andrews",
        summary: "Reg. No. 19252",
        photoSrc: "/ex-pics/cc-rep/sw-19252.jpg",
        phone: "(868) 678-9748",
        email: "Aelon.Andrews@ttps.gov.tt",
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
        phone: "(868) 360-1316",
        email: "krosan54321@gmail.com",
      },
      {
        name: "WPC Trisha Cupid",
        summary: "Reg. No. 7003",
        photoSrc: "/ex-pics/cc-rep/southern-7003.jpg",
        phone: "(868) 721-1816",
        email: "trishacupid42@gmail.com",
      },
      {
        name: "W/Cpl Jisselle Ballantyne",
        summary: "Reg. No. 18084",
        photoSrc: "/ex-pics/cc-rep/southern-18084.jpg",
        phone: "(868) 736-2074",
        email: "jisselle-torres@hotmail.com",
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
        phone: "(868) 687-5860",
        email: "joshuabalfour@yahoo.com",
      },
      {
        name: "W/Cpl Donna Marshall-John",
        summary: "Reg. No. 18551",
        photoSrc: "/ex-pics/cc-rep/sb-18551.jpg",
        phone: "(868) 379-4684",
        email: "donnajohn26@gmail.com",
      },
    ],
  },
  "special-victims": {
    intro:
      "Central Committee Representatives for Special Victims are listed below.",
    representatives: [
      {
        name: "W/Cpl Abigail Simmons",
        summary: "Reg. No. 19197",
        photoSrc: "/ex-pics/cc-rep/sv-19197.jpg",
        phone: "(868) 466-8821",
      },
      {
        name: "W/Cpl Fay-Anne Worrell-Lopez",
        summary: "Reg. No. 17913",
        photoSrc: "/ex-pics/cc-rep/sv-17913.jpg",
        phone: "(868) 797-7692",
        email: "fayannelopez@gmail.com",
      },
    ],
  },
  tobago: {
    intro:
      "Central Committee Representatives for Tobago are listed below.",
    representatives: [
      {
        name: "Ag Insp Collin Stewart",
        summary: "Reg. No. 13495",
        photoSrc: "/ex-pics/cc-rep/tobago-13495.jpg",
        phone: "(868) 743-4753",
        email: "poorducky@gmail.com",
      },
      {
        name: "W/Ag Cpl Asha Phillip-Kennedy",
        summary: "Reg. No. 18463",
        photoSrc: "/ex-pics/cc-rep/tobago-18463.jpg",
        phone: "(868) 731-8146",
      },
      {
        name: "Ag Cpl Sekou Moses",
        summary: "Reg. No. 20279",
        photoSrc: "/ex-pics/cc-rep/tobago-20279.jpg",
        phone: "(868) 465-5452",
      },
    ],
  },
  "traffic-highway-patrol": {
    intro:
      "Central Committee Representatives for Traffic & Highway Patrol are listed below.",
    representatives: [
      {
        name: "W/Cpl Kizzie Marcelle",
        summary: "Reg. No. 17180",
        photoSrc: "/ex-pics/cc-rep/thp-17180.jpg",
        phone: "(868) 720-2186",
        email: "michellemarcelle@hotmail.com",
      },
      {
        name: "W/Cpl Giselle Lakhan",
        summary: "Reg. No. 17553",
        photoSrc: "/ex-pics/cc-rep/thp-17553.jpg",
        phone: "(868) 707-0047",
        email: "gisellelakhan27@gmail.com",
      },
      {
        name: "WPC Patrice Williams",
        summary: "Reg. No. 9795",
        photoSrc: "/ex-pics/cc-rep/thp-9795.jpg",
        phone: "(868) 269-3853",
      },
    ],
  },
  "transit-police": {
    intro:
      "Central Committee Representatives for the Transit Police Unit are listed below.",
    representatives: [
      {
        name: "PC Kelvin Forde",
        summary: "Reg. No. 9589",
        photoSrc: "/ex-pics/cc-rep/transit-9589.jpg",
        phone: "(868) 346-5662",
        email: "matindebeaupres@outlook.com",
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
        phone: "(868) 302-2724",
        email: "jason_pascall@yahoo.com",
      },
    ],
  },
  western: {
    intro:
      "Central Committee Representatives for the Western division are listed below.",
    representatives: [
      {
        name: "W/Ag Cpl Keisha Duke",
        summary: "Reg. No. 20628",
        photoSrc: "/ex-pics/cc-rep/western-20628.jpg",
        phone: "(868) 476-5471",
        email: "brewsterkd@gmail.com",
      },
      {
        name: "WPC Afiya Plentie",
        summary: "Reg. No. 18724",
        photoSrc: "/ex-pics/cc-rep/western-18724.jpg",
        phone: "(868) 466-9999",
      },
      {
        name: "WPC Jiselle Douglas",
        summary: "Reg. No. 20822",
        photoSrc: "/ex-pics/cc-rep/western-20822.jpg",
        phone: "(868) 283-6754",
        email: "jisdouglas@outlook.com",
      },
    ],
  },
};
