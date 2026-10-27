"use client";

import type { ReactNode } from "react";

/**
 * <select> that updates one URL search param and reloads the page.
 * Must be a Client Component: Server Components cannot pass event handlers
 * (that crashed /admin/applications with digest 99587962).
 */
export function AutoSubmitSelect({
  param,
  value,
  className,
  children,
}: {
  param: string;
  value: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <select
      name={param}
      value={value}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set(param, e.target.value);
        window.location.href = url.toString();
      }}
      className={className}
    >
      {children}
    </select>
  );
}
