/** Public folder: `public/ex-pics/` — no spaces in path for Next/Image. */
const EX_PICS = "/ex-pics";

export type ExecutiveMember = {
  title: string;
  name?: string;
  /** Optional biography copy for the photo modal. Edit in this file. */
  bio?: string;
};

export const EXECUTIVE_TEAM: ExecutiveMember[] = [
  {
    title: "President",
    name: "Ishmael Pitt",
    bio: `With a 28-year career in law enforcement, Ag. Assistant Superintendent Ishmael Pitt has demonstrated exceptional leadership and commitment to community safety. Currently in charge of Operations for the Northern Division, he has been instrumental in advancing crime prevention and operational effectiveness. Ag. ASP Pitt has served in critical units like the Repeat Offenders' Programme Task Force, Firearms Interdiction Unit, and Criminal Investigations Department. His efforts earned him 2nd place in the 2018 Crime Fighter of the Caribbean Award. He is also a TTPS Media Ambassador and Vice President of the TTPS Social and Welfare Association, advocating for officers' rights and better working conditions. With a Master's in Criminology and a Bachelor's in Security Administration, Ag. ASP Pitt combines strong analytical skills and strategic leadership. His commitment to ethical policing and progressive reform makes him an ideal candidate for leading the TTPS Welfare Association.`,
  },
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
