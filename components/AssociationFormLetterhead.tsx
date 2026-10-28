import Image from "next/image";
import { SITE_LOGO_ALT, SITE_LOGO_SIZE, SITE_LOGO_SRC } from "@/lib/site-logo";

const OFFICERS_FOOTER = {
  membership: [
    "Vice President: Ag. A.S.P Owie Russell; Assistant Secretary: No. 16940 W/Ag. Sgt. Tricia Durant-Charles",
    "Treasurer: No. 18668 Ag. Cpl. Selwyn Marcano",
    "Trustees: No. 13281 Sgt. Adrian Andrews | No. 16540 Sgt. Jason Johnson",
    "First Division Officer: Ag. A.C.P Oswain Subero",
    "Special Reserve Officer: No. 5369 PC Kevin Nicholls; Municipal Officer: No.12279 PC David Mc Guirk",
  ],
  merit: [
    "Vice President: Ag. A.S.P Owie Russell; Assistant Secretary: No. 16940 W/Ag Sgt. Tricia Durant-Charles",
    "Treasurer: No. 18668 Ag. Cpl. Selwyn Marcano",
    "Trustees: No. 13281 Sgt. Adrian Andrews | No. 16540 Sgt. Jason Johnson;",
    "First Division Officer: Ag. A.C.P Oswain Subero",
    "Special Reserve Officer No. 5369 PC Kevin Nicholls; Municipal Officer: No. 12279 PC David Mc Guirk",
  ],
  salary: [
    "Vice President: Ag. A.S.P Owie Russell; Assistant Secretary: No. 16940 W/Ag.Sgt. Tricia Durant-Charles",
    "Treasurer: No. 18668 Ag. Cpl. Selwyn Marcano",
    "Trustees: No. 13281 Sgt. Adrian Andrews | No. 16540 Sgt. Jason Johnson;",
    "First Division Officer: Ag. A.C.P Oswain Subero",
    "Special Reserve Officer No. 5369 PC Kevin Nicholls; Municipal Officer: No. 12279 PC David Mc Guirk",
  ],
  meritSalary: [
    "Vice President: Ag. A.S.P Owie Russell; Assistant Secretary: No. 16940 W/Ag.Sgt. Tricia Durant-Charles",
    "Treasurer: No. 18668 Ag. Cpl. Selwyn Marcano",
    "Trustees: No. 13281 Sgt. Adrian Andrews No. 16540 Sgt. Jason Johnson;",
    "First Division Officer: Ag. A.C.P Oswain Subero",
    "Special Reserve Officer No. 5369 PC Kevin Nicholls; Municipal Officer: No.12279 PC David Mc Guirk",
  ],
  retirement: [
    "Vice President: Ag. A.S.P Owie Russell; Assistant Secretary: No. 16940 W/Ag.Sgt. Tricia Durant-Charles",
    "Treasurer: No. 18668 Ag. Cpl. Selwyn Marcano",
    "Trustees: No. 13281 Sgt. Adrian Andrews No. 16540 Sgt. Jason Johnson;",
    "First Division Officer: Ag. A.C.P Oswain Subero",
    "Special Reserve Officer No. 5369 PC Kevin Nicholls: Municipal Officer: No.12279 PC David Mc Guirk",
  ],
  dentalOptical: [
    "Vice President: Ag. A.S.P Owie Russell; Assistant Secretary: No. 16940 W/Ag.Sgt. Tricia Durant-Charles",
    "Treasurer: No. 18668 Ag. Cpl. Selwyn Marcano",
    "Trustees: No. 13281 Sgt. Adrian Andrews; No. 16540 Sgt. Jason Johnson",
    "First Division Officer: Ag. A.C.P Oswain Subero",
    "Special Reserve Officer: No. 5369 PC Kevin Nicholls; Municipal Officer: No.12279 PC David Mc Guirk",
  ],
} as const;

/**
 * The association's real logo (same file as the site header) for form
 * letterheads. The site header is hidden when printing, so this is the logo
 * that appears on printed/saved-as-PDF forms.
 */
export function AssociationFormLogo() {
  return (
    <span className="relative block h-20 w-[7.5rem] overflow-hidden" data-testid="association-form-logo">
      <Image
        src={SITE_LOGO_SRC}
        alt={SITE_LOGO_ALT}
        width={SITE_LOGO_SIZE}
        height={SITE_LOGO_SIZE}
        priority
        sizes="120px"
        className="h-full w-full object-cover brightness-0"
      />
    </span>
  );
}

export function AssociationFormHeader() {
  return (
    <header className="mb-2 text-center">
      <div className="mb-1 flex justify-center">
        <AssociationFormLogo />
      </div>
      <h2 className="m-0 text-sm font-bold uppercase text-[#0d2a70]">
        Trinidad and Tobago Police Service
      </h2>
      <h3 className="m-0 text-base font-bold uppercase text-black">
        Social and Welfare Association
      </h3>
      <p className="mx-auto mt-1 max-w-xl text-[11px] leading-snug">
        4th Floor, Riverside Plaza, #3 Besson Street, Port of Spain, Tel: 235-5260 / 792-6226
        <br />
        E-Mail: ttpsswa.receptionist@outlook.com Website: ttpsswa.org
      </p>
      <p className="mt-1 text-[11px] font-bold">
        President: Ag. A.S.P. Ishmael Pitt &nbsp;|&nbsp; Secretary: W/Ag. A.S.P. Nathalie John
      </p>
    </header>
  );
}

export function AssociationOfficersFooter({
  variant,
  dated = "Nov 2025",
}: {
  variant: keyof typeof OFFICERS_FOOTER;
  dated?: string;
}) {
  return (
    <footer className="mt-5 border-t border-black pt-2 text-center text-[10.5px] leading-snug">
      <p className="font-bold">{dated}</p>
      {OFFICERS_FOOTER[variant].map((line) => (
        <p key={line}>{line}</p>
      ))}
    </footer>
  );
}
