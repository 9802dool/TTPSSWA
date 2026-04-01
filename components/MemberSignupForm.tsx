"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

/** Matches MEMBERSHIP APPLICATION.pdf — block caps, tight tracking */
const L =
  "text-[9px] font-bold uppercase tracking-[0.14em] text-slate-900";

/** Underline field style like printed blanks on the PDF */
const pdfLine =
  "mt-0.5 w-full border-0 border-b-2 border-slate-900 bg-transparent px-0 py-1.5 text-sm font-medium uppercase tracking-wide text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-900 focus:ring-0 dark:bg-white";

const pdfBox =
  "mt-0.5 w-full rounded-none border-2 border-slate-900 bg-white px-2 py-2 text-sm font-medium uppercase tracking-wide text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:bg-white";

/** Official PDF masthead (Nov 2025) — update when the printed form changes */
function MembershipPdfMasthead() {
  return (
    <div className="border-b-2 border-slate-900 bg-white px-3 py-4 text-slate-900 dark:bg-white">
      <p className="text-center text-[8px] font-semibold uppercase leading-snug tracking-wide text-slate-700">
        Vice President: Ag. A.S.P Owie Russell; Assistant Secretary: No. 16940 W/Ag.
        Sgt. Tricia Durant-Charles
      </p>
      <p className="mt-1 text-center text-[8px] font-semibold uppercase leading-snug tracking-wide text-slate-700">
        Treasurer: No. 18668 Ag. Cpl. Selwyn Marcano
      </p>
      <p className="mt-1 text-center text-[8px] font-semibold uppercase leading-snug tracking-wide text-slate-700">
        Trustees: No. 13281 Sgt. Adrian Andrews No. 16540 Sgt. Jason Johnson
      </p>
      <p className="mt-1 text-center text-[8px] font-semibold uppercase leading-snug tracking-wide text-slate-700">
        First Division Officer: Ag. A.C.P Oswain Subero
      </p>
      <p className="mt-1 text-center text-[8px] font-semibold uppercase leading-snug tracking-wide text-slate-700">
        Special Reserve Officer: No. 5369 PC Kevin Nicholls; Municipal Officer: No.
        12279 PC David Mc Guirk
      </p>
      <p className="mt-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-slate-900">
        Trinidad and Tobago Police Service
      </p>
      <p className="mt-1 text-center text-sm font-bold uppercase tracking-[0.25em] text-slate-900">
        Social and Welfare Association
      </p>
      <p className="mx-auto mt-3 max-w-xl text-center text-[9px] font-semibold uppercase leading-relaxed tracking-wide text-slate-800">
        4th Floor, Riverside Plaza, #3 Besson Street, Port of Spain, Tel: 235-5260
        792-6226. E-Mail: ttpsswa.receptionist@outlook.com Website: ttpsswa.org
      </p>
      <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-wide text-slate-800">
        President: Ag. A.S.P. Ishmael Pitt
      </p>
      <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-wide text-slate-800">
        Secretary: W/Ag. A.S.P. Nathalie John
      </p>
      <p className="mt-5 text-center text-base font-bold uppercase tracking-[0.2em] text-slate-900 underline decoration-2 underline-offset-4">
        Membership form
      </p>
      <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-800">
        Please fill out in block letters
      </p>
    </div>
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
      id="membership-application-form"
      onSubmit={(e) => void onSubmit(e)}
      className="membership-form-pdf w-full border-2 border-slate-900 bg-white text-left text-slate-900 shadow-[0_2px_0_0_rgba(15,23,42,0.06)] dark:bg-white"
      encType="multipart/form-data"
    >
      {/* Digital-only: not on printed PDF */}
      <div className="border-b-2 border-slate-900 bg-slate-100 px-4 py-4 dark:bg-slate-100">
        <p className={`${L} text-slate-600`}>Online account (this website only)</p>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-700">
          Choose a username and password to submit and track this application. Not shown
          on the printable PDF.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="username" className={L}>
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
              className={pdfLine}
              placeholder="e.g. j.smith"
            />
            <p className="mt-1 text-[8px] uppercase tracking-wide text-slate-500">
              3–32 characters: letters, numbers, dot, underscore, or hyphen.
            </p>
          </div>
          <div>
            <label htmlFor="password" className={L}>
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
              className={pdfLine}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={L}>
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
              className={pdfLine}
            />
          </div>
        </div>
      </div>

      <MembershipPdfMasthead />

      <div className="space-y-0 border-b-2 border-slate-900 px-4 py-4">
        <div className="grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <label htmlFor="regimentalNumber" className={L}>
              Reg. no. <span className="text-red-600">*</span>
            </label>
            <input
              id="regimentalNumber"
              name="regimentalNumber"
              type="text"
              autoComplete="off"
              required
              className={pdfLine}
            />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="rank" className={L}>
              Rank <span className="text-red-600">*</span>
            </label>
            <input
              id="rank"
              name="rank"
              type="text"
              autoComplete="organization-title"
              required
              className={pdfLine}
            />
          </div>
          <div className="sm:col-span-6">
            <label htmlFor="fullName" className={L}>
              Name (forename and surname) <span className="text-red-600">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              className={pdfLine}
            />
            <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-slate-500">
              Forename &nbsp;&nbsp;&nbsp; Surname
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="departmentDivision" className={L}>
              Department / division <span className="text-red-600">*</span>
            </label>
            <input
              id="departmentDivision"
              name="departmentDivision"
              type="text"
              required
              className={pdfLine}
            />
          </div>
          <div>
            <label htmlFor="sectionStation" className={L}>
              Section / station <span className="text-red-600">*</span>
            </label>
            <input
              id="sectionStation"
              name="sectionStation"
              type="text"
              required
              className={pdfLine}
            />
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="address" className={L}>
            Home address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            rows={4}
            required
            autoComplete="street-address"
            className={`${pdfBox} min-h-[5rem] resize-y`}
          />
        </div>

        <div className="mt-6">
          <p className={L}>Contact numbers</p>
          <p className="mt-1 text-[8px] uppercase tracking-wide text-slate-500">
            Country code applies once; enter local digits only for each line.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="phoneCountryCode" className={L}>
                Country code <span className="text-red-600">*</span>
              </label>
              <select
                id="phoneCountryCode"
                name="phoneCountryCode"
                required
                defaultValue={MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE}
                autoComplete="tel-country-code"
                className={pdfBox}
              >
                {MEMBERSHIP_PHONE_COUNTRY_CODES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="phoneHome" className={L}>
                Home (optional)
              </label>
              <input
                id="phoneHome"
                name="phoneHome"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                className={pdfLine}
                placeholder="Local"
              />
            </div>
            <div>
              <label htmlFor="phoneWork" className={L}>
                Work (optional)
              </label>
              <input
                id="phoneWork"
                name="phoneWork"
                type="tel"
                inputMode="tel"
                className={pdfLine}
                placeholder="Local"
              />
            </div>
            <div>
              <label htmlFor="phone" className={L}>
                Cell <span className="text-red-600">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                required
                className={pdfLine}
                placeholder="Local"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-2">
            <label htmlFor="age" className={L}>
              Age <span className="text-red-600">*</span>
            </label>
            <input
              id="age"
              name="age"
              type="text"
              inputMode="numeric"
              required
              className={pdfLine}
              placeholder="e.g. 35"
            />
          </div>
          <div className="sm:col-span-4">
            <span className={L}>
              Sex <span className="text-red-600">*</span>
            </span>
            <div className="mt-3 flex flex-wrap gap-6">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-900">
                <input
                  type="radio"
                  name="sex"
                  value="male"
                  required
                  className="h-4 w-4 border-slate-900 text-slate-900 focus:ring-slate-900"
                />
                Male
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-900">
                <input
                  type="radio"
                  name="sex"
                  value="female"
                  className="h-4 w-4 border-slate-900 text-slate-900 focus:ring-slate-900"
                />
                Female
              </label>
            </div>
          </div>
          <div className="sm:col-span-6">
            <label htmlFor="email" className={L}>
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={pdfLine}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="dateOfBirth" className={L}>
              Date of birth <span className="text-red-600">*</span>
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              className={pdfLine}
            />
            <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-500">
              Day / month / year
            </p>
          </div>
          <div>
            <label htmlFor="dateOfEnlistment" className={L}>
              Date of enlistment in Police Service <span className="text-red-600">*</span>
            </label>
            <input
              id="dateOfEnlistment"
              name="dateOfEnlistment"
              type="date"
              required
              className={pdfLine}
            />
            <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-500">
              Day / month / year
            </p>
          </div>
        </div>

        <fieldset className="mt-6 border-2 border-slate-900 bg-slate-50 p-3 dark:bg-slate-50">
          <legend className={`${L} px-1`}>
            Financial member <span className="text-red-600">*</span>
          </legend>
          <p className="mb-2 text-[9px] uppercase tracking-wide text-slate-600">
            Required for online processing (not shown as a separate line on the printable
            PDF).
          </p>
          <div className="flex flex-wrap gap-8">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="financialMember"
                value="yes"
                required
                className="h-4 w-4 border-slate-900 text-slate-900 focus:ring-slate-900"
              />
              Yes
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-900">
              <input
                type="radio"
                name="financialMember"
                value="no"
                className="h-4 w-4 border-slate-900 text-slate-900 focus:ring-slate-900"
              />
              No
            </label>
          </div>
        </fieldset>
      </div>

      {/* Declaration — wording aligned to PDF */}
      <div className="border-b-2 border-slate-900 px-4 py-4">
        <p className={`${L} mb-3`}>Declaration</p>
        <div className="space-y-3 border-2 border-slate-900 bg-white p-4 font-serif text-[13px] leading-relaxed text-slate-900 dark:bg-white">
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
        <label className="mt-4 flex cursor-pointer gap-3 border-2 border-slate-900 bg-slate-50 p-4 text-xs text-slate-900 dark:bg-slate-50">
          <input
            type="checkbox"
            name="declarationMembership"
            value="yes"
            required
            className="mt-0.5 h-4 w-4 shrink-0 border-slate-900 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-bold uppercase leading-relaxed tracking-wide">
            I confirm that I have read and agree to the statements above regarding my
            membership application and the $140.00 monthly salary deduction.{" "}
            <span className="text-red-600">*</span>
          </span>
        </label>
      </div>

      <div className="border-b-2 border-slate-900 px-4 py-4">
        <label htmlFor="applicationDateSigned" className={L}>
          Dated this application (day / month / year){" "}
          <span className="text-red-600">*</span>
        </label>
        <input
          id="applicationDateSigned"
          name="applicationDateSigned"
          type="date"
          required
          defaultValue={todaySigned}
          className={`${pdfLine} mt-2 max-w-xs`}
        />
        <p className="mt-4 text-[10px] font-serif italic leading-relaxed text-slate-800">
          Submitting this application online constitutes your electronic signature as the
          applicant in place of a handwritten signature on the printed form.
        </p>
      </div>

      {/* Nomination of beneficiary — PDF layout */}
      <div className="border-b-2 border-slate-900 px-4 py-4">
        <p className={`${L} mb-2`}>Nomination of beneficiary</p>
        <p className="mb-4 text-[10px] font-serif leading-relaxed text-slate-800">
          For the purpose of the Death Benefit as provided by the rules of the Trinidad
          &amp; Tobago Police Service Social Welfare Association.
        </p>
        <p className="text-[11px] font-serif leading-relaxed text-slate-900">
          I, the applicant named above, do hereby nominate the following person as my
          beneficiary:
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="beneficiaryRegimentalNumber" className={L}>
              Beneficiary reg. no. (optional)
            </label>
            <input
              id="beneficiaryRegimentalNumber"
              name="beneficiaryRegimentalNumber"
              type="text"
              className={pdfLine}
            />
          </div>
          <div>
            <label htmlFor="beneficiaryRank" className={L}>
              Beneficiary rank (optional)
            </label>
            <input
              id="beneficiaryRank"
              name="beneficiaryRank"
              type="text"
              className={pdfLine}
            />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="beneficiaryFullName" className={L}>
              Name of beneficiary <span className="text-red-600">*</span>
            </label>
            <input
              id="beneficiaryFullName"
              name="beneficiaryFullName"
              type="text"
              required
              className={pdfLine}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="beneficiaryRelationship" className={L}>
              He/she is my (relationship) <span className="text-red-600">*</span>
            </label>
            <input
              id="beneficiaryRelationship"
              name="beneficiaryRelationship"
              type="text"
              required
              className={pdfLine}
            />
          </div>
          <div>
            <label htmlFor="beneficiaryIdNumber" className={L}>
              ID / DP / PP no. <span className="text-red-600">*</span>
            </label>
            <input
              id="beneficiaryIdNumber"
              name="beneficiaryIdNumber"
              type="text"
              required
              className={pdfLine}
            />
          </div>
        </div>
        <p className="mt-4 text-[11px] font-serif leading-relaxed text-slate-900">
          As my beneficiary for the purpose of &ldquo;Death Benefit&rdquo; as provided for
          by the rules of the Trinidad &amp; Tobago Police Service Social &amp; Welfare
          Association.
        </p>
      </div>

      <div className="border-b-2 border-slate-900 px-4 py-4">
        <label htmlFor="witnessName" className={L}>
          Witness to signature of applicant (optional)
        </label>
        <input
          id="witnessName"
          name="witnessName"
          type="text"
          className={pdfLine}
          placeholder="Name of witness, if applicable"
        />
      </div>

      <div className="border-b-2 border-slate-900 bg-slate-50 px-4 py-3 dark:bg-slate-50">
        <p className="text-center text-[9px] font-bold uppercase leading-relaxed tracking-wide text-slate-800">
          N.B. Only upon acceptance as a member, you will be entitled to the benefits.
        </p>
      </div>

      <div className="px-4 py-4">
        <p className={`${L} mb-2`}>Facial photograph</p>
        <p className="text-[11px] leading-relaxed text-slate-800">
          Upload your facial photo using the <strong>photo panel</strong> on the right
          (desktop) or below the form (mobile): use{" "}
          <strong className="font-semibold text-slate-900">Take your picture</strong> or
          choose a file. Clear, recent face photo. JPG, PNG, or WebP. Maximum{" "}
          <strong>900 KB</strong>.
        </p>
      </div>

      <div className="border-t-2 border-slate-900 bg-slate-50 px-4 py-4 dark:bg-slate-50">
        <p className="text-[9px] leading-relaxed text-slate-600">
          This online form follows the official{" "}
          <a
            href="/forms/MEMBERSHIP APPLICATION.pdf"
            className="font-bold text-slate-900 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Membership application (PDF)
          </a>
          . Password is stored securely and is not visible to administrators as plain text.
        </p>
      </div>

      {message ? (
        <p
          role="status"
          className={
            status === "success"
              ? "border-t border-green-700 bg-green-50 px-4 py-3 text-sm text-green-950"
              : "border-t border-red-700 bg-red-50 px-4 py-3 text-sm text-red-950"
          }
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 border-t-2 border-slate-900 bg-white px-4 py-6 sm:flex-row sm:items-center sm:justify-between dark:bg-white">
        <p className="text-[9px] font-medium uppercase leading-relaxed tracking-wide text-slate-600">
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
