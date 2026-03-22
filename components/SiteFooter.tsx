export default function SiteFooter() {
  return (
    <footer className="border-t border-stone-200/90 bg-surface py-12 dark:border-stone-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg font-semibold text-ink">TTPSSWA</p>
          <p className="max-w-md text-sm text-muted">
            Update the footer in <code className="rounded bg-stone-100 px-1 py-0.5 text-xs dark:bg-stone-800">components/SiteFooter.tsx</code>{" "}
            with your legal name, registration details, or social links.
          </p>
        </div>
        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} TTPSSWA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
