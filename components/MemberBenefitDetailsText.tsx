export function MemberBenefitDetailsText({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  if (number === 1) {
    return (
      <>
        <p className="text-sm font-semibold text-ink">Information</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Describe how members access legal aid for criminal or disciplinary
          matters: eligibility, how to apply, required documents, and office
          contact. Replace this text in{" "}
          <code className="rounded bg-line/80 px-1 py-0.5 text-xs">
            components/MemberBenefitDetailsText.tsx
          </code>
          .
        </p>
      </>
    );
  }
  return (
    <>
      <p className="text-sm font-semibold text-ink">Information</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Add eligibility criteria, how to apply, contacts, and links for{" "}
        <span className="font-medium text-ink">{title}</span>. Edit this block in{" "}
        <code className="rounded bg-line/80 px-1 py-0.5 text-xs">
          components/MemberBenefitDetailsText.tsx
        </code>
        .
      </p>
    </>
  );
}
