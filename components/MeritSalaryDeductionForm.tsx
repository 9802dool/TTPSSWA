"use client";

import { useState } from "react";
import {
  AssociationFormHeader,
  AssociationOfficersFooter,
} from "@/components/AssociationFormLetterhead";

const line =
  "w-full min-w-0 border-0 border-b border-black bg-transparent px-1 py-0.5 text-[13px] uppercase text-black outline-none placeholder:normal-case placeholder:text-neutral-400 focus:border-[#0d2a70]";

const inline =
  "mx-1 border-0 border-b border-black bg-transparent px-1 text-[13px] uppercase text-black outline-none focus:border-[#0d2a70]";

const label = "whitespace-nowrap text-xs font-bold uppercase";

const MAX_DOCUMENT_BYTES = 800 * 1024;

export function MeritSalaryDeductionForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const firstName = String(fd.get("firstName") ?? "").trim();
    const surname = String(fd.get("surname") ?? "").trim();
    fd.set("fullName", `${firstName} ${surname}`.trim());

    const file = fd.get("signedSalaryDeduction");
    if (!(file instanceof File) || file.size === 0) {
      setStatus("error");
      setMessage("Please upload the completed and signed salary deduction form.");
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setStatus("error");
      setMessage("The signed salary deduction form must be 800 KB or smaller.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/merit-salary-deduction", {
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
        "Your MERIT salary deduction form has been received. You will be contacted if further information is needed.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-[850px] text-left text-[13px] text-black">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border border-[#ccc] bg-white px-5 py-4 shadow-[0_2px_5px_rgba(0,0,0,0.05)] print:hidden">
        <p className="text-sm font-bold text-[#0d2a70]">MERIT salary deduction form (step 2 of 2)</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded bg-[#28a745] px-4 py-2 text-[13px] font-bold text-white"
        >
          Download &amp; print form
        </button>
      </div>

      <div className="mb-5 border-2 border-dashed border-[#0d2a70] bg-[#f8faee] px-5 py-4 print:hidden">
        <label htmlFor="signedSalaryDeduction" className="mb-2 block text-xs font-bold uppercase">
          Upload completed &amp; signed salary deduction form:
        </label>
        <input
          id="signedSalaryDeduction"
          name="signedSalaryDeduction"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          required
          form="meritSalaryDeductionForm"
          className="text-[11px]"
        />
        <p className="mt-2 text-[11px]">PDF, JPG, or PNG. Maximum 800 KB.</p>
      </div>

      <form id="meritSalaryDeductionForm" onSubmit={(e) => void onSubmit(e)}>
        <div className="border border-[#ccc] bg-white px-6 py-8 shadow-[0_0_10px_rgba(0,0,0,0.1)] print:border-0 print:p-0 print:shadow-none sm:px-9">
          <AssociationFormHeader />

          <h4 className="mb-5 mt-4 text-center text-lg font-bold uppercase underline">
            Salary deduction form
          </h4>

          <div className="mb-3.5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-[0.3] items-end gap-2">
              <label htmlFor="msd-regimentalNumber" className={label}>
                Reg. no.
              </label>
              <input id="msd-regimentalNumber" name="regimentalNumber" type="text" required className={line} />
            </div>
            <div className="flex min-w-0 flex-[0.3] items-end gap-2">
              <label htmlFor="msd-rank" className={label}>
                Rank
              </label>
              <input id="msd-rank" name="rank" type="text" required className={line} />
            </div>
            <div className="flex min-w-0 flex-1 items-end gap-2">
              <label htmlFor="msd-firstName" className={label}>
                Name:
              </label>
              <input
                id="msd-firstName"
                name="firstName"
                type="text"
                required
                placeholder="FIRST NAME"
                autoComplete="given-name"
                className={line}
              />
              <label htmlFor="msd-surname" className="sr-only">
                Surname
              </label>
              <input
                id="msd-surname"
                name="surname"
                type="text"
                required
                placeholder="SURNAME"
                autoComplete="family-name"
                className={line}
              />
            </div>
          </div>

          <div className="mb-3.5 flex items-end gap-2">
            <label htmlFor="msd-address" className={label}>
              Address:
            </label>
            <input
              id="msd-address"
              name="address"
              type="text"
              required
              autoComplete="street-address"
              className={line}
            />
          </div>

          <p className="mb-2.5 mt-4 text-xs font-bold">
            I am a member of the Trinidad and Tobago Police Service Social and Welfare Association
          </p>

          <div className="mb-3.5 flex items-end gap-2">
            <label htmlFor="msd-divisionBranchSection" className={label}>
              Division/Branch/Section:
            </label>
            <input
              id="msd-divisionBranchSection"
              name="divisionBranchSection"
              type="text"
              required
              className={line}
            />
          </div>

          <div className="mb-3.5 flex items-end gap-2">
            <label htmlFor="msd-workplaceAddress" className={label}>
              Situate at
            </label>
            <input
              id="msd-workplaceAddress"
              name="workplaceAddress"
              type="text"
              required
              placeholder="ADDRESS OF WORKPLACE"
              className={line}
            />
          </div>

          <div className="my-4 border border-dashed border-[#666] bg-[#fafafa] px-2 py-2 text-center text-[11px] font-bold uppercase text-[#555]">
            Do not write in this area
          </div>

          <p className="my-5 text-[13px] leading-8">
            do hereby authorize the paysheet clerk to deduct from my salary each month the sum of
            <input
              name="deductionSumWords"
              type="text"
              required
              aria-label="Deduction amount in words"
              className={`${inline} w-56`}
            />
            dollars ($
            <input
              name="deductionSumDollars"
              type="text"
              required
              aria-label="Deduction amount in dollars"
              className={`${inline} w-24`}
            />
            ) for transmission to the above named Association commencing from
            <input
              name="startMonth"
              type="text"
              required
              aria-label="Start month"
              className={`${inline} w-28`}
            />
            <span className="inline-block text-center align-top text-[10px]">(month)</span> 20
            <input
              name="startYear"
              type="text"
              required
              inputMode="numeric"
              maxLength={2}
              aria-label="Start year"
              className={`${inline} w-10`}
            />
            until
            <input
              name="endMonth"
              type="text"
              required
              aria-label="End month"
              className={`${inline} w-28`}
            />
            <span className="inline-block text-center align-top text-[10px]">(month)</span> 20
            <input
              name="endYear"
              type="text"
              required
              inputMode="numeric"
              maxLength={2}
              aria-label="End year"
              className={`${inline} w-10`}
            />
            .
          </p>

          <p className="my-5 text-[13px] leading-8">
            <strong>N.B. Monthly deduction of $</strong>
            <input
              name="resumeAmount"
              type="text"
              aria-label="Resume deduction amount"
              className={`${inline} w-24`}
            />
            shall resume from
            <input
              name="resumeMonth"
              type="text"
              aria-label="Resume month"
              className={`${inline} w-28`}
            />
            <span className="inline-block text-center align-top text-[10px]">(Month)</span> 20
            <input
              name="resumeYear"
              type="text"
              inputMode="numeric"
              maxLength={2}
              aria-label="Resume year"
              className={`${inline} w-10`}
            />
            .
          </p>

          <p className="my-4 text-center font-bold tracking-[6px]">* * * * * * * * * * * * * * * * * *</p>

          <p className="mb-6 text-xs font-bold leading-snug">
            This authorization cannot be cancelled or waivered unless permission from the Association is
            obtained in writing. Please be guided accordingly
          </p>

          <div className="mt-5 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            <div>
              <input
                name="nameInBlockLetters"
                type="text"
                required
                aria-label="Name in block letters"
                className={line}
              />
              <p className="mt-1 text-[11px] font-bold uppercase">Name in block letters</p>
            </div>
            <div>
              <div className="mb-1 h-6 border-b border-black" />
              <p className="text-[11px] font-bold uppercase">Signature</p>
            </div>
            <div>
              <input
                name="signatureRegimentalNumber"
                type="text"
                required
                aria-label="Signature reg. no."
                className={line}
              />
              <p className="mt-1 text-[11px] font-bold uppercase">Reg. no.</p>
            </div>
            <div>
              <input name="signatureRank" type="text" required aria-label="Signature rank" className={line} />
              <p className="mt-1 text-[11px] font-bold uppercase">Rank</p>
            </div>
            <div>
              <input name="signedDate" type="date" required aria-label="Date" className={`${line} normal-case`} />
              <p className="mt-1 text-[11px] font-bold uppercase">Date</p>
            </div>
            <div>
              <input name="witnessName" type="text" required aria-label="Witness to signature" className={line} />
              <p className="mt-1 text-[11px] font-bold uppercase">Witness to signature</p>
            </div>
          </div>

          <AssociationOfficersFooter variant="meritSalary" dated="Feb 2026" />

          {message ? (
            <p
              role="status"
              className={
                status === "success"
                  ? "mt-4 border border-green-700 bg-green-50 px-3 py-3 text-sm text-green-950 print:hidden"
                  : "mt-4 border border-red-700 bg-red-50 px-3 py-3 text-sm text-red-950 print:hidden"
              }
            >
              {message}
            </p>
          ) : null}
        </div>
      </form>

      <div className="mt-5 text-right print:hidden">
        <button
          type="submit"
          form="meritSalaryDeductionForm"
          disabled={status === "loading"}
          className="rounded bg-[#0d2a70] px-4 py-2 text-[13px] font-bold text-white disabled:opacity-60"
        >
          {status === "loading" ? "Submitting…" : "Submit MERIT Facility Application"}
        </button>
      </div>
    </div>
  );
}
