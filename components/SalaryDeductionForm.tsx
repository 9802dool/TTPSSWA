"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

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

export function SalaryDeductionForm() {
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
      const res = await fetch("/api/salary-deduction", {
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
        "Your salary deduction authorization has been received. You will be contacted if needed.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="salary-deduction-form-pdf mt-2 space-y-5 text-left">
      <div className="border-b-2 border-slate-900 pb-5 text-center">
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-[0.28em] text-slate-700">
          Trinidad and Tobago Police Service
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
          Social and Welfare Association
        </p>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-900 underline decoration-2 underline-offset-4">
          Salary deduction form
        </p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Please fill out in block letters
        </p>
      </div>

      <div className="border border-slate-400 bg-white p-4 text-xs leading-relaxed text-slate-700 dark:bg-white">
        <p>
          This online form matches the official{" "}
          <a
            href="/forms/SALARY DEDUCTION.pdf"
            className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-2 hover:text-slate-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Salary deduction (PDF)
          </a>
          . Fields marked <span className="font-bold text-red-600">*</span> are required.
        </p>
      </div>

      <Section number="I" title="Service identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sd-regimentalNumber" className={labelClass}>
              Regimental number <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-regimentalNumber"
              name="regimentalNumber"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div>
            <label htmlFor="sd-rank" className={labelClass}>
              Rank <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-rank"
              name="rank"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sd-fullName" className={labelClass}>
              Name (forename and surname) <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-fullName"
              name="fullName"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sd-departmentDivision" className={labelClass}>
              Department / division <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-departmentDivision"
              name="departmentDivision"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sd-sectionStation" className={labelClass}>
              Section / station <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-sectionStation"
              name="sectionStation"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
        </div>
      </Section>

      <Section number="II" title="Personal details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sd-age" className={labelClass}>
              Age <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-age"
              name="age"
              type="text"
              inputMode="numeric"
              required
              className={inputClass}
            />
          </div>
          <div>
            <span className={labelClass}>
              Sex <span className="text-red-600">*</span>
            </span>
            <div className="mt-2 flex flex-wrap gap-6">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
                <input
                  type="radio"
                  name="sex"
                  value="male"
                  required
                  className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
                />
                Male
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
                <input
                  type="radio"
                  name="sex"
                  value="female"
                  className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
                />
                Female
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sd-email" className={labelClass}>
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="sd-dateOfBirth" className={labelClass}>
              Date of birth <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="sd-dateOfEnlistment" className={labelClass}>
              Date of enlistment in Police Service <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-dateOfEnlistment"
              name="dateOfEnlistment"
              type="date"
              required
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section number="III" title="Contact information">
        <div>
          <label htmlFor="sd-address" className={labelClass}>
            Home address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="sd-address"
            name="address"
            rows={4}
            required
            autoComplete="street-address"
            className={`${inputClass} resize-y min-h-[5rem] uppercase`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sd-phoneCountryCode" className={labelClass}>
              Country code (phones) <span className="text-red-600">*</span>
            </label>
            <select
              id="sd-phoneCountryCode"
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
            <label htmlFor="sd-phoneHome" className={labelClass}>
              Home phone (optional)
            </label>
            <input
              id="sd-phoneHome"
              name="phoneHome"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="sd-phoneWork" className={labelClass}>
              Work phone (optional)
            </label>
            <input
              id="sd-phoneWork"
              name="phoneWork"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="sd-phone" className={labelClass}>
              Cell phone <span className="text-red-600">*</span>
            </label>
            <input
              id="sd-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
        </div>
      </Section>

      <Section number="IV" title="Salary deduction authorization">
        <div className="space-y-3 border-2 border-slate-900 bg-white p-4 font-serif text-sm leading-relaxed text-slate-900 dark:bg-white">
          <p>
            As a member of the Trinidad and Tobago Police Service and applying for
            membership with the Trinidad and Tobago Police Service Social and Welfare
            Association, I hereby authorize the paysheet clerk to deduct a monthly
            deduction from my salary, in the sum of one hundred and forty dollars
            ($140.00 TTD), as my monthly subscription for transmission to the
            above-named Association.
          </p>
          <p className="font-sans text-xs font-bold uppercase tracking-wide text-slate-600">
            Until further notice.
          </p>
        </div>
        <div>
          <label htmlFor="sd-commencementDate" className={labelClass}>
            Commencing from (date) <span className="text-red-600">*</span>
          </label>
          <input
            id="sd-commencementDate"
            name="commencementDate"
            type="date"
            required
            className={inputClass}
          />
        </div>
      </Section>

      <Section number="V" title="Declarations">
        <p className="border border-slate-400 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 dark:bg-slate-50">
          This authorization cannot be cancelled or waived unless permission from the
          Association is obtained in writing. Please be guided accordingly.
        </p>
        <label className="flex cursor-pointer gap-3 border border-slate-400 bg-white p-4 text-sm text-slate-900 dark:bg-white">
          <input
            type="checkbox"
            name="authMonthlyDeduction"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 border-slate-600 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium uppercase tracking-wide">
            I authorize the monthly deduction of $140.00 TTD from my salary as stated
            above. <span className="text-red-600">*</span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 border border-slate-400 bg-white p-4 text-sm text-slate-900 dark:bg-white">
          <input
            type="checkbox"
            name="policyAcknowledgment"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 border-slate-600 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium uppercase tracking-wide">
            I understand this authorization cannot be cancelled or waived without written
            permission from the Association. <span className="text-red-600">*</span>
          </span>
        </label>
      </Section>

      <Section number="VI" title="Signature of applicant">
        <label className="flex cursor-pointer gap-3 border border-slate-400 bg-white p-4 text-sm text-slate-900 dark:bg-white">
          <input
            type="checkbox"
            name="electronicSignature"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 border-slate-600 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium uppercase tracking-wide">
            I confirm that typing my name and submitting this form constitutes my
            electronic signature. <span className="text-red-600">*</span>
          </span>
        </label>
        <div>
          <label htmlFor="sd-applicantDateSigned" className={labelClass}>
            Date <span className="text-red-600">*</span>
          </label>
          <input
            id="sd-applicantDateSigned"
            name="applicantDateSigned"
            type="date"
            required
            defaultValue={todaySigned}
            className={inputClass}
          />
        </div>
      </Section>

      <Section number="VII" title="Witness (optional)">
        <label htmlFor="sd-witnessName" className={labelClass}>
          Witness to signature of applicant
        </label>
        <input
          id="sd-witnessName"
          name="witnessName"
          type="text"
          className={`${inputClass} uppercase`}
        />
        <div>
          <label htmlFor="sd-witnessDate" className={labelClass}>
            Witness date
          </label>
          <input id="sd-witnessDate" name="witnessDate" type="date" className={inputClass} />
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
          Place association stamp (if applicable) on the printed PDF. Questions? See{" "}
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
          {status === "loading" ? "Submitting…" : "Submit salary deduction form"}
        </button>
      </div>
    </form>
  );
}
