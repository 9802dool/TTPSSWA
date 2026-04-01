import { DentalOpticalGrantApplySection } from "@/components/DentalOpticalGrantApplySection";

type Props = {
  number: number;
  title: string;
  /** Match ExpandableBenefit / page background for readable copy. */
  variant?: "light" | "dark";
};

export function MemberBenefitDetailsText({
  number,
  title,
  variant = "light",
}: Props) {
  const isDark = variant === "dark";
  const h = isDark ? "text-slate-100" : "text-ink";
  const p = isDark ? "text-slate-400" : "text-muted";
  const em = isDark ? "font-medium text-slate-200" : "font-medium text-ink";
  const code =
    "rounded px-1 py-0.5 text-xs " +
    (isDark ? "bg-white/10 text-slate-300" : "bg-line/80");

  if (number === 2) {
    return <DentalOpticalGrantApplySection />;
  }

  if (number === 1) {
    return (
      <>
        <p className={`text-sm font-semibold ${h}`}>Information</p>
        <p className={`mt-2 text-sm leading-relaxed ${p}`}>
          Describe how members access legal aid for criminal or disciplinary
          matters: eligibility, how to apply, required documents, and office
          contact. Replace this text in{" "}
          <code className={code}>components/MemberBenefitDetailsText.tsx</code>.
        </p>
      </>
    );
  }
  return (
    <>
      <p className={`text-sm font-semibold ${h}`}>Information</p>
      <p className={`mt-2 text-sm leading-relaxed ${p}`}>
        Add eligibility criteria, how to apply, contacts, and links for{" "}
        <span className={em}>{title}</span>. Edit this block in{" "}
        <code className={code}>components/MemberBenefitDetailsText.tsx</code>.
      </p>
    </>
  );
}
