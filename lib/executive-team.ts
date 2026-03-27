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
    bio: `With 28 years of distinguished service in law enforcement, President Ishmael Pitt has earned recognition for his leadership, integrity, and commitment to community safety. He has overseen operations in the Northern Division and contributed to specialized units such as the Repeat Offenders' Programme Task Force, Firearms Interdiction Unit, and Criminal Investigations Department. His dedication was honored with 2nd place in the 2018 Crime Fighter of the Caribbean Award.

Beyond policing, President Pitt has served as a TTPS Media Ambassador and now leads the TTPSSWA, advocating for officers' rights and improved working conditions. Holding a Master's in Criminology and a Bachelor's in Security Administration, he combines academic expertise with practical leadership, driving ethical policing and progressive reform for the benefit of officers and the wider community.`,
  },
  {
    title: "Vice President",
    name: "Owie Russell",
    bio: `Vice President Owie Russell is a dedicated leader with 26 years of distinguished service in law enforcement. He has served in key divisions including Port of Spain, Organized Crime, and Police Complaints, and currently leads the Western Division with integrity and a strong focus on officer welfare.

As Chairman of the Housing Committee for the TTPSSWA, he has advanced initiatives to improve officers' living conditions, while his role as a Central Committee Representative for the Police Complaints Division highlights his commitment to fairness and accountability.

Vice President Russell holds a Master's in Security and Risk Management and has specialized training in crime prevention, crisis response, and gang prosecution. Beyond his credentials, he is a leader of action—fostering collaboration, inspiring team spirit, and advocating for policies that elevate officer welfare and strengthen the Police Service.`,
  },
  {
    title: "Secretary",
    name: "Nathalie John",
    bio: `Secretary Nathalie John has dedicated 26 years to law enforcement, serving with distinction across several divisions, including Special Branch, and holding leadership roles such as Senior Woman Inspector in the Eastern Division. She currently serves as Secretary of the TTPSSWA, where her focus is on advancing officer welfare and organizational development.

As Executive Chair of the Events and Education Committee, she has successfully led initiatives such as the TTPSSWA Diwali ceremony and the Protective Arms Monarch competition. She also made history as the first woman to serve as 2nd Vice President of the Caribbean Federation of Police Welfare Associations.

Secretary John holds an MBA with distinction, a Diploma in Law, and certifications in Facilities and Human Resource Management. Known for her dependability and persistence, she continues to inspire progress and advocate for the well-being of her colleagues.`,
  },
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
