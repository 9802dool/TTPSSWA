"use client";

import { useMemo, useState } from "react";
import {
  AssociationFormHeader,
  AssociationOfficersFooter,
} from "@/components/AssociationFormLetterhead";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

const line =
  "w-full min-w-0 border-0 border-b border-black bg-transparent px-1 py-0.5 text-[13px] uppercase text-black outline-none placeholder:normal-case placeholder:text-neutral-400 focus:border-[#0d2a70] disabled:bg-transparent";

const label = "whitespace-nowrap text-xs font-bold uppercase";

const MAX_DOCUMENT_BYTES = 800 * 1024;

export function DentalOpticalGrantForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const todaySigned = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const forename = String(fd.get("forename") ?? "").trim();
    const surname = String(fd.get("surname") ?? "").trim();
    fd.set("fullName", `${forename} ${surname}`.trim());

    const grantTypes = fd.getAll("grantType").map((value) => String(value));
    if (grantTypes.length === 0) {
      setStatus("error");
      setMessage("Please select Dental ($1000), Optical ($1000), or both.");
      return;
    }

    const file = fd.get("grantReceiptInvoiceDoc");
    if (!(file instanceof File) || file.size === 0) {
      setStatus("error");
      setMessage("Please attach the original receipt and/or invoice.");
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setStatus("error");
      setMessage("The receipt or invoice must be 800 KB or smaller.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/dental-optical-grant", {
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
        "Your dental and optical grant application has been received. You will be contacted if further information is needed.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-[850px] text-left text-[13px] text-black">
      <div className="mb-4 text-right print:hidden">
        <button
          type="submit"
          form="grantForm"
          disabled={status === "loading"}
          className="rounded bg-[#0d2a70] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {status === "loading" ? "Submitting…" : "Submit Application"}
        </button>
      </div>

      <form id="grantForm" onSubmit={(e) => void onSubmit(e)}>
        <div className="border border-[#ccc] bg-white px-6 py-8 shadow-[0_0_10px_rgba(0,0,0,0.1)] print:border-0 print:p-0 print:shadow-none sm:px-8">
          <AssociationFormHeader />

          <h4 className="mb-1 mt-4 text-center text-[15px] font-bold uppercase underline">
            Application for financial assistance re: Dental / Optical grant
          </h4>
          <p className="mb-1 text-center text-[12px] font-bold uppercase">
            For Special Reserve Police (S.R.P.&apos;s) and Municipal Police
          </p>
          <p className="mb-4 text-center text-[11px] font-bold uppercase">
            Please fill out in block letters
          </p>

          <fieldset className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <legend className={label}>Applicant:</legend>
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="radio" name="memberCategory" value="srp" required /> S.R.P.
            </label>
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="radio" name="memberCategory" value="municipal" /> Municipal
            </label>
          </fieldset>

          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-[0.4] items-end gap-2">
              <label htmlFor="dog-regimentalNumber" className={label}>
                Reg no
              </label>
              <input
                id="dog-regimentalNumber"
                name="regimentalNumber"
                type="text"
                required
                className={line}
              />
            </div>
            <div className="flex min-w-0 flex-[0.6] items-end gap-2">
              <label htmlFor="dog-rank" className={label}>
                Rank
              </label>
              <input id="dog-rank" name="rank" type="text" required className={line} />
            </div>
          </div>

          <div className="mb-3 flex items-end gap-2">
            <label htmlFor="dog-forename" className={label}>
              Name
            </label>
            <input
              id="dog-forename"
              name="forename"
              type="text"
              required
              placeholder="FORENAME"
              autoComplete="given-name"
              className={line}
            />
            <label htmlFor="dog-surname" className="sr-only">
              Surname
            </label>
            <input
              id="dog-surname"
              name="surname"
              type="text"
              required
              placeholder="SURNAME"
              autoComplete="family-name"
              className={line}
            />
          </div>

          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 items-end gap-2">
              <label htmlFor="dog-departmentDivision" className={label}>
                Department/Division
              </label>
              <input
                id="dog-departmentDivision"
                name="departmentDivision"
                type="text"
                required
                className={line}
              />
            </div>
            <div className="flex min-w-0 flex-1 items-end gap-2">
              <label htmlFor="dog-sectionStation" className={label}>
                Section/Station
              </label>
              <input
                id="dog-sectionStation"
                name="sectionStation"
                type="text"
                required
                className={line}
              />
            </div>
          </div>

          <div className="mb-3 flex items-end gap-2">
            <label htmlFor="dog-address" className={label}>
              Home address
            </label>
            <input
              id="dog-address"
              name="address"
              type="text"
              required
              autoComplete="street-address"
              className={line}
            />
          </div>

          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex min-w-0 flex-1 items-end gap-2">
              <label htmlFor="dog-phoneHome" className={label}>
                Contact numbers: Home
              </label>
              <input id="dog-phoneHome" name="phoneHome" type="tel" inputMode="tel" className={line} />
            </div>
            <div className="flex min-w-0 flex-1 items-end gap-2">
              <label htmlFor="dog-phoneWork" className={label}>
                Work
              </label>
              <input id="dog-phoneWork" name="phoneWork" type="tel" inputMode="tel" className={line} />
            </div>
            <div className="flex min-w-0 items-end gap-2 sm:max-w-[11rem]">
              <label htmlFor="dog-phoneCountryCode" className={label}>
                Code
              </label>
              <select
                id="dog-phoneCountryCode"
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
              <label htmlFor="dog-phone" className={label}>
                Cell
              </label>
              <input id="dog-phone" name="phone" type="tel" inputMode="tel" required className={line} />
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex w-full items-end gap-2 sm:max-w-[8rem]">
              <label htmlFor="dog-age" className={label}>
                Age
              </label>
              <input id="dog-age" name="age" type="number" required min={18} max={99} className={line} />
            </div>
            <fieldset className="flex min-w-0 flex-wrap items-center gap-3">
              <legend className={label}>Sex:</legend>
              <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
                <input type="radio" name="sex" value="male" required /> Male
              </label>
              <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
                <input type="radio" name="sex" value="female" /> Female
              </label>
            </fieldset>
            <div className="flex min-w-0 flex-1 items-end gap-2">
              <label htmlFor="dog-email" className={label}>
                Email address
              </label>
              <input
                id="dog-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={`${line} normal-case`}
              />
            </div>
          </div>

          <fieldset className="mb-3 mt-3 flex flex-wrap items-center gap-3">
            <legend className={label}>Grant applied for:</legend>
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="checkbox" name="grantType" value="dental" /> Dental ($1000)
            </label>
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="checkbox" name="grantType" value="optical" /> Optical ($1000)
            </label>
          </fieldset>

          <div className="mb-3 flex items-end gap-2">
            <label htmlFor="dog-previousGrant" className={`${label} whitespace-normal`}>
              Have you ever received any grant? If yes please state
            </label>
            <input id="dog-previousGrant" name="previousGrant" type="text" className={line} />
          </div>

          <div className="mb-3 flex items-end gap-2">
            <label htmlFor="dog-documentsList" className={label}>
              List document(s) attached
            </label>
            <input
              id="dog-documentsList"
              name="documentsList"
              type="text"
              required
              placeholder="Receipt or invoice"
              className={line}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="flex-[1.5]">
              <div className="mb-1 h-8 border-b border-black" />
              <p className="text-[11px] font-bold uppercase">Signature of applicant</p>
              <p className="mt-1 text-[10px] uppercase text-neutral-700">
                Online submission counts as your electronic signature.
              </p>
            </div>
            <div className="flex min-w-0 flex-1 items-end gap-2">
              <label htmlFor="dog-applicantDateSigned" className={label}>
                Date
              </label>
              <input
                id="dog-applicantDateSigned"
                name="applicantDateSigned"
                type="date"
                required
                defaultValue={todaySigned}
                className={`${line} normal-case`}
              />
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs font-bold">
            <label className="flex items-start gap-2">
              <input type="checkbox" name="declarationAccurate" value="yes" required className="mt-0.5" />
              <span>I declare that the information provided is true and complete.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="electronicSignature" value="yes" required className="mt-0.5" />
              <span>Submitting this form is my electronic signature.</span>
            </label>
          </div>

          <p className="mt-4 text-center text-[11px] font-bold uppercase">
            N.B Original receipts and/or invoices must support all claims
          </p>

          <fieldset disabled className="mt-5 border-t-2 border-black pt-3">
            <legend className="text-[13px] font-bold uppercase">Official use only</legend>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex min-w-0 flex-1 items-end gap-2">
                <span className={label}>1. Date of membership</span>
                <input type="date" className={`${line} normal-case`} />
              </div>
              <div className="flex min-w-0 flex-1 items-end gap-2">
                <span className={label}>Remarks</span>
                <input type="text" className={line} />
              </div>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className={label}>2. Subscriptions up to date:</span>
              <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
                <input type="radio" name="off_sub_up_to_date" value="YES" /> Yes
              </label>
              <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
                <input type="radio" name="off_sub_up_to_date" value="NO" /> No
              </label>
            </div>
            <div className="mb-3 flex items-end gap-2">
              <span className={label}>3. If no, please state amount outstanding $</span>
              <input type="text" className={line} />
            </div>
            <div className="mb-3 mt-4 flex items-end gap-2">
              <span className={label}>Payment approved by:</span>
              <input type="text" className={line} />
            </div>
            <div className="mb-3 flex items-end gap-2">
              <span className={label}>President/Secretary:</span>
              <input type="text" className={line} />
            </div>
          </fieldset>

          <AssociationOfficersFooter variant="dentalOptical" dated="Apr 2026" />
        </div>

        <div className="mt-5 border-2 border-dashed border-[#0d2a70] bg-[#f8faee] p-4 print:hidden">
          <p className="mb-2 text-xs font-bold uppercase text-[#b30000]">
            * Required documentation for submission:
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="dog-grantReceiptInvoiceDoc" className="text-xs font-bold uppercase">
              Attach original receipt or invoice:
            </label>
            <input
              id="dog-grantReceiptInvoiceDoc"
              name="grantReceiptInvoiceDoc"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="text-xs"
            />
          </div>
          <p className="mt-2 text-[11px]">PDF, JPG, or PNG. Maximum 800 KB. This upload is not part of the printed form.</p>
        </div>

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
      </form>
    </div>
  );
}
