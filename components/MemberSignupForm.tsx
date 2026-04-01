"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

/** Printed/PDF-style form: white fields, dark borders, block-style labels */
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

export function MemberSignupForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const todaySigned = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Password and confirmation do not match.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    setStatus("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/member-signup", {
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
        "Your application has been received. You will be contacted after review.",
      );
      setPassword("");
      setConfirmPassword("");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="membership-form-pdf mt-2 space-y-5 text-left"
      encType="multipart/form-data"
    >
      {/* PDF-style masthead */}
      <div className="border-b-2 border-slate-900 pb-5 text-center">
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-[0.28em] text-slate-700">
          Trinidad and Tobago Police Service
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900">
          Social and Welfare Association
        </p>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-900 underline decoration-2 underline-offset-4">
          Membership form
        </p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Please fill out in block letters
        </p>
      </div>

      <div className="border border-slate-400 bg-white p-4 text-xs leading-relaxed text-slate-700 dark:bg-white">
        <p>
          This online form matches the official{" "}
          <a
            href="/forms/MEMBERSHIP APPLICATION.pdf"
            className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-2 hover:text-slate-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Membership application (PDF)
          </a>
          . Complete all sections; fields marked{" "}
          <span className="font-bold text-red-600">*</span> are required. Your password
          is stored securely and is not visible to administrators as plain text.
        </p>
        <p className="mt-2 border-t border-slate-200 pt-2">
          Salary deduction: see{" "}
          <a
            href="/forms/SALARY DEDUCTION.pdf"
            className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-2 hover:text-slate-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Salary deduction — membership dues (PDF)
          </a>
          .
        </p>
      </div>

      <Section number="I" title="Account credentials">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="username" className={labelClass}>
              Username <span className="text-red-600">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9._-]+"
              title="Letters, numbers, dots, underscores, and hyphens only"
              className={inputClass}
              placeholder="e.g. j.smith"
            />
            <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
              3–32 characters: letters, numbers, dot, underscore, or hyphen.
            </p>
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              Password <span className="text-red-600">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm password <span className="text-red-600">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section number="II" title="Service identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="regimentalNumber" className={labelClass}>
              Regimental number <span className="text-red-600">*</span>
            </label>
            <input
              id="regimentalNumber"
              name="regimentalNumber"
              type="text"
              autoComplete="off"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div>
            <label htmlFor="rank" className={labelClass}>
              Rank <span className="text-red-600">*</span>
            </label>
            <input
              id="rank"
              name="rank"
              type="text"
              autoComplete="organization-title"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className={labelClass}>
              Full name (forename and surname) <span className="text-red-600">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="departmentDivision" className={labelClass}>
              Department / division <span className="text-red-600">*</span>
            </label>
            <input
              id="departmentDivision"
              name="departmentDivision"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sectionStation" className={labelClass}>
              Section / station <span className="text-red-600">*</span>
            </label>
            <input
              id="sectionStation"
              name="sectionStation"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
        </div>
        <fieldset className="border border-slate-400 bg-white p-3 dark:bg-white">
          <legend className={`${labelClass} px-1`}>
            Financial member <span className="text-red-600">*</span>
          </legend>
          <div className="mt-1 flex flex-wrap gap-6">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="financialMember"
                value="yes"
                required
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              Yes
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="financialMember"
                value="no"
                className="h-4 w-4 border-slate-600 text-slate-900 focus:ring-slate-900"
              />
              No
            </label>
          </div>
        </fieldset>
      </Section>

      <Section number="III" title="Personal details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="age" className={labelClass}>
              Age <span className="text-red-600">*</span>
            </label>
            <input
              id="age"
              name="age"
              type="text"
              inputMode="numeric"
              required
              className={inputClass}
              placeholder="e.g. 35"
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
          <div>
            <label htmlFor="dateOfBirth" className={labelClass}>
              Date of birth <span className="text-red-600">*</span>
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="dateOfEnlistment" className={labelClass}>
              Date of enlistment in Police Service <span className="text-red-600">*</span>
            </label>
            <input
              id="dateOfEnlistment"
              name="dateOfEnlistment"
              type="date"
              required
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section number="IV" title="Contact information">
        <div>
          <label htmlFor="address" className={labelClass}>
            Home address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            rows={4}
            required
            autoComplete="street-address"
            className={`${inputClass} resize-y min-h-[5rem] uppercase`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="email" className={labelClass}>
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="phoneCountryCode" className={labelClass}>
              Country code (phones) <span className="text-red-600">*</span>
            </label>
            <select
              id="phoneCountryCode"
              name="phoneCountryCode"
              required
              defaultValue={MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE}
              autoComplete="tel-country-code"
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
            <label htmlFor="phoneHome" className={labelClass}>
              Home phone (optional)
            </label>
            <input
              id="phoneHome"
              name="phoneHome"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="phoneWork" className={labelClass}>
              Work phone (optional)
            </label>
            <input
              id="phoneWork"
              name="phoneWork"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="Local number only"
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Cell phone <span className="text-red-600">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              required
              className={inputClass}
              placeholder="Local number only (no country code)"
            />
            <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
              Enter digits for each line; country code is selected once above.
            </p>
          </div>
        </div>
      </Section>

      <Section number="V" title="Declaration">
        <div className="space-y-3 border-2 border-slate-900 bg-white p-4 font-serif text-sm leading-relaxed text-slate-900 dark:bg-white">
          <p>
            As a member of the Trinidad and Tobago Police Service I hereby apply for
            membership with the Trinidad and Tobago Police Service Social and Welfare
            Association.
          </p>
          <p>
            Additionally, I authorize the monthly deductions from my salary of the sum
            of one hundred and forty dollars ($140.00 TTD), being my subscription to the
            Association.
          </p>
        </div>
        <label className="flex cursor-pointer gap-3 border border-slate-400 bg-white p-4 text-sm text-slate-900 dark:bg-white">
          <input
            type="checkbox"
            name="declarationMembership"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 border-slate-600 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium uppercase tracking-wide">
            I confirm that I have read and agree to the statements above regarding my
            membership application and the $140.00 monthly salary deduction.{" "}
            <span className="text-red-600">*</span>
          </span>
        </label>
      </Section>

      <Section number="VI" title="Nomination of beneficiary">
        <p className="border-b border-dotted border-slate-400 pb-2 text-[10px] font-bold uppercase tracking-wide text-slate-600">
          For the purpose of the Death Benefit as provided by the rules of the Trinidad
          &amp; Tobago Police Service Social Welfare Association.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="beneficiaryRegimentalNumber" className={labelClass}>
              Beneficiary reg. no. (optional)
            </label>
            <input
              id="beneficiaryRegimentalNumber"
              name="beneficiaryRegimentalNumber"
              type="text"
              className={`${inputClass} uppercase`}
            />
          </div>
          <div>
            <label htmlFor="beneficiaryRank" className={labelClass}>
              Beneficiary rank (optional)
            </label>
            <input
              id="beneficiaryRank"
              name="beneficiaryRank"
              type="text"
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="beneficiaryFullName" className={labelClass}>
              Name of beneficiary <span className="text-red-600">*</span>
            </label>
            <input
              id="beneficiaryFullName"
              name="beneficiaryFullName"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="beneficiaryRelationship" className={labelClass}>
              He/she is my (relationship) <span className="text-red-600">*</span>
            </label>
            <input
              id="beneficiaryRelationship"
              name="beneficiaryRelationship"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="beneficiaryIdNumber" className={labelClass}>
              ID / DP / PP no. <span className="text-red-600">*</span>
            </label>
            <input
              id="beneficiaryIdNumber"
              name="beneficiaryIdNumber"
              type="text"
              required
              className={`${inputClass} uppercase`}
            />
          </div>
        </div>
      </Section>

      <Section number="VII" title="Witness (optional)">
        <label htmlFor="witnessName" className={labelClass}>
          Witness to signature of applicant
        </label>
        <input
          id="witnessName"
          name="witnessName"
          type="text"
          className={`${inputClass} uppercase`}
          placeholder="Name of witness, if applicable"
        />
      </Section>

      <Section number="VIII" title="Application date">
        <label htmlFor="applicationDateSigned" className={labelClass}>
          Date of this application <span className="text-red-600">*</span>
        </label>
        <input
          id="applicationDateSigned"
          name="applicationDateSigned"
          type="date"
          required
          defaultValue={todaySigned}
          className={inputClass}
        />
      </Section>

      <Section number="IX" title="Facial photograph">
        <div>
          <label htmlFor="facialPhoto" className={labelClass}>
            Upload photo <span className="text-red-600">*</span>
          </label>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
            Clear, recent face photo. JPG, PNG, or WebP. Maximum{" "}
            <span className="font-bold text-slate-800">900 KB</span>.
          </p>
          <input
            id="facialPhoto"
            name="facialPhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="mt-2 block w-full border border-slate-400 bg-white px-2 py-2 text-sm text-slate-700 file:mr-3 file:rounded-sm file:border file:border-slate-400 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-slate-900 hover:file:bg-slate-200"
          />
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
          By submitting, you confirm that the information provided is accurate to the best
          of your knowledge. Need help? See{" "}
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
          {status === "loading" ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
