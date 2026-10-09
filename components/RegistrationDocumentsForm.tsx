"use client";

import { useState, type FormEvent } from "react";
import { submitRegistrationForm } from "@/app/actions/application-actions";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-white p-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";
const labelClass = "block text-sm font-medium text-ink";

export function RegistrationDocumentsForm() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await submitRegistrationForm(new FormData(event.currentTarget));
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-xl font-bold text-green-800">Application received</h2>
        <p className="mt-2 text-sm text-green-700">
          Your registration details and documents are pending review.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="mx-auto max-w-lg space-y-4 rounded-lg border border-line bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-ink">Registration documents</h2>
      <p className="text-sm text-muted">
        Submit your service ID and a payslip so an administrator can verify your registration.
      </p>
      {error ? (
        <div className="rounded bg-red-100 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}
      <div>
        <label htmlFor="regNumber" className={labelClass}>
          Regimental number
        </label>
        <input id="regNumber" name="regNumber" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full name
        </label>
        <input id="fullName" name="fullName" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="rank" className={labelClass}>
          Rank
        </label>
        <input id="rank" name="rank" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="division" className={labelClass}>
          Division
        </label>
        <input id="division" name="division" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input id="phone" name="phone" type="tel" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="idCard" className={labelClass}>
          Service ID card
        </label>
        <input
          id="idCard"
          name="idCard"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="payslip" className={labelClass}>
          Payslip
        </label>
        <input
          id="payslip"
          name="payslip"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit registration"}
      </button>
    </form>
  );
}
