import type { ServiceRequestRecord } from "@/lib/analytics-storage";

function serviceLabel(type: string): string {
  if (type === "hotel_booking") return "Hotel reservation";
  if (type === "salary_deduction") return "Salary deduction";
  if (type === "dental_optical_grant") return "Dental & optical grant";
  if (type === "legal_aid_application") return "Legal aid application";
  if (type === "merit_loan_application") return "Merit loan application";
  return type.replace(/_/g, " ");
}

function HotelBookingDetails({
  payload,
  variant,
}: {
  payload: Record<string, unknown>;
  variant: "admin" | "member";
}) {
  const str = (k: string) => {
    const v = payload[k];
    return typeof v === "string" ? v : v != null ? String(v) : "";
  };
  const dtClass =
    variant === "admin"
      ? "text-[var(--muted)] sm:pt-0.5"
      : "text-muted sm:pt-0.5";
  const ddClass = variant === "admin" ? "text-[var(--fg)] sm:col-start-2" : "text-ink sm:col-start-2";

  const rows: [string, string][] = [];
  const fullName = str("fullName");
  const phone = str("phone");
  if (fullName) rows.push(["Name", fullName]);
  if (phone) rows.push(["Phone", phone]);
  const checkIn = str("checkInDate");
  const checkOut = str("checkOutDate");
  const checkInTime = str("checkInTime");
  const checkOutTime = str("checkOutTime");
  if (checkIn || checkOut) {
    rows.push([
      "Stay",
      [checkIn, checkInTime && `(${checkInTime})`, "→", checkOut, checkOutTime && `(${checkOutTime})`]
        .filter(Boolean)
        .join(" "),
    ]);
  }
  const pres = Number(payload.presidentialSuite ?? 0);
  const fullB = Number(payload.fullBedRoom ?? 0);
  const dbl = Number(payload.doubleBedRoom ?? 0);
  const hasMix =
    [pres, fullB, dbl].some((n) => Number.isFinite(n) && n > 0);
  if (hasMix) {
    const parts: string[] = [];
    if (pres > 0)
      parts.push(`presidential ×${pres}`);
    if (fullB > 0) parts.push(`full bed ×${fullB}`);
    if (dbl > 0) parts.push(`double ×${dbl}`);
    rows.push(["Room mix", parts.join(", ")]);
  }
  const rooms = str("rooms");
  const guests = str("guests");
  if (!hasMix && rooms) rows.push(["Rooms", rooms]);
  if (guests) rows.push(["Adults", guests]);
  const children = str("children");
  if (children && children !== "0") rows.push(["Children", children]);
  const notes = str("notes");
  if (notes) rows.push(["Notes", notes]);

  return (
    <dl className="mt-2 grid gap-1.5 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
      {rows.map(([dt, dd]) => (
        <div key={dt} className="contents">
          <dt className={dtClass}>{dt}</dt>
          <dd className={ddClass}>{dd}</dd>
        </div>
      ))}
    </dl>
  );
}

function SalaryDeductionDetails({
  payload,
  variant,
}: {
  payload: Record<string, unknown>;
  variant: "admin" | "member";
}) {
  const str = (k: string) => {
    const v = payload[k];
    return typeof v === "string" ? v : v != null ? String(v) : "";
  };
  const dtClass =
    variant === "admin"
      ? "text-[var(--muted)] sm:pt-0.5"
      : "text-muted sm:pt-0.5";
  const ddClass =
    variant === "admin" ? "text-[var(--fg)] sm:col-start-2" : "text-ink sm:col-start-2";

  const rows: [string, string][] = [];
  const pairs: [string, string][] = [
    ["Reg. no.", str("regimentalNumber")],
    ["Rank", str("rank")],
    ["Name", str("fullName")],
    ["Department / division", str("departmentDivision")],
    ["Section / station", str("sectionStation")],
    ["Email", str("email")],
    ["Age", str("age")],
    ["Sex", str("sex")],
    ["Date of birth", str("dateOfBirth")],
    ["Date of enlistment", str("dateOfEnlistment")],
    ["Commencing", str("commencementDate")],
    ["Applicant date", str("applicantDateSigned")],
  ];
  for (const [k, v] of pairs) {
    if (v) rows.push([k, v]);
  }
  const addr = str("address");
  if (addr) rows.push(["Address", addr]);
  const cc = str("phoneCountryCode");
  const cell = str("phone");
  if (cc || cell) {
    rows.push([
      "Cell",
      [cc, cell].filter(Boolean).join(" "),
    ]);
  }
  const ph = str("phoneHome");
  if (ph) rows.push(["Home phone", ph]);
  const pw = str("phoneWork");
  if (pw) rows.push(["Work phone", pw]);
  const wn = str("witnessName");
  if (wn) rows.push(["Witness", wn]);
  const wd = str("witnessDate");
  if (wd) rows.push(["Witness date", wd]);

  return (
    <dl className="mt-2 grid gap-1.5 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
      {rows.map(([dt, dd]) => (
        <div key={dt} className="contents">
          <dt className={dtClass}>{dt}</dt>
          <dd className={ddClass}>{dd}</dd>
        </div>
      ))}
    </dl>
  );
}

