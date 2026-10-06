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
  "w-full min-w-0 border-0 border-b border-black bg-transparent px-1 py-0.5 text-[13px] uppercase text-black outline-none placeholder:normal-case placeholder:text-neutral-400 focus:border-[#0d2a70] read-only:bg-[#f0f0f0] read-only:font-bold";

const label = "whitespace-nowrap text-xs font-bold uppercase";

const section =
  "mb-3 mt-4 border border-[#ccc] bg-[#e6ecf8] px-2 py-1 text-xs font-bold uppercase";

const MAX_DOCUMENT_BYTES = 800 * 1024;

const MERIT_DOCUMENTS = [
  {
    name: "idDocument",
    label: "1. ID card / passport / driver's permit",
  },
  { name: "payslipDocument", label: "2. Payslip" },
] as const;

export function MeritLoanForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const todaySigned = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const firstName = String(fd.get("firstName") ?? "").trim();
    const surname = String(fd.get("surname") ?? "").trim();
    fd.set("fullName", `${firstName} ${surname}`.trim());
    fd.set("applicantDateSigned", String(fd.get("dateOfApplication") ?? "").trim());
    fd.set("documentIdCard", "yes");
    fd.set("documentPayslip", "yes");

    for (const doc of MERIT_DOCUMENTS) {
      const file = fd.get(doc.name);
      if (!(file instanceof File) || file.size === 0) {
        setStatus("error");
        setMessage(`Please upload ${doc.label}.`);
        return;
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        setStatus("error");
        setMessage(`${doc.label} must be 800 KB or smaller.`);
        return;
      }
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/merit-loan-application", {
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
        "Your M.E.R.I.T. loan application has been received. You will be contacted if further information is needed.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form
      id="meritForm"
      onSubmit={(e) => void onSubmit(e)}
      className="merit-loan-form-pdf mx-auto max-w-[850px] text-left text-[13px] text-black"
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
        <p className="mt-2 text-center text-[13px] font-bold">
          Members Equity Relief In Times of need
        </p>
        <h4 className="mb-4 text-center text-base font-bold uppercase underline">
          Merit application form
        </h4>

        <div className="mb-3 flex max-w-sm items-end gap-2">
          <label htmlFor="ml-dateOfApplication" className={label}>
            Date of application:
          </label>
          <input
            id="ml-dateOfApplication"
            name="dateOfApplication"
            type="date"
            required
            defaultValue={todaySigned}
            className={`${line} normal-case`}
          />
        </div>

        <h5 className={section}>Personal information</h5>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-regimentalNumber" className={label}>
              Reg. no.:
            </label>
            <input
              id="ml-regimentalNumber"
              name="regimentalNumber"
              type="text"
              required
              className={line}
            />
          </div>
          <div className="flex min-w-0 flex-[1.4] items-end gap-2">
            <label htmlFor="ml-rank" className={label}>
              Rank:
            </label>
            <input id="ml-rank" name="rank" type="text" required className={line} />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-firstName" className={label}>
              Name:
            </label>
            <input
              id="ml-firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              placeholder="FIRST NAME"
              className={line}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-end">
            <label htmlFor="ml-surname" className="sr-only">
              Surname
            </label>
            <input
              id="ml-surname"
              name="surname"
              type="text"
              required
              autoComplete="family-name"
              placeholder="SURNAME"
              className={line}
            />
          </div>
        </div>

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="ml-address" className={label}>
            Address:
          </label>
          <input
            id="ml-address"
            name="address"
            type="text"
            required
            autoComplete="street-address"
            className={line}
          />
        </div>

        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-phoneCountryCode" className={label}>
              Code
            </label>
            <select
              id="ml-phoneCountryCode"
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
            <label htmlFor="ml-phone" className={label}>
              Telephone contact: Mobile
            </label>
            <input id="ml-phone" name="phone" type="tel" inputMode="tel" required className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-phoneWork" className={label}>
              Work
            </label>
            <input id="ml-phoneWork" name="phoneWork" type="tel" inputMode="tel" className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-phoneHome" className={label}>
              Home
            </label>
            <input id="ml-phoneHome" name="phoneHome" type="tel" inputMode="tel" className={line} />
          </div>
        </div>

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="ml-email" className={label}>
            Email address:
          </label>
          <input
            id="ml-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`${line} normal-case`}
          />
        </div>

        <fieldset className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <legend className={label}>Marital status:</legend>
          {(
            [
              ["single", "Single"],
              ["married", "Married"],
              ["civil_union", "Civil union"],
              ["separated", "Separated"],
              ["widowed", "Widowed"],
              ["divorced", "Divorced"],
            ] as const
          ).map(([value, text]) => (
            <label key={value} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase">
              <input type="radio" name="maritalStatus" value={value} required={value === "single"} />
              {text}
            </label>
          ))}
        </fieldset>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-dateOfBirth" className={label}>
              Date of birth:
            </label>
            <input
              id="ml-dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              className={`${line} normal-case`}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-age" className={label}>
              Age:
            </label>
            <input id="ml-age" name="age" type="number" required min={18} className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-numberOfDependents" className={label}>
              No. of dependents:
            </label>
            <input
              id="ml-numberOfDependents"
              name="numberOfDependents"
              type="number"
              required
              min={0}
              className={line}
            />
          </div>
        </div>

        <h5 className={section}>Employment details</h5>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-employer" className={label}>
              Employer:
            </label>
            <input id="ml-employer" name="employer" type="text" required className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-divisionBranchSection" className={label}>
              Div/Br/Sect:
            </label>
            <input
              id="ml-divisionBranchSection"
              name="divisionBranchSection"
              type="text"
              required
              className={line}
            />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <fieldset className="flex flex-1 flex-wrap items-center gap-3">
            <legend className="sr-only">Employment type</legend>
            {(
              [
                ["regular", "Regular"],
                ["special_reserve", "Special reserve"],
                ["contracted", "Contracted"],
              ] as const
            ).map(([value, text]) => (
              <label key={value} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase">
                <input type="radio" name="employmentType" value={value} required={value === "regular"} />
                {text}
              </label>
            ))}
          </fieldset>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-yearsOfService" className={label}>
              Years of service:
            </label>
            <input
              id="ml-yearsOfService"
              name="yearsOfService"
              type="number"
              required
              min={0}
              className={line}
            />
          </div>
        </div>

        <h5 className={section}>
          Documents submitted (walk with originals, copies to be submitted only)
        </h5>

        <div className="mb-4 border border-dashed border-[#0d2a70] bg-[#f8faee] p-3">
          <p className="mb-2 text-[11px] font-bold uppercase">
            Attach required documents for online registration:
          </p>
          {MERIT_DOCUMENTS.map((doc) => (
            <div key={doc.name} className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center">
              <label htmlFor={`ml-${doc.name}`} className="text-[11px] font-bold uppercase sm:w-[250px]">
                {doc.label}:
              </label>
              <input
                id={`ml-${doc.name}`}
                name={doc.name}
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="text-[11px]"
              />
            </div>
          ))}
          <p className="text-[10px] uppercase text-neutral-700">PDF, JPG, or PNG. Maximum 800 KB each.</p>
        </div>

        <h5 className={section}>Merit details</h5>

        <fieldset className="mb-3 flex flex-wrap items-center gap-3">
          <legend className={label}>Have you ever applied for a merit loan?</legend>
          <label className="inline-flex items-center gap-1 text-[11px] font-bold uppercase">
            <input type="radio" name="priorMeritLoanApplied" value="yes" required /> Yes
          </label>
          <label className="inline-flex items-center gap-1 text-[11px] font-bold uppercase">
            <input type="radio" name="priorMeritLoanApplied" value="no" /> No
          </label>
        </fieldset>

        <div className="mb-3 flex max-w-sm items-end gap-2">
          <label htmlFor="ml-amountRequestedTTD" className={label}>
            Amount requesting $:
          </label>
          <input
            id="ml-amountRequestedTTD"
            name="amountRequestedTTD"
            type="text"
            readOnly
            value="3000.00"
            className={line}
          />
        </div>

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="ml-purposeOfLoan" className={label}>
            Purpose of M.E.R.I.T. loan:
          </label>
          <input id="ml-purposeOfLoan" name="purposeOfLoan" type="text" required className={line} />
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-currentNetSalaryTTD" className={label}>
              Current net salary $:
            </label>
            <input
              id="ml-currentNetSalaryTTD"
              name="currentNetSalaryTTD"
              type="text"
              required
              inputMode="decimal"
              className={line}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-totalSalaryDeductionsTTD" className={label}>
              Total salary deductions $:
            </label>
            <input
              id="ml-totalSalaryDeductionsTTD"
              name="totalSalaryDeductionsTTD"
              type="text"
              required
              inputMode="decimal"
              className={line}
            />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-repaymentInstallmentTTD" className={label}>
              Repayment installment $:
            </label>
            <input
              id="ml-repaymentInstallmentTTD"
              name="repaymentInstallmentTTD"
              type="text"
              readOnly
              value="500.00"
              className={line}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="ml-repaymentPeriodMonths" className={label}>
              Period for repayment:
            </label>
            <input
              id="ml-repaymentPeriodMonths"
              name="repaymentPeriodMonths"
              type="text"
              readOnly
              value="6"
              className={`${line} max-w-[4rem]`}
            />
            <span className="text-xs font-bold uppercase">Months</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="sm:flex-[2]">
            <div className="mb-1 h-8 border-b border-black" />
            <p className="text-[11px] font-bold uppercase">Signature of applicant</p>
            <p className="mt-1 text-[10px] uppercase text-neutral-700">
              Online submission counts as your electronic signature.
            </p>
          </div>
          <div className="flex flex-1 items-end gap-2">
            <label htmlFor="ml-signatureRegimentalNumber" className={label}>
              Reg. no.
            </label>
            <input
              id="ml-signatureRegimentalNumber"
              name="signatureRegimentalNumber"
              type="text"
              required
              className={line}
            />
          </div>
          <div className="flex flex-1 items-end gap-2">
            <label htmlFor="ml-signatureRank" className={label}>
              Rank
            </label>
            <input id="ml-signatureRank" name="signatureRank" type="text" required className={line} />
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
          N.B. No more than two merit loans per calender year
        </p>

        <AssociationOfficersFooter variant="merit" />

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
