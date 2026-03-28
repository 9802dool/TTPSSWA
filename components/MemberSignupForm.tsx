"use client";

import { useState } from "react";
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
      className="mt-6 space-y-6 text-left"
      encType="multipart/form-data"
    >
      <div className="rounded border border-line bg-canvas px-4 py-3 text-xs leading-relaxed text-muted dark:bg-surface/50">
        Complete all sections. Fields marked{" "}
        <span className="font-semibold text-red-600">*</span> are required. Your
        password is stored securely and is not visible to administrators as plain
        text.
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
              Full name <span className="text-red-600">*</span>
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

      <Section number="III" title="Contact information">
        <div>
          <label htmlFor="address" className={labelClass}>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="email" className={labelClass}>
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
            <label htmlFor="phoneCountryCode" className={labelClass}>
              Country code <span className="text-red-600">*</span>
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
            <label htmlFor="phone" className={labelClass}>
              Phone number <span className="text-red-600">*</span>
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
              Enter digits for your line; country code is selected separately.
            </p>
          </div>
        </div>
      </Section>

      <Section number="IV" title="Facial photograph">
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
          By submitting, you confirm that the information provided is accurate to
          the best of your knowledge.
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
