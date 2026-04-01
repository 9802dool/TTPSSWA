"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

const PDF_HREF = "/forms/MERIT LOAN FORM.pdf";

const inputClass =
  "mt-1 w-full rounded-sm border border-slate-400 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-none outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-400 dark:bg-white dark:text-slate-900";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-800 dark:text-slate-800";

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-2 border-slate-900 bg-white shadow-none dark:border-slate-900 dark:bg-white">
      <div className="border-b-2 border-slate-900 bg-slate-100 px-3 py-2.5 dark:bg-slate-100">
        <h2 className="text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">
          <span className="mr-2 inline-block min-w-[1.25rem] font-mono">{number}.</span>
          {title}
        </h2>
      </div>
      <div className="space-y-4 bg-white p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function MeritLoanForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const todaySigned = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setStatus("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);
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
        "Your merit loan application has been received. You will be contacted if further information is needed.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="merit-loan-form-pdf mt-2 space-y-5 text-left"
    >
      <div className="border-b-2 border-slate-900 pb-5 text-center">
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-[0.28em] text-slate-700">
          Trinidad and Tobago Police Service
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
          Social and Welfare Association
        </p>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-900 underline decoration-2 underline-offset-4">
          Merit application form
        </p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Please fill out in block letters
        </p>
      </div>

      <div className="border border-slate-400 bg-white p-4 text-xs leading-relaxed text-slate-700 dark:bg-white">
        <p>
          This online form matches the official{" "}
          <a
            href={PDF_HREF}
            className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-2 hover:text-slate-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Merit loan application (PDF)
          </a>
          . Fields marked <span className="font-bold text-red-600">*</span> are required. N.B. No
          more than two merit loans per calendar year.
        </p>
      </div>

      <Section number="I" title="Application date">
        <div className="max-w-xs">
          <label htmlFor="ml-dateOfApplication" className={labelClass}>
            Date of application <span className="text-red-600">*</span>
          </label>
          <input
            id="ml-dateOfApplication"
            name="dateOfApplication"
            type="date"
            required
            defaultValue={todaySigned}
            className={inputClass}
          />
        </div>
      </Section>

      <Section number="II" title="Personal information">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ml-regimentalNumber" className={labelClass}>
              Reg. no. <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-regimentalNumber"
              name="regimentalNumber"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div>
            <label htmlFor="ml-rank" className={labelClass}>
              Rank <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-rank"
              name="rank"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ml-fullName" className={labelClass}>
              Name (forename and surname) <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-fullName"
              name="fullName"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ml-address" className={labelClass}>
              Address <span className="text-red-600">*</span>
            </label>
            <textarea
              id="ml-address"
              name="address"
              rows={4}
              required
              autoComplete="street-address"
              className={`${inputClass} resize-y min-h-[5rem] uppercase`}
            />
          </div>
        </div>
      </Section>

      <Section number="III" title="Contact information">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="ml-email" className={labelClass}>
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ml-phoneCountryCode" className={labelClass}>
              Country code (cell) <span className="text-red-600">*</span>
            </label>
            <select
              id="ml-phoneCountryCode"
              name="phoneCountryCode"
              required
              defaultValue={MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE}
              className={inputClass}
            >
              {MEMBERSHIP_PHONE_COUNTRY_CODES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ml-phone" className={labelClass}>
              Mobile (cell) <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="ml-phoneWork" className={labelClass}>
              Work phone (optional)
            </label>
            <input
              id="ml-phoneWork"
              name="phoneWork"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="ml-phoneHome" className={labelClass}>
              Home phone (optional)
            </label>
            <input
              id="ml-phoneHome"
              name="phoneHome"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
        </div>
      </Section>

      <Section number="IV" title="Marital status & dependents">
        <fieldset className="border border-slate-400 bg-white p-3 dark:bg-white">
          <legend className={`${labelClass} px-1`}>
            Marital status <span className="text-red-600">*</span>
          </legend>
          <div className="mt-1 flex flex-wrap gap-3 sm:gap-4">
            {(
              [
                ["single", "Single"],
                ["married", "Married"],
                ["civil_union", "Civil union"],
                ["separated", "Separated"],
                ["widowed", "Widowed"],
                ["divorced", "Divorced"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-900 sm:text-sm"
              >
                <input
                  type="radio"
                  name="maritalStatus"
                  value={value}
                  required
                  className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="ml-dateOfBirth" className={labelClass}>
              Date of birth <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ml-age" className={labelClass}>
              Age <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-age"
              name="age"
              type="text"
              inputMode="numeric"
              required
              className={inputClass}
              placeholder="e.g. 42"
            />
          </div>
          <div>
            <label htmlFor="ml-numberOfDependents" className={labelClass}>
              No. of dependents <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-numberOfDependents"
              name="numberOfDependents"
              type="number"
              min={0}
              step={1}
              required
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section number="V" title="Employment details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="ml-employer" className={labelClass}>
              Employer <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-employer"
              name="employer"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ml-divisionBranchSection" className={labelClass}>
              Div. / Br. / Sect. <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-divisionBranchSection"
              name="divisionBranchSection"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
        </div>
        <fieldset className="border border-slate-400 bg-white p-3 dark:bg-white">
          <legend className={`${labelClass} px-1`}>
            Employment type <span className="text-red-600">*</span>
          </legend>
          <div className="mt-1 flex flex-wrap gap-6">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="employmentType"
                value="regular"
                required
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              Regular
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="employmentType"
                value="special_reserve"
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              Special reserve
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="employmentType"
                value="contracted"
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              Contracted
            </label>
          </div>
        </fieldset>
        <div className="max-w-xs">
          <label htmlFor="ml-yearsOfService" className={labelClass}>
            Years of service <span className="text-red-600">*</span>
          </label>
          <input
            id="ml-yearsOfService"
            name="yearsOfService"
            type="text"
            required
            className={inputClass}
            placeholder="e.g. 12"
          />
        </div>
      </Section>

      <Section number="VI" title="Documents (walk with originals; submit copies)">
        <p className="text-xs leading-relaxed text-slate-600">
          Confirm you will provide copies as on the official form (ID card / passport / driver
          permit; payslip).
        </p>
        <label className="flex cursor-pointer gap-3 border border-slate-400 bg-white p-4 text-sm text-slate-900 dark:bg-white">
          <input
            type="checkbox"
            name="documentIdCard"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 border-slate-600 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium uppercase tracking-wide">
            I will submit a copy of ID card / passport / driver permit.{" "}
            <span className="text-red-600">*</span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 border border-slate-400 bg-white p-4 text-sm text-slate-900 dark:bg-white">
          <input
            type="checkbox"
            name="documentPayslip"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 border-slate-600 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium uppercase tracking-wide">
            I will submit a copy of my payslip. <span className="text-red-600">*</span>
          </span>
        </label>
      </Section>

      <Section number="VII" title="Merit loan details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ml-amountRequestedTTD" className={labelClass}>
              Amount requesting (TTD) <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-amountRequestedTTD"
              name="amountRequestedTTD"
              type="text"
              inputMode="decimal"
              required
              className={inputClass}
              placeholder="e.g. 5000.00"
            />
          </div>
          <fieldset className="border border-slate-400 bg-white p-3 dark:bg-white sm:col-span-2">
            <legend className={`${labelClass} px-1`}>
              Have you ever applied for a merit loan? <span className="text-red-600">*</span>
            </legend>
            <div className="mt-1 flex flex-wrap gap-6">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
                <input
                  type="radio"
                  name="priorMeritLoanApplied"
                  value="yes"
                  required
                  className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
                />
                Yes
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
                <input
                  type="radio"
                  name="priorMeritLoanApplied"
                  value="no"
                  className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
                />
                No
              </label>
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <label htmlFor="ml-purposeOfLoan" className={labelClass}>
              Purpose of M.E.R.I.T. loan <span className="text-red-600">*</span>
            </label>
            <textarea
              id="ml-purposeOfLoan"
              name="purposeOfLoan"
              rows={5}
              required
              className={`${inputClass} resize-y min-h-[6rem]`}
            />
          </div>
          <div>
            <label htmlFor="ml-currentNetSalaryTTD" className={labelClass}>
              Current net salary (TTD) <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-currentNetSalaryTTD"
              name="currentNetSalaryTTD"
              type="text"
              inputMode="decimal"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ml-totalSalaryDeductionsTTD" className={labelClass}>
              Total salary deductions (TTD) <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-totalSalaryDeductionsTTD"
              name="totalSalaryDeductionsTTD"
              type="text"
              inputMode="decimal"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ml-repaymentInstallmentTTD" className={labelClass}>
              Repayment installment (TTD) <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-repaymentInstallmentTTD"
              name="repaymentInstallmentTTD"
              type="text"
              inputMode="decimal"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ml-repaymentPeriodMonths" className={labelClass}>
              Period for repayment (months) <span className="text-red-600">*</span>
            </label>
            <input
              id="ml-repaymentPeriodMonths"
              name="repaymentPeriodMonths"
              type="text"
              inputMode="numeric"
              required
              className={inputClass}
              placeholder="e.g. 12"
            />
          </div>
        </div>
      </Section>

      <Section number="VIII" title="Declarations">
        <label className="flex cursor-pointer gap-3 border border-slate-400 bg-white p-4 text-sm text-slate-900 dark:bg-white">
          <input
            type="checkbox"
            name="declarationAccurate"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 border-slate-600 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium uppercase tracking-wide">
            I declare that the information provided is true and complete to the best of my
            knowledge. <span className="text-red-600">*</span>
          </span>
        </label>
      </Section>

      <Section number="IX" title="Signature of applicant">
        <label className="flex cursor-pointer gap-3 border border-slate-400 bg-white p-4 text-sm text-slate-900 dark:bg-white">
          <input
            type="checkbox"
            name="electronicSignature"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 border-slate-600 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium uppercase tracking-wide">
            I confirm that typing my name and submitting this form constitutes my electronic
            signature. <span className="text-red-600">*</span>
          </span>
        </label>
        <div>
          <label htmlFor="ml-applicantDateSigned" className={labelClass}>
            Date <span className="text-red-600">*</span>
          </label>
          <input
            id="ml-applicantDateSigned"
            name="applicantDateSigned"
            type="date"
            required
            defaultValue={todaySigned}
            className={inputClass}
          />
        </div>
      </Section>

      <Section number="X" title="Witness (optional)">
        <label htmlFor="ml-witnessName" className={labelClass}>
          Witness to signature of applicant
        </label>
        <input
          id="ml-witnessName"
          name="witnessName"
          type="text"
          className={`${inputClass} uppercase`}
        />
        <div>
          <label htmlFor="ml-witnessDate" className={labelClass}>
            Witness date
          </label>
          <input id="ml-witnessDate" name="witnessDate" type="date" className={inputClass} />
        </div>
      </Section>

      {message ? (
        <p
          role="status"
          className={
            status === "success"
              ? "rounded-sm border border-green-700 bg-green-50 px-4 py-3 text-sm text-green-950"
              : "rounded-sm border border-red-700 bg-red-50 px-4 py-3 text-sm text-red-950"
          }
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 border-t-2 border-slate-900 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] font-medium uppercase leading-relaxed tracking-wide text-slate-600">
          Bring originals where required; submit copies as instructed. Questions? See{" "}
          <Link
            href="/membership-services"
            className="font-bold text-slate-900 underline decoration-slate-400"
          >
            Membership services
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={status === "loading"}
          className="site-btn-submit"
        >
          {status === "loading" ? "Submitting…" : "Submit merit loan application"}
        </button>
      </div>
    </form>
  );
}
