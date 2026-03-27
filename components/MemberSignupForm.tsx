"use client";

import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm outline-none ring-brand placeholder:text-muted focus:ring-2 dark:bg-canvas";

export function MemberSignupForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
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
      setMessage("Thank you — your signup details were received.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mt-4 space-y-4 text-left"
      encType="multipart/form-data"
    >
      <div>
        <label htmlFor="regimentalNumber" className="text-sm font-medium text-ink">
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
        <label htmlFor="rank" className="text-sm font-medium text-ink">
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
      <div>
        <label htmlFor="fullName" className="text-sm font-medium text-ink">
          Name <span className="text-red-600">*</span>
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
      <div>
        <label htmlFor="address" className="text-sm font-medium text-ink">
          Address <span className="text-red-600">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          required
          autoComplete="street-address"
          className={`${inputClass} resize-y min-h-[5rem]`}
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email <span className="text-red-600">*</span>
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
        <label htmlFor="phone" className="text-sm font-medium text-ink">
          Phone number <span className="text-red-600">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          className={inputClass}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">
          Are you a financial member? <span className="text-red-600">*</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
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

      <div>
        <label htmlFor="facialPhoto" className="text-sm font-medium text-ink">
          Facial photo <span className="text-red-600">*</span>
        </label>
        <p className="mt-0.5 text-xs text-muted">
          Clear, recent face photo. JPG, PNG, or WebP. Max 5 MB.
        </p>
        <input
          id="facialPhoto"
          name="facialPhoto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-brand-subtle file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand hover:file:text-white"
        />
      </div>

      {message ? (
        <p
          role="status"
          className={
            status === "success"
              ? "rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-900 dark:bg-green-950/50 dark:text-green-100"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
          }
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-brand px-6 text-sm font-semibold text-white shadow-corp-md transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Submitting…" : "Submit signup"}
      </button>
    </form>
  );
}
