"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

const inputClass =
  "mt-1 w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none ring-brand placeholder:text-muted focus:ring-2 dark:border-line dark:bg-canvas";

const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted";

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
    <section className="border border-line bg-surface/80 shadow-sm dark:bg-surface">
      <div className="border-b border-line bg-brand-subtle/40 px-4 py-3 dark:bg-brand-subtle/20">
        <h2 className="text-sm font-bold tracking-tight text-ink">
          <span className="mr-2 font-mono text-brand">{number}</span>
          {title}
        </h2>
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
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
      className="mt-2 space-y-6 text-left"
      encType="multipart/form-data"
    >
      <div className="rounded border border-line bg-canvas px-4 py-3 text-xs leading-relaxed text-muted dark:bg-surface/50">
        <p>
          This online form matches the official{" "}
          <a
            href="/forms/MEMBERSHIP APPLICATION.pdf"
            className="font-semibold text-brand hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Membership application (PDF)
          </a>
          . Please complete all sections in block capitals where possible. Fields
          marked <span className="font-semibold text-red-600">*</span> are required.
          Your password is stored securely and is not visible to administrators as plain
          text.
        </p>
        <p className="mt-2">
          Salary deduction authorization: see also{" "}
          <a
            href="/forms/SALARY DEDUCTION membership dues.pdf"
            className="font-semibold text-brand hover:underline"
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
            <p className="mt-1 text-xs text-muted">
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
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
            />
          </div>
        </div>
        <fieldset className="rounded border border-line bg-canvas/50 p-3 dark:bg-canvas/30">
          <legend className={`${labelClass} px-1`}>
            Financial member <span className="text-red-600">*</span>
          </legend>
          <div className="mt-1 flex flex-wrap gap-6">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="financialMember"
                value="yes"
                required
                className="h-4 w-4 border-line text-brand focus:ring-brand"
              />
              Yes
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="financialMember"
                value="no"
                className="h-4 w-4 border-line text-brand focus:ring-brand"
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
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="sex"
                  value="male"
                  required
                  className="h-4 w-4 border-line text-brand focus:ring-brand"
                />
                Male
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="sex"
                  value="female"
                  className="h-4 w-4 border-line text-brand focus:ring-brand"
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
            className={`${inputClass} resize-y min-h-[5rem]`}
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
            <p className="mt-1 text-xs text-muted">
              Enter digits for each line; country code is selected once above.
            </p>
          </div>
        </div>
      </Section>

      <Section number="V" title="Declaration">
        <div className="space-y-3 rounded border border-line bg-canvas/50 p-4 text-sm leading-relaxed text-ink dark:bg-canvas/30">
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
        <label className="flex cursor-pointer gap-3 rounded border border-line bg-surface p-4 text-sm text-ink">
          <input
            type="checkbox"
            name="declarationMembership"
            value="yes"
            required
            className="mt-2 h-4 w-4 shrink-0 border-line text-brand focus:ring-brand"
          />
          <span>
            I confirm that I have read and agree to the statements above regarding my
            membership application and the $140.00 monthly salary deduction.{" "}
            <span className="text-red-600">*</span>
          </span>
        </label>
      </Section>

      <Section number="VI" title="Nomination of beneficiary">
        <p className="text-xs text-muted">
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
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
              placeholder="e.g. Spouse"
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
              className={inputClass}
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
          className={inputClass}
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
          <p className="mt-1 text-xs text-muted">
            Clear, recent face photo. JPG, PNG, or WebP. Maximum{" "}
            <span className="font-medium text-ink">900 KB</span>.
          </p>
          <input
            id="facialPhoto"
            name="facialPhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded border file:border-0 file:bg-brand-subtle file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand hover:file:text-white"
          />
        </div>
      </Section>

      {message ? (
        <p
          role="status"
          className={
            status === "success"
              ? "rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900 dark:bg-green-950/50 dark:text-green-100"
              : "rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
          }
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          By submitting, you confirm that the information provided is accurate to the best
          of your knowledge. Need help? See{" "}
          <Link href="/membership-services" className="text-brand hover:underline">
            Membership services
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-md bg-brand px-8 text-sm font-semibold text-white shadow-corp-md transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