function DentalOpticalGrantDetails({
  payload,
  variant,
}: {
  payload: Record<string, unknown>;
  variant: "admin" | "member";
}) {
  const str = (k: string) => {
    const v = payload[k];
    return typeof v === "string" ? v : v != null ? String(v) : "";
  };
  const dtClass =
    variant === "admin"
      ? "text-[var(--muted)] sm:pt-0.5"
      : "text-muted sm:pt-0.5";
  const ddClass =
    variant === "admin" ? "text-[var(--fg)] sm:col-start-2" : "text-ink sm:col-start-2";

  const cat = str("memberCategory");
  const memberLabel =
    cat === "srp" ? "SRP" : cat === "municipal" ? "Municipal Police" : cat;
  const grant = str("grantType");
  const grantLabel =
    grant === "dental"
      ? "Dental"
      : grant === "optical"
        ? "Optical"
        : grant === "both"
          ? "Dental & optical"
          : grant;

  const rows: [string, string][] = [];
  const pairs: [string, string][] = [
    ["Reg. no.", str("regimentalNumber")],
    ["Rank", str("rank")],
    ["Name", str("fullName")],
    ["Member category", memberLabel],
    ["Department / division", str("departmentDivision")],
    ["Section / station", str("sectionStation")],
    ["Email", str("email")],
    ["Grant type", grantLabel],
    ["Estimated (TTD)", str("estimatedAmountTTD")],
    ["Applicant date", str("applicantDateSigned")],
  ];
  for (const [k, v] of pairs) {
    if (v) rows.push([k, v]);
  }
  const addr = str("address");
  if (addr) rows.push(["Address", addr]);
  const cc = str("phoneCountryCode");
  const cell = str("phone");
  if (cc || cell) {
    rows.push(["Cell", [cc, cell].filter(Boolean).join(" ")]);
  }
  const ph = str("phoneHome");
  if (ph) rows.push(["Home phone", ph]);
  const pw = str("phoneWork");
  if (pw) rows.push(["Work phone", pw]);
  const td = str("treatmentDescription");
  if (td) rows.push(["Treatment / description", td]);
  const prov = str("providerName");
  if (prov) rows.push(["Provider", prov]);
  const qd = str("quoteOrVisitDate");
  if (qd) rows.push(["Quote / visit date", qd]);
  const wn = str("witnessName");
  if (wn) rows.push(["Witness", wn]);
  const wd = str("witnessDate");
  if (wd) rows.push(["Witness date", wd]);

  return (
    <dl className="mt-2 grid gap-1.5 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
      {rows.map(([dt, dd]) => (
        <div key={dt} className="contents">
          <dt className={dtClass}>{dt}</dt>
          <dd className={ddClass}>{dd}</dd>
        </div>
      ))}
    </dl>
  );
}

