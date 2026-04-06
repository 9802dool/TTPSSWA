"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

const L = "text-[10px] font-bold uppercase tracking-wide text-black";

const pdfLine =
  "mt-0.5 w-full min-h-[1.75rem] border-0 border-b border-dotted border-black bg-transparent px-0 py-0.5 text-xs font-semibold uppercase tracking-wide text-black outline-none ring-0 placeholder:text-neutral-400 focus:border-black focus:ring-0";

const pdfBox =
  "mt-0.5 w-full rounded-none border border-black bg-white px-1 py-1.5 text-xs font-semibold uppercase text-black outline-none focus:border-black focus:ring-1 focus:ring-black";

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
      className="membership-form-pdf w-full border-2 border-black bg-white text-left text-black shadow-sm"
      encType="multipart/form-data"
    >
      <div className="border-b-2 border-black bg-neutral-100 px-3 py-3">
        <p className={`${L} text-neutral-700`}>Online account (this website only)</p>
        <p className="mt-1 text-[9px] uppercase leading-relaxed text-neutral-600">
          Username and password for submitting this application — not part of the printed form.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              placeholder=""
            />
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

      <div className="border-b-2 border-black bg-white px-3 pb-4 pt-3">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-base font-bold uppercase tracking-[0.2em] text-black underline decoration-2 underline-offset-4 sm:text-lg">
            Membership form
          </h2>
          <p className="mt-3 text-left text-[10px] font-bold uppercase tracking-wide text-black underline decoration-1 underline-offset-2">
            Please fill out in block letters
          </p>
        </div>
      </div>

      <div className="space-y-5 border-b-2 border-black px-3 py-4">
        <div className="grid grid-cols-12 gap-x-2 gap-y-2">
          <div className="col-span-6 sm:col-span-2">
            <span className={L}>
              Reg no <span className="text-red-600">*</span>
            </span>
            <input
              id="regimentalNumber"
              name="regimentalNumber"
              type="text"
              autoComplete="off"
              required
              className={pdfLine}
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <span className={L}>
              Rank <span className="text-red-600">*</span>
            </span>
            <input
              id="rank"
              name="rank"
              type="text"
              autoComplete="organization-title"
              required
              className={pdfLine}
            />
          </div>
          <div className="col-span-12 sm:col-span-7">
            <span className={L}>
              Name <span className="text-red-600">*</span>
            </span>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              className={pdfLine}
            />
            <div className="mt-1 flex justify-between text-[8px] font-bold uppercase tracking-widest text-black">
              <span>Forename</span>
              <span>Surname</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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

        <div>
          <label htmlFor="address" className={L}>
            Home address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            required
            autoComplete="street-address"
            className={`${pdfBox} min-h-[4.5rem] w-full resize-y border-dotted`}
          />
        </div>

        <div>
          <p className={L}>Contact numbers</p>
          <p className="mt-1 text-[8px] font-bold uppercase text-neutral-600">
            Country code (once) — local digits only per line
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="phoneCountryCode" className={L}>
                Code <span className="text-red-600">*</span>
              </label>
              <select
                id="phoneCountryCode"
                name="phoneCountryCode"
                required
                defaultValue={MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE}
                autoComplete="tel-country-code"
                className={`${pdfBox} border-solid`}
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
                Home
              </label>
              <input
                id="phoneHome"
                name="phoneHome"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                className={pdfLine}
              />
            </div>
            <div>
              <label htmlFor="phoneWork" className={L}>
                Work
              </label>
              <input
                id="phoneWork"
                name="phoneWork"
                type="tel"
                inputMode="tel"
                className={pdfLine}
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
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-12">
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
            />
          </div>
          <div className="sm:col-span-5">
            <span className={L}>
              Sex <span className="text-red-600">*</span>
            </span>
            <div className="mt-2 flex flex-wrap gap-6">
              <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase text-black">
                <input
                  type="radio"
                  name="sex"
                  value="male"
                  required
                  className="h-3.5 w-3.5 border-2 border-black text-black focus:ring-black"
                />
                Male
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase text-black">
                <input
                  type="radio"
                  name="sex"
                  value="female"
                  className="h-3.5 w-3.5 border-2 border-black text-black focus:ring-black"
                />
                Female
              </label>
            </div>
          </div>
          <div className="sm:col-span-5">
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

        <div className="grid gap-6 sm:grid-cols-2">
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
            <p className="mt-1 text-center text-[8px] font-bold uppercase tracking-wide text-black">
              Day/month/year
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
            <p className="mt-1 text-center text-[8px] font-bold uppercase tracking-wide text-black">
              Day/month/year
            </p>
          </div>
        </div>

        <fieldset className="border-2 border-black border-dotted bg-neutral-50 p-3">
          <legend className={`${L} px-1`}>
            Financial member <span className="text-red-600">*</span>
          </legend>
          <p className="mb-2 text-[8px] font-bold uppercase text-neutral-600">
            Required for online submission (not on printed PDF).
          </p>
          <div className="flex flex-wrap gap-8">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase text-black">
              <input
                type="radio"
                name="financialMember"
                value="yes"
                required
                className="h-3.5 w-3.5 border-2 border-black text-black focus:ring-black"
              />
              Yes
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase text-black">
              <input
                type="radio"
                name="financialMember"
                value="no"
                className="h-3.5 w-3.5 border-2 border-black text-black focus:ring-black"
              />
              No
            </label>
          </div>
        </fieldset>
      </div>

      <div className="border-b-2 border-black px-3 py-4">
        <div className="space-y-3 text-[10px] font-bold uppercase leading-relaxed tracking-wide text-black">
          <p>
            As member of the Trinidad &amp; Tobago Police Service I hereby apply for membership with the
            Trinidad &amp; Tobago Police Service Social &amp; Welfare Association.
          </p>
          <p>
            Additionally, I authorize the monthly deductions from my salary of the sum of one hundred and
            forty dollars ($140.00), being my subscription to the Association.
          </p>
        </div>
        <label className="mt-4 flex cursor-pointer gap-2 border-2 border-black border-dotted bg-neutral-50 p-3">
          <input
            type="checkbox"
            name="declarationMembership"
            value="yes"
            required
            className="mt-0.5 h-3.5 w-3.5 shrink-0 border-2 border-black text-black focus:ring-black"
          />
          <span className="text-[9px] font-bold uppercase leading-relaxed tracking-wide text-black">
            I confirm the statements above and the $140.00 monthly deduction.{" "}
            <span className="text-red-600">*</span>
          </span>
        </label>
      </div>

      <div className="border-b-2 border-black px-3 py-4">
        <label htmlFor="applicationDateSigned" className={L}>
          Dated this <span className="text-red-600">*</span>
        </label>
        <input
          id="applicationDateSigned"
          name="applicationDateSigned"
          type="date"
          required
          defaultValue={todaySigned}
          className={`${pdfLine} mt-1 max-w-xs`}
        />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-[8px] font-bold uppercase text-black sm:max-w-lg">
          <span>(Weekday)</span>
          <span>(Date)</span>
          <span>(Month)</span>
          <span>(Year)</span>
        </div>
        <div className="mt-4">
          <p className={L}>Signature of applicant</p>
          <div className="mt-1 border-b border-dotted border-black pb-4" />
          <p className="mt-4 text-[8px] font-bold uppercase text-neutral-700">
            Online submission counts as your electronic signature in place of a handwritten signature.
          </p>
        </div>
      </div>

      <div className="border-b-2 border-black px-3 py-4">
        <h3 className="text-center text-[11px] font-bold uppercase tracking-wide text-black underline decoration-2 underline-offset-4">
          Nomination of beneficiary
        </h3>
        <p className="mt-4 text-[10px] font-bold uppercase leading-relaxed text-black">
          I, the applicant named above, do hereby nominate:
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <span className={L}>Reg no (optional)</span>
            <input
              id="beneficiaryRegimentalNumber"
              name="beneficiaryRegimentalNumber"
              type="text"
              className={pdfLine}
            />
          </div>
          <div>
            <span className={L}>Rank (optional)</span>
            <input id="beneficiaryRank" name="beneficiaryRank" type="text" className={pdfLine} />
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="beneficiaryRelationship" className={L}>
              He/she is my <span className="text-red-600">*</span>
            </label>
            <input
              id="beneficiaryRelationship"
              name="beneficiaryRelationship"
              type="text"
              required
              className={pdfLine}
            />
            <p className="mt-0.5 text-[8px] font-bold uppercase text-black">(Relationship)</p>
          </div>
          <div>
            <label htmlFor="beneficiaryIdNumber" className={L}>
              With ID/DP/PP no. <span className="text-red-600">*</span>
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
        <p className="mt-4 text-[10px] font-bold uppercase leading-relaxed text-black">
          As my beneficiary for the purpose of &ldquo;Death Benefit&rdquo; as provided for by the rules of
          the Trinidad &amp; Tobago Police Service Social &amp; Welfare Association.
        </p>
        <div className="mt-5 space-y-3">
          <div>
            <p className={L}>Signature of applicant</p>
            <div className="mt-1 border-b border-dotted border-black pb-3" />
            <p className="mt-1 text-[8px] font-bold uppercase text-black">Date</p>
          </div>
          <div>
            <label htmlFor="witnessName" className={L}>
              Witness to signature of applicant (optional)
            </label>
            <input id="witnessName" name="witnessName" type="text" className={pdfLine} />
            <p className="mt-1 text-[8px] font-bold uppercase text-black">Date</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-b-2 border-black px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[8px] font-bold uppercase text-black">Nov 2023</p>
        <p className="text-center text-[8px] font-bold uppercase leading-tight text-red-600 underline decoration-1 sm:flex-1">
          N.B. Only upon acceptance as a member. You will be entitled to the benefits.
        </p>
        <span className="hidden w-16 sm:block" aria-hidden />
      </div>

      <div className="px-3 py-3">
        <p className={L}>Facial photograph</p>
        <p className="mt-1 text-[9px] font-bold uppercase leading-relaxed text-neutral-700">
          Use the photo panel: Take your picture or upload. JPG, PNG, or WebP. Max 900 KB.{" "}
          <span className="text-red-600">*</span>
        </p>
      </div>

      <div className="border-t border-black bg-neutral-100 px-3 py-2">
        <p className="text-[8px] font-bold uppercase leading-relaxed text-neutral-600">
          Printable reference:{" "}
          <a
            href="/forms/MEMBERSHIP APPLICATION.pdf"
            className="text-black underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Membership application (PDF)
          </a>
          . Password is stored securely.
        </p>
      </div>

      {message ? (
        <p
          role="status"
          className={
            status === "success"
              ? "border-t border-green-700 bg-green-50 px-3 py-3 text-sm text-green-950"
              : "border-t border-red-700 bg-red-50 px-3 py-3 text-sm text-red-950"
          }
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t-2 border-black bg-white px-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[8px] font-bold uppercase leading-relaxed text-neutral-600">
          By submitting you confirm the information is accurate.{" "}
          <Link href="/membership-services" className="text-black underline">
            Membership services
          </Link>
          .
        </p>
        <button type="submit" disabled={status === "loading"} className="site-btn-submit">
          {status === "loading" ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
