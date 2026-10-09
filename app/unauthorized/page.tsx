import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function UnauthorizedPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-4 pb-16 pt-[calc(var(--site-header-stack)+3rem)]">
        <h1 className="text-2xl font-bold text-ink">Unauthorized</h1>
        <p className="mt-3 max-w-lg text-sm text-muted">
          This page is limited to association administrators.
        </p>
        <Link href="/admin/login" className="mt-6 inline-block text-sm font-medium text-brand hover:underline">
          Admin sign-in
        </Link>
      </main>
    </>
  );
}
