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
  {
    title: "Assistant Secretary",
    name: "Tricia Durant-Charles",
    bio: `Woman Police Corporal (WPC) Tricia Durant-Charles is a strategic and compassionate leader with 19 years of service in the Trinidad and Tobago Police Service. She has served in the Special Victims Department, Community Policing, and Court and Process, demonstrating expertise in complex social and legal matters.

As Assistant Secretary of the TTPS Social and Welfare Association, she helps shape policies that enhance officer welfare and professional growth. She also advocates for regional collaboration as Public Relations Officer of the Caribbean Federation of Police Welfare Associations.

Tricia holds a Master's in Strategic Leadership, a Postgraduate Diploma in Mediation Studies, and a Bachelor's in Behavioral Science, Cum Laude. Respected for her integrity and vision, she is committed to fairness, empowerment, and advancing welfare initiatives across the police service.`,
  },
  {
    title: "Treasurer",
    name: "Selwyn Marcano",
    bio: `Police Constable (PC) Selwyn Marcano is a trusted financial steward and ethical leader, dedicated to strengthening police welfare through accountability and sound financial management. With 14 years of service in the Trinidad and Tobago Police Service, he has built a reputation for integrity, discipline, and commitment to officer advocacy.

PC Marcano has served as an investigator in the Special Investigations Unit and contributed to critical operations within the Organized Crime, Narcotics, and Firearm Bureau, where he demonstrated investigative excellence and operational effectiveness.

In his current role as Treasurer of the Trinidad and Tobago Police Service Social and Welfare Association, PC Marcano ensures financial transparency, resource protection, and responsible stewardship of funds for the benefit of officers. His work reflects a deep commitment to accountability and the welfare of his colleagues.

Academically, he holds a certificate in Industrial Relations and is pursuing a Law Degree, further solidifying his dedication to legal and financial excellence. Known for his ethical, intuitive leadership, PC Marcano is passionate about mentorship, community service, and prioritizing officer welfare.

Respected by peers and colleagues, PC Marcano continues to champion transparency, accountability, and empowerment within the Trinidad and Tobago Police Service.`,
  },
  {
    title: "First Division Officer Representative",
    name: "Oswain Subero",
    bio: `Acting Assistant Commissioner of Police (ACP) Oswain Subero is a visionary leader with over 37 years of distinguished service in law enforcement. Currently serving as the First Division Officer Representative, ACP Subero brings a wealth of experience, strategic insight, and unwavering dedication to the Trinidad and Tobago Police Service.

As former head of the Tobago and Eastern Division, he championed operational excellence, officer welfare, and community-driven policing. His leadership extended to the Inter-Agency Task Force, where he spearheaded initiatives to strengthen interdepartmental collaboration, and to the Hearts and Minds Programme Foundation, which he chaired to promote crime prevention and community empowerment.

ACP Subero's commitment to policing excellence has earned him multiple awards, including recognition as 1st Runner-Up for Top Caribbean Community Policing Officer in 2017. His academic credentials include an MBA in Leadership, Entrepreneurship, and Innovation from Anglia Ruskin University, alongside certifications in Human Resource Management and Public Service.

Beyond his operational duties, ACP Subero serves as a Trustee of the TTPS Social and Welfare Association and is an active member of the International Police Association, reflecting his dedication to officer advocacy and strengthening global law enforcement networks.

Respected for his disciplined leadership and community focus, ACP Subero continues to drive positive change in policing, ensuring that the Trinidad and Tobago Police Service remains a pillar of safety, trust, and empowerment for all citizens.`,
  },
  {
    title: "Special Reserve Police Representative",
    name: "Kevin Nicholls",
    bio: `Known affectionately as \u201cCold in d Ice,\u201d Police Constable (PC) Kevin Nicholls is a respected and passionate advocate within the Trinidad and Tobago Police Service. With over 19 years of service as a Special Reserve Police (SRP) Officer, he has become widely recognized for championing SRP rights, focusing on improved working conditions, job security, and recognition.

Renowned for his leadership and outspoken advocacy, PC Nicholls has played a pivotal role in the SRP ratification process, striving to become the first SRP elected to the Executive of the TTPS Social and Welfare Association. His efforts reflect a broader push for equality, inclusion, and representation within the service.

Beyond policing, PC Nicholls brings a background in engineering and a strong focus on entrepreneurship, encouraging officers to pursue financial independence and personal growth. His work continues to inspire change, both within the police force and across the wider community.

Respected for his dedication and vision, PC Nicholls remains a powerful voice for SRP officers, committed to advancing welfare, fairness, and empowerment in the Trinidad and Tobago Police Service.`,
  },
  {
    title: "Municipal Police Representative",
    name: "David Mc Guirk",
    bio: `Police Constable (PC) David Mc Guirk has served with dedication in the Port of Spain City Police for six years, gaining experience in the Street Patrol Unit, Multi-Operational Task Force, and Strike Team. Certified in VIP Protection, Defensive Tactics, and Firearm Training, he brings specialized expertise to municipal policing.

As Municipal Representative of the TTPS Social and Welfare Association, PC Mc Guirk is a strong advocate for officer welfare and rights. Known for his integrity and approachable leadership style, he promotes mentorship, unity, and continuous learning. His focus on fairness, wellness initiatives, and open dialogue helps strengthen both internal cohesion and public trust, making him a driving force for positive change within the service.`,
  },
  { title: "Trustee", name: "Adrian Andrews" },
  { title: "Trustee", name: "Jason Johnson" },
];

/** Image files aligned with `EXECUTIVE_TEAM` order (FDO between Treasurer and SRP). */
export const EXEC_PHOTOS = [
  `${EX_PICS}/p1.JPG`,
  `${EX_PICS}/p2.JPG`,
  `${EX_PICS}/p3.JPG`,
  `${EX_PICS}/p4.JPG`,
  `${EX_PICS}/p5.JPG`,
  `${EX_PICS}/p8.JPG`,
  `${EX_PICS}/p6.JPG`,
  `${EX_PICS}/p7.JPG`,
  `${EX_PICS}/p9.JPG`,
  `${EX_PICS}/p10.JPG`,
] as const;