function MeritLoanApplicationDetails({
  payload,
  variant,
}: {
  payload: Record<string, unknown>;
  variant: "admin" | "member";
}) {
  const str = (k: string) => {
    const v = payload[k];
    return typeof v === "string" ? v : v != null ? String(v) : "";
  };
  const dtClass =
    variant === "admin"
      ? "text-[var(--muted)] sm:pt-0.5"
      : "text-muted sm:pt-0.5";
  const ddClass =
    variant === "admin" ? "text-[var(--fg)] sm:col-start-2" : "text-ink sm:col-start-2";

  const marital = str("maritalStatus");
  const maritalLabel: Record<string, string> = {
    single: "Single",
    married: "Married",
    civil_union: "Civil union",
    separated: "Separated",
    widowed: "Widowed",
    divorced: "Divorced",
  };
  const emp = str("employmentType");
  const empLabel =
    emp === "regular"
      ? "Regular"
      : emp === "special_reserve"
        ? "Special reserve"
        : emp === "contracted"
          ? "Contracted"
          : emp;

  const rows: [string, string][] = [];
  const pairs: [string, string][] = [
    ["Application date", str("dateOfApplication")],
    ["Reg. no.", str("regimentalNumber")],
    ["Rank", str("rank")],
    ["Name", str("fullName")],
    ["Email", str("email")],
    ["Marital status", maritalLabel[marital] ?? marital],
    ["Date of birth", str("dateOfBirth")],
    ["Age", str("age")],
    ["Dependents", str("numberOfDependents")],
    ["Employer", str("employer")],
    ["Div. / Br. / Sect.", str("divisionBranchSection")],
    ["Employment type", empLabel],
    ["Years of service", str("yearsOfService")],
    ["Amount requested (TTD)", str("amountRequestedTTD")],
    ["Prior merit loan applied", str("priorMeritLoanApplied") === "yes" ? "Yes" : str("priorMeritLoanApplied") === "no" ? "No" : str("priorMeritLoanApplied")],
    ["Net salary (TTD)", str("currentNetSalaryTTD")],
    ["Total deductions (TTD)", str("totalSalaryDeductionsTTD")],
    ["Repayment installment (TTD)", str("repaymentInstallmentTTD")],
    ["Repayment period (months)", str("repaymentPeriodMonths")],
    ["Applicant date", str("applicantDateSigned")],
  ];
  for (const [k, v] of pairs) {
    if (v) rows.push([k, v]);
  }
  const addr = str("address");
  if (addr) rows.push(["Address", addr]);
  const cc = str("phoneCountryCode");
  const cell = str("phone");
  if (cc || cell) {
    rows.push(["Cell", [cc, cell].filter(Boolean).join(" ")]);
  }
  const ph = str("phoneHome");
  if (ph) rows.push(["Home phone", ph]);
  const pw = str("phoneWork");
  if (pw) rows.push(["Work phone", pw]);
  const purpose = str("purposeOfLoan");
  if (purpose) rows.push(["Purpose of loan", purpose]);
  const wn = str("witnessName");
  if (wn) rows.push(["Witness", wn]);
  const wd = str("witnessDate");
  if (wd) rows.push(["Witness date", wd]);

  return (
    <dl className="mt-2 grid gap-1.5 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
      {rows.map(([dt, dd]) => (
        <div key={dt} className="contents">
          <dt className={dtClass}>{dt}</dt>
          <dd className={ddClass}>{dd}</dd>
        </div>
      ))}
    </dl>
  );
}

function LegalAidApplicationDetails({
  payload,
  variant,
}: {
  payload: Record<string, unknown>;
  variant: "admin" | "member";
}) {
  const str = (k: string) => {
    const v = payload[k];
    return typeof v === "string" ? v : v != null ? String(v) : "";
  };
  const dtClass =
    variant === "admin"
      ? "text-[var(--muted)] sm:pt-0.5"
      : "text-muted sm:pt-0.5";
  const ddClass =
    variant === "admin" ? "text-[var(--fg)] sm:col-start-2" : "text-ink sm:col-start-2";

  const mt = str("matterType");
  const matterLabel =
    mt === "criminal"
      ? "Criminal"
      : mt === "disciplinary"
        ? "Disciplinary"
        : mt === "both"
          ? "Criminal & disciplinary"
          : mt;

  const rows: [string, string][] = [];
  const pairs: [string, string][] = [
    ["Reg. no.", str("regimentalNumber")],
    ["Rank", str("rank")],
    ["Name", str("fullName")],
    ["Department / division", str("departmentDivision")],
    ["Section / station", str("sectionStation")],
    ["Email", str("email")],
    ["Matter type", matterLabel],
    ["Applicant date", str("applicantDateSigned")],
  ];
  for (const [k, v] of pairs) {
    if (v) rows.push([k, v]);
  }
  const addr = str("address");
  if (addr) rows.push(["Address", addr]);
  const cc = str("phoneCountryCode");
  const cell = str("phone");
  if (cc || cell) {
    rows.push(["Cell", [cc, cell].filter(Boolean).join(" ")]);
  }
  const ph = str("phoneHome");
  if (ph) rows.push(["Home phone", ph]);
  const pw = str("phoneWork");
  if (pw) rows.push(["Work phone", pw]);
  const md = str("matterDescription");
  if (md) rows.push(["Matter summary", md]);
  const court = str("courtOrUnit");
  if (court) rows.push(["Court / unit", court]);
  const ref = str("matterReference");
  if (ref) rows.push(["Reference", ref]);
  const dr = str("dateReported");
  if (dr) rows.push(["Date reported / charged", dr]);
  const wn = str("witnessName");
  if (wn) rows.push(["Witness", wn]);
  const wd = str("witnessDate");
  if (wd) rows.push(["Witness date", wd]);

  return (
    <dl className="mt-2 grid gap-1.5 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
      {rows.map(([dt, dd]) => (
        <div key={dt} className="contents">
          <dt className={dtClass}>{dt}</dt>
          <dd className={ddClass}>{dd}</dd>
        </div>
      ))}
    </dl>
  );
}

