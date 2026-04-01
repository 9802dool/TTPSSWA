"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

const PDF_HREF = "/forms/RETIREMENT APPLICATION.pdf";

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

export function RetirementBenefitForm() {
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
      const res = await fetch("/api/retirement-benefit-application", {
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
        "Your retirement benefit application has been received. You will be contacted if further information is needed.",
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
      className="retirement-benefit-form-pdf mt-2 space-y-5 text-left"
    >
      <div className="border-b-2 border-slate-900 pb-5 text-center">
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-[0.28em] text-slate-700">
          Trinidad and Tobago Police Service
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
          Social and Welfare Association
        </p>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-900 underline decoration-2 underline-offset-4">
          Retirement benefit application form
        </p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Please fill out in block letters
        </p>
      </div>

      <div className="border border-slate-400 bg-white p-4 text-xs leading-relaxed text-slate-700 dark:bg-white">
        <p>
          Effective April 1st, 2024, there is a five (5) year time limit from the date of your
          retirement to access the plan. This policy is for persons with membership of five (5)
          years and over in the Association and is effective from December 12th, 1997. This online
          form matches the official{" "}
          <a
            href={PDF_HREF}
            className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-2 hover:text-slate-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Retirement application (PDF)
          </a>
          . Fields marked <span className="font-bold text-red-600">*</span> are required.
        </p>
      </div>

      <Section number="I" title="Application date">
        <div className="max-w-xs">
          <label htmlFor="rb-dateOfApplication" className={labelClass}>
            Date of application <span className="text-red-600">*</span>
          </label>
          <input
            id="rb-dateOfApplication"
            name="dateOfApplication"
            type="date"
            required
            defaultValue={todaySigned}
            className={inputClass}
          />
        </div>
      </Section>

      <Section number="II" title="Applicant identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rb-regimentalNumber" className={labelClass}>
              Reg. no. <span className="text-red-600">*</span>
            </label>
            <input
              id="rb-regimentalNumber"
              name="regimentalNumber"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div>
            <label htmlFor="rb-rank" className={labelClass}>
              Rank <span className="text-red-600">*</span>
            </label>
            <input
              id="rb-rank"
              name="rank"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="rb-fullName" className={labelClass}>
              Name (forename and surname) <span className="text-red-600">*</span>
            </label>
            <input
              id="rb-fullName"
              name="fullName"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
        </div>
      </Section>

      <Section number="III" title="Department / station">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="rb-departmentDivision" className={labelClass}>
              Department / division <span className="text-red-600">*</span>
            </label>
            <input
              id="rb-departmentDivision"
              name="departmentDivision"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="rb-sectionStation" className={labelClass}>
              Section / station <span className="text-red-600">*</span>
            </label>
            <input
              id="rb-sectionStation"
              name="sectionStation"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
        </div>
      </Section>

      <Section number="IV" title="Home address">
        <div>
          <label htmlFor="rb-address" className={labelClass}>
            Home address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="rb-address"
            name="address"
            rows={4}
            required
            autoComplete="street-address"
            className={`${inputClass} resize-y min-h-[5rem] uppercase`}
          />
        </div>
      </Section>

      <Section number="V" title="Contact information">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="rb-email" className={labelClass}>
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              id="rb-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="rb-phoneCountryCode" className={labelClass}>
              Country code (cell) <span className="text-red-600">*</span>
            </label>
            <select
              id="rb-phoneCountryCode"
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
            <label htmlFor="rb-phone" className={labelClass}>
              Cell <span className="text-red-600">*</span>
            </label>
            <input
              id="rb-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="rb-phoneHome" className={labelClass}>
              Home (optional)
            </label>
            <input
              id="rb-phoneHome"
              name="phoneHome"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="rb-phoneWork" className={labelClass}>
              Work (optional)
            </label>
            <input
              id="rb-phoneWork"
              name="phoneWork"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
        </div>
      </Section>

      <Section number="VI" title="Age, sex & health plan">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rb-age" className={labelClass}>
              Age <span className="text-red-600">*</span>
            </label>
            <input
              id="rb-age"
              name="age"
              type="text"
              inputMode="numeric"
              required
              className={inputClass}
              placeholder="e.g. 58"
            />
          </div>
          <fieldset className="border border-slate-400 bg-white p-3 dark:bg-white sm:col-span-2">
            <legend className={`${labelClass} px-1`}>
              Sex <span className="text-red-600">*</span>
            </legend>
            <div className="mt-1 flex flex-wrap gap-6">
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
          </fieldset>
          <fieldset className="border border-slate-400 bg-white p-3 dark:bg-white sm:col-span-2">
            <legend className={`${labelClass} px-1`}>
              Enrolled in TTPSSWA Guardian Life Health Plan <span className="text-red-600">*</span>
            </legend>
            <div className="mt-1 flex flex-wrap gap-6">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
                <input
                  type="radio"
                  name="guardianLifeHealthPlan"
                  value="yes"
                  required
                  className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
                />
                Yes
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
                <input
                  type="radio"
                  name="guardianLifeHealthPlan"
                  value="no"
                  className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
                />
                No
              </label>
            </div>
          </fieldset>
        </div>
      </Section>

      <Section number="VII" title="Retirement / resignation">
        <div className="max-w-md">
          <label htmlFor="rb-effectiveRetirementDate" className={labelClass}>
            Effective date of retirement / resignation <span className="text-red-600">*</span>
          </label>
          <input
            id="rb-effectiveRetirementDate"
            name="effectiveRetirementDate"
            type="date"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="rb-departmentalOrderReference" className={labelClass}>
            Departmental order reference number <span className="text-red-600">*</span>
          </label>
          <input
            id="rb-departmentalOrderReference"
            name="departmentalOrderReference"
            type="text"
            required
            className={`${inputClass} uppercase`}
            placeholder="As shown on your departmental order"
          />
        </div>
        <label className="flex cursor-pointer gap-3 border border-slate-400 bg-white p-4 text-sm text-slate-900 dark:bg-white">
          <input
            type="checkbox"
            name="departmentalOrderCopyConfirmed"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 border-slate-600 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium uppercase tracking-wide">
            I will attach a copy of the departmental order as required.{" "}
            <span className="text-red-600">*</span>
          </span>
        </label>
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
          <label htmlFor="rb-applicantDateSigned" className={labelClass}>
            Date <span className="text-red-600">*</span>
          </label>
          <input
            id="rb-applicantDateSigned"
            name="applicantDateSigned"
            type="date"
            required
            defaultValue={todaySigned}
            className={inputClass}
          />
        </div>
      </Section>

      <Section number="X" title="Witness (optional)">
        <label htmlFor="rb-witnessName" className={labelClass}>
          Witness to signature of applicant
        </label>
        <input
          id="rb-witnessName"
          name="witnessName"
          type="text"
          className={`${inputClass} uppercase`}
        />
        <div>
          <label htmlFor="rb-witnessDate" className={labelClass}>
            Witness date
          </label>
          <input id="rb-witnessDate" name="witnessDate" type="date" className={inputClass} />
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
          Attach supporting documents as instructed. Questions? See{" "}
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
          {status === "loading" ? "Submitting…" : "Submit retirement benefit application"}
        </button>
      </div>
    </form>
  );
}
