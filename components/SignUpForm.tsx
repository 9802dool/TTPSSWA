"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink shadow-sm outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand";
const labelClass = "block text-sm font-medium text-ink";

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    serviceNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || "Failed to register account.");
      }

      router.push("/login?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mx-auto max-w-md space-y-4 rounded-lg bg-white p-6 shadow-md"
    >
      <h2 className="mb-4 text-2xl font-bold text-ink">Create Online Account</h2>
      <p className="text-sm text-muted">
        This creates a website login only. Formal association membership and salary
        deduction are a separate step after you sign in.
      </p>
      {error ? (
        <div className="rounded bg-red-100 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          required
          className={inputClass}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Work Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="serviceNumber" className={labelClass}>
          Regiment / Service Number
        </label>
        <input
          id="serviceNumber"
          type="text"
          autoComplete="off"
          required
          className={inputClass}
          value={formData.serviceNumber}
          onChange={(e) =>
            setFormData({ ...formData, serviceNumber: e.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="site-btn-block-primary disabled:opacity-50"
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
