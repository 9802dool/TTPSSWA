"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

const PDF_HREF = "/forms/DENTAL AND OPTICAL GRANT APPLICATION.pdf";

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

export function DentalOpticalGrantForm() {
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
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="dental-optical-grant-form-pdf mt-2 space-y-5 text-left"
    >
      <div className="border-b-2 border-slate-900 pb-5 text-center">
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-[0.28em] text-slate-700">
          Trinidad and Tobago Police Service
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
          Social and Welfare Association
        </p>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-900 underline decoration-2 underline-offset-4">
          Dental and optical grant application
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
            Dental and optical grant application (PDF)
          </a>
          . Fields marked <span className="font-bold text-red-600">*</span> are required.
        </p>
      </div>

      <Section number="I" title="Service identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dog-regimentalNumber" className={labelClass}>
              Regimental number <span className="text-red-600">*</span>
            </label>
            <input
              id="dog-regimentalNumber"
              name="regimentalNumber"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div>
            <label htmlFor="dog-rank" className={labelClass}>
              Rank <span className="text-red-600">*</span>
            </label>
            <input
              id="dog-rank"
              name="rank"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="dog-fullName" className={labelClass}>
              Name (forename and surname) <span className="text-red-600">*</span>
            </label>
            <input
              id="dog-fullName"
              name="fullName"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="dog-departmentDivision" className={labelClass}>
              Department / division <span className="text-red-600">*</span>
            </label>
            <input
              id="dog-departmentDivision"
              name="departmentDivision"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="dog-sectionStation" className={labelClass}>
              Section / station <span className="text-red-600">*</span>
            </label>
            <input
              id="dog-sectionStation"
              name="sectionStation"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
        </div>
      </Section>

      <Section number="II" title="Member category">
        <fieldset className="border border-slate-400 bg-white p-3 dark:bg-white">
          <legend className={`${labelClass} px-1`}>
            Eligibility <span className="text-red-600">*</span>
          </legend>
          <p className="mb-3 text-xs leading-relaxed text-slate-600">
            This grant applies to Special Reserve Police (SRP) and Municipal Police members
            as per Association policy.
          </p>
          <div className="mt-1 flex flex-wrap gap-6">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="memberCategory"
                value="srp"
                required
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              SRP
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="memberCategory"
                value="municipal"
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              Municipal Police
            </label>
          </div>
        </fieldset>
      </Section>

      <Section number="III" title="Contact information">
        <div>
          <label htmlFor="dog-address" className={labelClass}>
            Home address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="dog-address"
            name="address"
            rows={4}
            required
            autoComplete="street-address"
            className={`${inputClass} resize-y min-h-[5rem] uppercase`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="dog-email" className={labelClass}>
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              id="dog-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="dog-phoneCountryCode" className={labelClass}>
              Country code (phones) <span className="text-red-600">*</span>
            </label>
            <select
              id="dog-phoneCountryCode"
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
            <label htmlFor="dog-phoneHome" className={labelClass}>
              Home phone (optional)
            </label>
            <input
              id="dog-phoneHome"
              name="phoneHome"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="dog-phoneWork" className={labelClass}>
              Work phone (optional)
            </label>
            <input
              id="dog-phoneWork"
              name="phoneWork"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="dog-phone" className={labelClass}>
              Cell phone <span className="text-red-600">*</span>
            </label>
            <input
              id="dog-phone"
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

      <Section number="IV" title="Grant application">
        <fieldset className="border border-slate-400 bg-white p-3 dark:bg-white">
          <legend className={`${labelClass} px-1`}>
            Grant type <span className="text-red-600">*</span>
          </legend>
          <div className="mt-1 flex flex-wrap gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="grantType"
                value="dental"
                required
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              Dental
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="grantType"
                value="optical"
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              Optical
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="grantType"
                value="both"
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              Both
            </label>
          </div>
        </fieldset>
        <div>
          <label htmlFor="dog-treatmentDescription" className={labelClass}>
            Treatment / prescription / procedure (describe) <span className="text-red-600">*</span>
          </label>
          <textarea
            id="dog-treatmentDescription"
            name="treatmentDescription"
            rows={5}
            required
            className={`${inputClass} resize-y min-h-[6rem]`}
            placeholder="e.g. eye examination and lenses; or dental procedure as quoted"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dog-estimatedAmountTTD" className={labelClass}>
              Estimated cost (TTD) <span className="text-red-600">*</span>
            </label>
            <input
              id="dog-estimatedAmountTTD"
              name="estimatedAmountTTD"
              type="text"
              inputMode="decimal"
              required
              className={inputClass}
              placeholder="e.g. 1500.00"
            />
          </div>
          <div>
            <label htmlFor="dog-quoteOrVisitDate" className={labelClass}>
              Date of quote / visit (optional)
            </label>
            <input
              id="dog-quoteOrVisitDate"
              name="quoteOrVisitDate"
              type="date"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="dog-providerName" className={labelClass}>
              Provider (dentist / optician / clinic) — optional
            </label>
            <input
              id="dog-providerName"
              name="providerName"
              type="text"
              className={`${inputClass} uppercase`}
            />
          </div>
        </div>
      </Section>

      <Section number="V" title="Declarations">
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
            I confirm that typing my name and submitting this form constitutes my electronic
            signature. <span className="text-red-600">*</span>
          </span>
        </label>
        <div>
          <label htmlFor="dog-applicantDateSigned" className={labelClass}>
            Date <span className="text-red-600">*</span>
          </label>
          <input
            id="dog-applicantDateSigned"
            name="applicantDateSigned"
            type="date"
            required
            defaultValue={todaySigned}
            className={inputClass}
          />
        </div>
      </Section>

      <Section number="VII" title="Witness (optional)">
        <label htmlFor="dog-witnessName" className={labelClass}>
          Witness to signature of applicant
        </label>
        <input
          id="dog-witnessName"
          name="witnessName"
          type="text"
          className={`${inputClass} uppercase`}
        />
        <div>
          <label htmlFor="dog-witnessDate" className={labelClass}>
            Witness date
          </label>
          <input id="dog-witnessDate" name="witnessDate" type="date" className={inputClass} />
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
          Attach supporting quotes or receipts as instructed by the Association. Questions? See{" "}
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
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-sm border-2 border-slate-900 bg-slate-900 px-8 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Submitting…" : "Submit grant application"}
        </button>
      </div>
    </form>
  );
}