function RequestBody({
  row,
  variant,
}: {
  row: ServiceRequestRecord;
  variant: "admin" | "member";
}) {
  if (row.serviceType === "hotel_booking") {
    return <HotelBookingDetails payload={row.payload} variant={variant} />;
  }
  if (row.serviceType === "salary_deduction") {
    return <SalaryDeductionDetails payload={row.payload} variant={variant} />;
  }
  if (row.serviceType === "dental_optical_grant") {
    return <DentalOpticalGrantDetails payload={row.payload} variant={variant} />;
  }
  if (row.serviceType === "legal_aid_application") {
    return <LegalAidApplicationDetails payload={row.payload} variant={variant} />;
  }
  if (row.serviceType === "merit_loan_application") {
    return <MeritLoanApplicationDetails payload={row.payload} variant={variant} />;
  }
  return (
    <pre
      className={`mt-2 max-h-40 overflow-auto rounded border p-2 font-mono text-xs ${
        variant === "admin"
          ? "border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]"
          : "border-line bg-canvas text-ink dark:bg-surface"
      }`}
    >
      {JSON.stringify(row.payload, null, 2)}
    </pre>
  );
}

export function MemberServiceRequestsSection({
  requests,
  heading = "Requested services",
  variant,
}: {
  requests: ServiceRequestRecord[];
  heading?: string;
  variant: "admin" | "member";
}) {
  const shell =
    variant === "admin"
      ? "overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
      : "rounded-xl border border-line bg-canvas shadow-corp dark:bg-surface";

  const titleClass =
    variant === "admin"
      ? "text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
      : "text-xs font-semibold uppercase tracking-[0.2em] text-brand";

  const subClass =
    variant === "admin" ? "text-sm text-[var(--muted)]" : "text-sm text-muted";

  const cardBorder =
    variant === "admin"
      ? "border-[var(--border)] bg-[var(--bg)]"
      : "border-line bg-canvas/50 dark:bg-canvas/30";

  const heading3Class =
    variant === "admin" ? "font-medium text-[var(--fg)]" : "font-medium text-ink";

  const timeClass =
    variant === "admin" ? "font-mono text-xs text-[var(--muted)]" : "font-mono text-xs text-muted";

  return (
    <section className={shell}>
      <div
        className={
          variant === "admin"
            ? "border-b border-[var(--border)] bg-[var(--bg)] px-6 py-4"
            : "border-b border-line px-6 py-4"
        }
      >
        <h2 className={titleClass}>{heading}</h2>
        <p className={`mt-1 ${subClass}`}>
          Submissions linked to this email (e.g. hotel reservations).
        </p>
      </div>
      <div className="space-y-4 p-6">
        {requests.length === 0 ? (
          <p className={subClass}>No service requests on file for this email yet.</p>
        ) : (
          requests.map((row) => (
            <article key={row.id} className={`rounded-lg border p-4 ${cardBorder}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className={heading3Class}>{serviceLabel(row.serviceType)}</h3>
                <time dateTime={row.createdAt} className={timeClass}>
                  {row.createdAt.replace("T", " ").replace(/\.\d{3}Z$/, " UTC")}
                </time>
              </div>
              <RequestBody row={row} variant={variant} />
            </article>
          ))
        )}
      </div>
    </section>
  );
}
