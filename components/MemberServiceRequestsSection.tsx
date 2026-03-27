import type { ServiceRequestRecord } from "@/lib/analytics-storage";

function serviceLabel(type: string): string {
  if (type === "hotel_booking") return "Hotel reservation";
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
  const rooms = str("rooms");
  const guests = str("guests");
  if (rooms) rows.push(["Rooms", rooms]);
  if (guests) rows.push(["Guests", guests]);
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
