"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AssociationFormHeader,
  AssociationOfficersFooter,
} from "@/components/AssociationFormLetterhead";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

const line =
  "w-full min-w-0 border-0 border-b border-black bg-transparent px-1 py-0.5 text-[13px] uppercase text-black outline-none placeholder:normal-case placeholder:text-neutral-400 focus:border-[#0d2a70]";

const label = "whitespace-nowrap text-xs font-bold uppercase";

const CATEGORIES = [
  "Legal Representation",
  "Judicial Review",
  "Three Man Tribunal",
  "Compensation",
  "Ordinary Tribunal",
  "E.O.C",
  "Criminal Litigation",
] as const;

const DISCIPLINARY = new Set<string>(["Three Man Tribunal", "Ordinary Tribunal"]);

function matterTypeFromCategories(categories: string[]): "criminal" | "disciplinary" | "both" {
  const hasDisciplinary = categories.some((item) => DISCIPLINARY.has(item));
  const hasOther = categories.some((item) => !DISCIPLINARY.has(item));
  if (hasDisciplinary && hasOther) return "both";
  if (hasDisciplinary) return "disciplinary";
  return "criminal";
}

export function LegalAidApplicationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const todaySigned = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const categories = fd.getAll("legalCategory").map((value) => String(value));
    if (categories.length === 0) {
      setStatus("error");
      setMessage("Please select at least one type of legal aid.");
      return;
    }

    const forename = String(fd.get("forename") ?? "").trim();
    const surname = String(fd.get("surname") ?? "").trim();
    const particulars = String(fd.get("offenceParticulars") ?? "").trim();
    const lawyer = String(fd.get("lawyerRetained") ?? "").trim();
    const court = String(fd.get("courtOrUnit") ?? "").trim();
    const hearing = String(fd.get("dateOfHearing") ?? "").trim();
    const postponements = String(fd.get("postponements") ?? "").trim();
    const money = String(fd.get("moneyPaid") ?? "").trim();
    const applicationDate = String(fd.get("applicationDate") ?? "").trim();

    fd.set("fullName", `${forename} ${surname}`.trim());
    fd.set("matterType", matterTypeFromCategories(categories));
    fd.set("dateReported", hearing);
    fd.set(
      "matterDescription",
      [
        applicationDate && `Application date: ${applicationDate}`,
        `Categories: ${categories.join("; ")}`,
        `Particulars of alleged offence(s): ${particulars}`,
        lawyer && `Lawyer retained: ${lawyer}`,
        court && `Court of hearing: ${court}`,
        hearing && `Date of hearing: ${hearing}`,
        postponements && `Postponements: ${postponements}`,
        money && `Money paid by applicant: ${money}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );

    setStatus("loading");
    try {
      const res = await fetch("/api/legal-aid-application", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage(
        "Your legal aid application has been received. The Association will contact you if further information is required.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form
      id="legalAidForm"
      onSubmit={(e) => void onSubmit(e)}
      className="legal-aid-application-form-pdf mx-auto max-w-[850px] text-left text-[13px] text-black"
    >
      <div className="mb-4 text-right">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-[#0d2a70] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {status === "loading" ? "Submitting…" : "Submit Application"}
        </button>
      </div>

      <div className="border border-[#ccc] bg-white px-6 py-8 shadow-[0_0_10px_rgba(0,0,0,0.1)] sm:px-8">
        <AssociationFormHeader />

        <h4 className="mt-4 text-center text-base font-bold uppercase underline">
          Legal aid application
        </h4>

        <div className="mb-3 mt-4 flex max-w-xs items-end gap-2">
          <label htmlFor="la-applicationDate" className={label}>
            Date
          </label>
          <input
            id="la-applicationDate"
            name="applicationDate"
            type="date"
            required
            defaultValue={todaySigned}
            className={`${line} normal-case`}
          />
        </div>

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="la-to" className={label}>
            To
          </label>
          <input
            id="la-to"
            name="addressee"
            type="text"
            readOnly
            value="The President/Secretary"
            className={line}
          />
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="la-regimentalNumber" className={label}>
              From no.
            </label>
            <input
              id="la-regimentalNumber"
              name="regimentalNumber"
              type="text"
              required
              className={line}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="la-rank" className={label}>
              Rank
            </label>
            <input id="la-rank" name="rank" type="text" required className={line} />
          </div>
          <div className="flex min-w-0 flex-[1.4] items-end gap-2">
            <label htmlFor="la-forename" className={label}>
              Name
            </label>
            <input
              id="la-forename"
              name="forename"
              type="text"
              required
              autoComplete="given-name"
              placeholder="FORENAME"
              className={line}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-end">
            <label htmlFor="la-surname" className="sr-only">
              Surname
            </label>
            <input
              id="la-surname"
              name="surname"
              type="text"
              required
              autoComplete="family-name"
              placeholder="SURNAME"
              className={line}
            />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="la-departmentDivision" className={label}>
              Department / Division
            </label>
            <input
              id="la-departmentDivision"
              name="departmentDivision"
              type="text"
              required
              className={line}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="la-sectionStation" className={label}>
              Section / Station
            </label>
            <input id="la-sectionStation" name="sectionStation" type="text" required className={line} />
          </div>
        </div>

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="la-address" className={label}>
            Home address
          </label>
          <input
            id="la-address"
            name="address"
            type="text"
            required
            autoComplete="street-address"
            className={line}
          />
        </div>

        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="la-phoneCountryCode" className={label}>
              Code
            </label>
            <select
              id="la-phoneCountryCode"
              name="phoneCountryCode"
              required
              defaultValue={MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE}
              className={`${line} normal-case`}
            >
              {MEMBERSHIP_PHONE_COUNTRY_CODES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="la-phoneHome" className={label}>
              Contact: Home
            </label>
            <input id="la-phoneHome" name="phoneHome" type="tel" inputMode="tel" className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="la-phoneWork" className={label}>
              Work
            </label>
            <input id="la-phoneWork" name="phoneWork" type="tel" inputMode="tel" className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="la-phone" className={label}>
              Cell
            </label>
            <input id="la-phone" name="phone" type="tel" inputMode="tel" required className={line} />
          </div>
          <div className="flex min-w-0 flex-[1.3] items-end gap-2">
            <label htmlFor="la-email" className={label}>
              Email address
            </label>
            <input
              id="la-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={`${line} normal-case`}
            />
          </div>
        </div>

        <fieldset className="my-4 grid gap-2 sm:grid-cols-2">
          <legend className="sr-only">Type of legal aid</legend>
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2 text-xs font-bold uppercase">
              <input type="checkbox" name="legalCategory" value={category} />
              {category}
            </label>
          ))}
        </fieldset>

        <div className="my-4 flex flex-col gap-3 border border-black p-3 sm:flex-row sm:justify-between">
          <p className="text-xs font-bold uppercase">
            Please note:
            <br />
            The following documents must be attached for processing
          </p>
          <ul className="list-disc pl-5 text-xs">
            <li>Report from Applicant</li>
            <li>Copy of Charge(s)</li>
            <li>Warning Notice(s)</li>
            <li>Requisition from Attorney</li>
            <li>Photos of Incident (Where applicable)</li>
          </ul>
        </div>

        <p className="my-4 text-center text-[11px] font-bold uppercase">Complete in block letters</p>

        <div className="mb-3">
          <label htmlFor="la-offenceParticulars" className={`${label} block whitespace-normal`}>
            1. Particulars of alleged offence(s)
          </label>
          <textarea
            id="la-offenceParticulars"
            name="offenceParticulars"
            rows={4}
            required
            className={`${line} mt-1 min-h-[5.5rem] resize-y`}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="la-lawyerRetained" className={label}>
            2. Lawyer retained (if any)
          </label>
          <input id="la-lawyerRetained" name="lawyerRetained" type="text" className={`${line} mt-1`} />
        </div>

        <div className="mb-3">
          <label htmlFor="la-courtOrUnit" className={label}>
            3. Court of hearing
          </label>
          <input id="la-courtOrUnit" name="courtOrUnit" type="text" className={`${line} mt-1`} />
        </div>

        <div className="mb-3 max-w-xs">
          <label htmlFor="la-dateOfHearing" className={label}>
            4. Date of hearing
          </label>
          <input
            id="la-dateOfHearing"
            name="dateOfHearing"
            type="date"
            className={`${line} mt-1 normal-case`}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="la-postponements" className={label}>
            5. Postponements
          </label>
          <input id="la-postponements" name="postponements" type="text" className={`${line} mt-1`} />
        </div>

        <div className="mb-3">
          <label htmlFor="la-moneyPaid" className={`${label} block whitespace-normal`}>
            6. Money paid by applicant (if any){" "}
            <span className="font-normal normal-case">(Please attach original receipt)</span>
          </label>
          <input id="la-moneyPaid" name="moneyPaid" type="text" className={`${line} mt-1`} />
        </div>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row">
          <div className="flex-1">
            <div className="mb-1 h-8 border-b border-black" />
            <p className="text-[11px] font-bold uppercase">Signature of applicant</p>
            <p className="mt-1 text-[10px] uppercase text-neutral-700">
              Online submission counts as your electronic signature.
            </p>
          </div>
          <div className="flex flex-1 items-end gap-2">
            <label htmlFor="la-applicantDateSigned" className={label}>
              Date
            </label>
            <input
              id="la-applicantDateSigned"
              name="applicantDateSigned"
              type="date"
              required
              defaultValue={todaySigned}
              className={`${line} normal-case`}
            />
          </div>
        </div>

        <label className="mt-4 flex items-start gap-2 text-[11px] font-bold uppercase">
          <input type="checkbox" name="declarationAccurate" value="yes" required className="mt-0.5" />
          <span>I declare that the information provided is true and complete.</span>
        </label>
        <label className="mt-2 flex items-start gap-2 text-[11px] font-bold uppercase">
          <input type="checkbox" name="electronicSignature" value="yes" required className="mt-0.5" />
          <span>Submitting this form is my electronic signature.</span>
        </label>

        <p className="mt-4 text-center text-[10.5px] font-bold uppercase">
          N.B The Association is not obligated in any way for the full fees applied for. Please be
          guided accordingly.
        </p>

        <fieldset disabled className="mt-5 border-t-2 border-black pt-3">
          <legend className="px-1 text-[13px] font-bold uppercase">◆ For official use only</legend>
          <div className="mb-3 mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 items-end gap-2">
              <span className={label}>1. Date of membership</span>
              <input type="date" className={`${line} normal-case`} />
            </div>
            <div className="flex min-w-0 flex-1 items-end gap-2">
              <span className={label}>Remarks #1</span>
              <input type="text" className={line} />
            </div>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className={label}>2. Subscriptions up to date:</span>
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="radio" name="offSubUpToDate" value="YES" /> Yes
            </label>
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="radio" name="offSubUpToDate" value="NO" /> No
            </label>
          </div>
          <div className="flex items-end gap-2">
            <span className={`${label} whitespace-normal`}>
              3. If no, please state amount outstanding $
            </span>
            <input type="text" className={line} />
          </div>
        </fieldset>

        <AssociationOfficersFooter variant="membership" />

        {message ? (
          <p
            role="status"
            className={
              status === "success"
                ? "mt-4 border border-green-700 bg-green-50 px-3 py-3 text-sm text-green-950"
                : "mt-4 border border-red-700 bg-red-50 px-3 py-3 text-sm text-red-950"
            }
          >
            {message}
          </p>
        ) : null}

        <p className="mt-4 text-[10px] uppercase text-neutral-600">
          Questions? See{" "}
          <Link href="/membership-services" className="underline">
            Membership services
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
