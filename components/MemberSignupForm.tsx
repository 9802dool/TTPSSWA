"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MembershipFacialPhotoPanel } from "@/components/MembershipFacialPhotoPanel";
import {
  AssociationFormHeader,
  AssociationOfficersFooter,
} from "@/components/AssociationFormLetterhead";
import {
  MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE,
  MEMBERSHIP_PHONE_COUNTRY_CODES,
} from "@/lib/phone-country-codes";

const line =
  "w-full min-w-0 border-0 border-b border-black bg-transparent px-1 py-0.5 text-[13px] uppercase text-black outline-none placeholder:normal-case placeholder:text-neutral-400 focus:border-[#0d2a70]";

const label = "whitespace-nowrap text-xs font-bold uppercase";

export function MemberSignupForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const todaySigned = useMemo(() => new Date().toISOString().slice(0, 10), []);

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
    const forename = String(fd.get("forename") ?? "").trim();
    const surname = String(fd.get("surname") ?? "").trim();
    fd.set("fullName", `${forename} ${surname}`.trim());
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
      setMessage("Your application has been received. You will be contacted after review.");
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
      className="membership-form-pdf mx-auto max-w-[850px] text-left text-[13px] text-black"
      encType="multipart/form-data"
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

      <div className="relative border border-[#ccc] bg-white px-6 py-8 shadow-[0_0_10px_rgba(0,0,0,0.1)] sm:px-8">
        <div className="mb-4 border border-dashed border-black bg-neutral-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-700">
            Online account (this website only)
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label htmlFor="username" className={label}>
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
                className={line}
              />
            </div>
            <div>
              <label htmlFor="password" className={label}>
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
                className={`${line} normal-case`}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={label}>
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
                className={`${line} normal-case`}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <AssociationFormHeader />
            <h4 className="mt-4 text-center text-base font-bold uppercase underline">Membership form</h4>
            <p className="mb-1 text-center text-[11px] font-bold">Please fill out in block letters</p>
          </div>
          <div className="w-full shrink-0 sm:w-44">
            <MembershipFacialPhotoPanel formId="membership-application-form" />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="regimentalNumber" className={label}>
              Reg no.
            </label>
            <input id="regimentalNumber" name="regimentalNumber" type="text" required className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="rank" className={label}>
              Rank
            </label>
            <input id="rank" name="rank" type="text" required autoComplete="organization-title" className={line} />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="departmentDivision" className={label}>
              Department/Division
            </label>
            <input id="departmentDivision" name="departmentDivision" type="text" required className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="sectionStation" className={label}>
              Section/Station
            </label>
            <input id="sectionStation" name="sectionStation" type="text" required className={line} />
          </div>
        </div>

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="address" className={label}>
            Home address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            required
            autoComplete="street-address"
            className={line}
          />
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="forename" className={label}>
              Name
            </label>
            <input
              id="forename"
              name="forename"
              type="text"
              required
              autoComplete="given-name"
              placeholder="FORENAME"
              className={line}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-end">
            <label htmlFor="surname" className="sr-only">
              Surname
            </label>
            <input
              id="surname"
              name="surname"
              type="text"
              required
              autoComplete="family-name"
              placeholder="SURNAME"
              className={line}
            />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="phoneCountryCode" className={label}>
              Code
            </label>
            <select
              id="phoneCountryCode"
              name="phoneCountryCode"
              required
              defaultValue={MEMBERSHIP_DEFAULT_PHONE_COUNTRY_CODE}
              autoComplete="tel-country-code"
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
            <label htmlFor="phoneHome" className={label}>
              Contact numbers: Home
            </label>
            <input id="phoneHome" name="phoneHome" type="tel" inputMode="tel" autoComplete="tel-national" className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="phoneWork" className={label}>
              Work
            </label>
            <input id="phoneWork" name="phoneWork" type="tel" inputMode="tel" className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="phone" className={label}>
              Cell
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel-national"
              className={line}
            />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex w-full items-end gap-2 sm:max-w-[8rem]">
            <label htmlFor="age" className={label}>
              Age
            </label>
            <input id="age" name="age" type="number" required min={18} max={99} className={line} />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="dateOfBirth" className={label}>
              Date of birth
            </label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" required className={`${line} normal-case`} />
          </div>
          <fieldset className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <legend className={label}>Sex:</legend>
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="radio" name="sex" value="male" required /> Male
            </label>
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="radio" name="sex" value="female" /> Female
            </label>
          </fieldset>
        </div>

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="email" className={label}>
            Email address
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={`${line} normal-case`} />
        </div>

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="dateOfEnlistment" className={label}>
            Date of enlistment in Police Service
          </label>
          <input
            id="dateOfEnlistment"
            name="dateOfEnlistment"
            type="date"
            required
            className={`${line} max-w-xs normal-case`}
          />
        </div>

        <fieldset className="mb-3">
          <legend className={label}>
            Financial member <span className="text-red-600">*</span>
          </legend>
          <div className="mt-2 flex gap-6">
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="radio" name="financialMember" value="yes" required /> Yes
            </label>
            <label className="inline-flex items-center gap-1 text-xs font-bold uppercase">
              <input type="radio" name="financialMember" value="no" /> No
            </label>
          </div>
        </fieldset>

        <div className="my-5 text-justify text-xs font-normal uppercase leading-relaxed">
          <p>
            As member of the Trinidad &amp; Tobago Police Service I hereby apply for membership with the
            Trinidad &amp; Tobago Police Service Social &amp; Welfare Association.
          </p>
          <p className="mt-3">
            Additionally, I authorize the monthly deductions from my salary of the sum of one hundred and
            forty dollars ($140.00), being my subscription to the Association.
          </p>
          <label className="mt-3 flex items-start gap-2 normal-case">
            <input
              type="checkbox"
              name="declarationMembership"
              value="yes"
              required
              className="mt-0.5"
            />
            <span className="text-[11px] font-bold uppercase">
              I confirm the statements above and the $140.00 monthly deduction.
            </span>
          </label>
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="datedWeekday" className={label}>
              Dated this
            </label>
            <input id="datedWeekday" name="datedWeekday" type="text" required placeholder="(WEEKDAY)" className={line} />
          </div>
          <input name="datedDate" type="text" required placeholder="(DATE)" aria-label="Date" className={line} />
          <input name="datedMonth" type="text" required placeholder="(MONTH)" aria-label="Month" className={line} />
          <input name="datedYear" type="text" required placeholder="(YEAR)" aria-label="Year" className={line} />
        </div>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row">
          <div className="flex-1">
            <div className="mb-1 h-8 border-b border-black" />
            <p className="text-[11px] font-bold uppercase">Signature of applicant</p>
            <p className="mt-1 text-[10px] uppercase text-neutral-700">
              Online submission counts as your electronic signature.
            </p>
          </div>
          <div className="flex flex-1 items-end gap-2">
            <label htmlFor="applicationDateSigned" className={label}>
              Date
            </label>
            <input
              id="applicationDateSigned"
              name="applicationDateSigned"
              type="date"
              required
              defaultValue={todaySigned}
              className={`${line} normal-case`}
            />
          </div>
        </div>

        <h4 className="mb-4 mt-6 text-center text-sm font-bold uppercase underline">
          Nomination of beneficiary
        </h4>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <span className={label}>I</span>
            <input
              name="nominatorRegNo"
              type="text"
              required
              placeholder="REG NO"
              aria-label="Nominator reg no"
              className={line}
            />
          </div>
          <input name="nominatorRank" type="text" required placeholder="RANK" aria-label="Nominator rank" className={line} />
          <input name="nominatorName" type="text" required placeholder="NAME" aria-label="Nominator name" className={line} />
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="beneficiaryFullName" className={label}>
              Do hereby nominate
            </label>
            <input
              id="beneficiaryFullName"
              name="beneficiaryFullName"
              type="text"
              required
              placeholder="NAME OF BENEFICIARY"
              className={line}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-end gap-2">
            <label htmlFor="beneficiaryIdNumber" className={label}>
              With ID/DP/PP no.
            </label>
            <input id="beneficiaryIdNumber" name="beneficiaryIdNumber" type="text" required className={line} />
          </div>
        </div>

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="beneficiaryRelationship" className={label}>
            He/She is my
          </label>
          <input
            id="beneficiaryRelationship"
            name="beneficiaryRelationship"
            type="text"
            required
            placeholder="(Relationship)"
            className={line}
          />
        </div>

        <p className="my-4 text-justify text-xs uppercase leading-relaxed">
          As my beneficiary for the purpose of &ldquo;Death Benefit&rdquo; as provided for by the rules of
          the Trinidad &amp; Tobago Police Service Social &amp; Welfare Association.
        </p>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row">
          <div className="flex-1">
            <div className="mb-1 h-8 border-b border-black" />
            <p className="text-[11px] font-bold uppercase">Signature of applicant</p>
          </div>
          <div className="flex flex-1 items-end gap-2">
            <label htmlFor="beneficiarySignatureDate" className={label}>
              Date
            </label>
            <input
              id="beneficiarySignatureDate"
              name="beneficiarySignatureDate"
              type="date"
              required
              className={`${line} normal-case`}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row">
          <div className="flex flex-1 items-end gap-2">
            <label htmlFor="witnessName" className="sr-only">
              Witness to signature of applicant
            </label>
            <input
              id="witnessName"
              name="witnessName"
              type="text"
              className={line}
              aria-label="Witness to signature of applicant"
            />
          </div>
          <div className="flex flex-1 items-end gap-2">
            <label htmlFor="witnessDate" className={label}>
              Date
            </label>
            <input id="witnessDate" name="witnessDate" type="date" required className={`${line} normal-case`} />
          </div>
        </div>
        <p className="mt-1 text-[11px] font-bold uppercase">Witness to signature of applicant</p>

        <p className="mt-5 text-center text-[10px] font-bold uppercase">
          N.B Only upon acceptance as a member, you will be entitled to the benefits
        </p>

        <AssociationOfficersFooter variant="membership" />

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
          Password is stored securely.{" "}
          <Link href="/membership-services" className="underline">
            Membership services
          </Link>
        </p>
      </div>
    </form>
  );
}
