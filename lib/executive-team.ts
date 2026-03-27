/** Public folder: `public/ex-pics/` — no spaces in path for Next/Image. */
const EX_PICS = "/ex-pics";

export type ExecutiveMember = {
  title: string;
  name?: string;
  /** Optional biography copy for the photo modal. Edit in this file. */
  bio?: string;
};

export const EXECUTIVE_TEAM: ExecutiveMember[] = [
  { title: "President", name: "Ishmael Pitt" },
  { title: "Vice President", name: "Owie Russell" },
  { title: "Secretary", name: "Natalie John" },
  { title: "Assistant Secretary", name: "Tricia Durant-Charles" },
  { title: "Treasurer", name: "Selwyn Marcano" },
  { title: "Special Reserve Police Representative", name: "Kevin Nicholls" },
  { title: "Municipal Police Representative", name: "McGuirk" },
  {
    title: "First Division Officer Representative",
    name: "Oswain Subero",
  },
  { title: "Trustee", name: "Adrian Andrews" },
  { title: "Trustee", name: "Jason Johnson" },
];

/** p1–p10 match `EXECUTIVE_TEAM` order. */
export const EXEC_PHOTOS = [
  `${EX_PICS}/p1.JPG`,
  `${EX_PICS}/p2.JPG`,
  `${EX_PICS}/p3.JPG`,
  `${EX_PICS}/p4.JPG`,
  `${EX_PICS}/p5.JPG`,
  `${EX_PICS}/p6.JPG`,
  `${EX_PICS}/p7.JPG`,
  `${EX_PICS}/p8.JPG`,
  `${EX_PICS}/p9.JPG`,
  `${EX_PICS}/p10.JPG`,
] as const;
