"use client";

import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-white p-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";
const labelClass = "block text-sm font-medium text-ink";

export default function MembershipApplyForm({ userId }: { userId: string }) {
  const [formData, setFormData] = useState({
    stationDivision: "",
    nisNumber: "",
    bankName: "",
    accountNumber: "",
    salaryDeductionApproved: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.salaryDeductionApproved) {
      setError("You must consent to salary deduction to apply.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/membership/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...formData }),
      });

      if (res.ok) {
        setSubmitted(true);
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { message?: string };
      setError(data.message || "Could not submit your application.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-center">
        <h3 className="text-xl font-bold text-green-800">Application Submitted</h3>
        <p className="mt-2 text-green-700">
          Your formal association membership and salary deduction request is pending
          administrative verification.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mx-auto max-w-lg space-y-4 rounded-lg border border-line bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-ink">
        Formal Membership &amp; Salary Deduction Authorization
      </h2>
      <p className="text-sm text-muted">
        Banking and salary deduction details are collected here only — not during
        website account sign-up.
      </p>

      {error ? (
        <div className="rounded bg-red-100 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="stationDivision" className={labelClass}>
          Station / Division
        </label>
        <input
          id="stationDivision"
          type="text"
          required
          className={inputClass}
          value={formData.stationDivision}
          onChange={(e) =>
            setFormData({ ...formData, stationDivision: e.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="nisNumber" className={labelClass}>
          NIS Number
        </label>
        <input
          id="nisNumber"
          type="text"
          required
          autoComplete="off"
          className={inputClass}
          value={formData.nisNumber}
          onChange={(e) => setFormData({ ...formData, nisNumber: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bankName" className={labelClass}>
            Bank Name
          </label>
          <input
            id="bankName"
            type="text"
            required
            className={inputClass}
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="accountNumber" className={labelClass}>
            Account Number
          </label>
          <input
            id="accountNumber"
            type="text"
            required
            autoComplete="off"
            inputMode="numeric"
            className={inputClass}
            value={formData.accountNumber}
            onChange={(e) =>
              setFormData({ ...formData, accountNumber: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <input
          type="checkbox"
          id="deductionConsent"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-brand"
          checked={formData.salaryDeductionApproved}
          onChange={(e) =>
            setFormData({ ...formData, salaryDeductionApproved: e.target.checked })
          }
        />
        <label htmlFor="deductionConsent" className="text-sm text-muted">
          I hereby authorize monthly salary deduction for association membership dues.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="site-btn-block-primary disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Official Application"}
      </button>
    </form>
  );
}
