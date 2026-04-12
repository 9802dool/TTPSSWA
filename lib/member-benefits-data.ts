export const MEMBER_BENEFITS_PILLAR = {
  title: "Members Benefits",
  body:
    "These benefits are how we support members: legal aid, optical and dental grants, death and retirement benefits, health plans, education and scholarships, housing and land programs, business promotion, tokens, and more. Choose a benefit below to open its full page.",
} as const;

export const MEMBER_BENEFITS: { number: number; title: string }[] = [
  { number: 1, title: "Legal Aid Assistance (Criminal/Disciplinary)" },
  { number: 2, title: "Optical & Dental Grant for SRP's & Municipal" },
  { number: 3, title: "Death Benefit" },
  { number: 4, title: "Guardian Life Health Plan" },
  { number: 5, title: "Retirement Benefit" },
  { number: 6, title: "Merit Facility" },
  { number: 7, title: "Food Hampers, Fruit Baskets" },
  {
    number: 8,
    title: "Financial Assistance for Medical, Natural Disasters etc.",
  },
  { number: 9, title: "Hardware & Beyond home improvement loan facility" },
  { number: 10, title: "Tertiary Education Grant" },
  { number: 11, title: "Full Time Scholarship" },
  { number: 12, title: "Part time Scholarship" },
  { number: 13, title: "SEA Tokens/Awards" },
  { number: 14, title: "Promote and utilizes members businesses" },
  { number: 15, title: "CXC & Cape Tokens" },
  { number: 16, title: "Rent to Own" },
  { number: 17, title: "Land for the Landless" },
  { number: 18, title: "Membership Discount Card" },
  { number: 19, title: "End of Year Membership Token" },
];

export function getMemberBenefitByBenefitId(benefitId: string) {
  const n = Number.parseInt(benefitId, 10);
  if (!Number.isFinite(n)) return undefined;
  return MEMBER_BENEFITS.find((b) => b.number === n);
}
