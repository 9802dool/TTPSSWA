import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

function isAdminPasswordConfigured(): boolean {
  const p = process.env.ADMIN_PASSWORD?.trim();
  return Boolean(p && p.length >= 8);
}

export default function AdminLoginPage() {
  const configured = isAdminPasswordConfigured();

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-[var(--bg)] px-4 pb-16 pt-[calc(4.25rem+2rem)] text-[var(--fg)]">
        <div className="mx-auto flex max-w-sm flex-col gap-6">
          {!configured ? (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
              role="status"
            >
              <p className="font-medium">Admin sign-in is not ready</p>
              <p className="mt-2 text-sm opacity-90">
                {process.env.VERCEL ? (
                  <>
                    Add{" "}
                    <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                      ADMIN_PASSWORD
                    </code>{" "}
                    (at least 8 characters) in{" "}
                    <strong>Vercel → Project → Settings → Environment Variables</strong>
                    , enable it for Production (and Preview if needed), then{" "}
                    <strong>Redeploy</strong>.{" "}
                    <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                      .env.local
                    </code>{" "}
                    is not deployed to Vercel.
                  </>
                ) : (
                  <>
                    Add{" "}
                    <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                      ADMIN_PASSWORD
                    </code>{" "}
                    (at least 8 characters) to{" "}
                    <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                      .env.local
                    </code>{" "}
                    in the TTPSSWA project folder, then restart{" "}
                    <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
                      npm run dev
                    </code>
                    .
                  </>
                )}
              </p>
            </div>
          ) : null}
          <AdminLoginForm />
          {configured ? (
            <p className="text-center text-sm text-[var(--muted)]">
              After sign-in you can open{" "}
              <strong className="text-[var(--fg)]">Signup pending</strong> and{" "}
              <strong className="text-[var(--fg)]">View profile</strong> for each
              member.{" "}
              <Link href="/login" className="text-[var(--brand)] hover:underline">
                Public signup form
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
