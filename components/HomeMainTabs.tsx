"use client";

import type { ReactNode } from "react";
import { useId, useRef, useState } from "react";

type TabId = "overview" | "executive";

type Props = {
  overview: ReactNode;
  executive: ReactNode;
};

export function HomeMainTabs({ overview, executive }: Props) {
  const baseId = useId();
  const tabOverviewId = `${baseId}-tab-overview`;
  const tabExecutiveId = `${baseId}-tab-executive`;
  const panelOverviewId = `${baseId}-panel-overview`;
  const panelExecutiveId = `${baseId}-panel-executive`;

  const overviewTabRef = useRef<HTMLButtonElement>(null);
  const executiveTabRef = useRef<HTMLButtonElement>(null);

  const [tab, setTab] = useState<TabId>("overview");

  const moveTab = (next: TabId) => {
    setTab(next);
    queueMicrotask(() => {
      (next === "overview" ? overviewTabRef : executiveTabRef).current?.focus();
    });
  };

  const onTabListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    if (e.key === "ArrowRight") {
      moveTab(tab === "overview" ? "executive" : "overview");
    } else {
      moveTab(tab === "executive" ? "overview" : "executive");
    }
  };

  return (
    <div>
      <div
        className="sticky top-[var(--site-header-stack)] z-40 border-b border-line bg-[#e8ecf1]/95 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95"
        role="tablist"
        aria-label="Home sections"
        onKeyDown={onTabListKeyDown}
      >
        <div className="mx-auto flex max-w-6xl gap-1 px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
          <button
            ref={overviewTabRef}
            type="button"
            role="tab"
            id={tabOverviewId}
            aria-selected={tab === "overview"}
            aria-controls={panelOverviewId}
            tabIndex={tab === "overview" ? 0 : -1}
            onClick={() => setTab("overview")}
            className={
              tab === "overview"
                ? "relative rounded-t-xl border border-b-0 border-line bg-white px-4 py-3 text-sm font-bold text-ink shadow-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                : "rounded-t-xl border border-transparent px-4 py-3 text-sm font-semibold text-muted transition hover:text-ink dark:text-slate-400 dark:hover:text-white"
            }
          >
            Services &amp; benefits
          </button>
          <button
            ref={executiveTabRef}
            type="button"
            role="tab"
            id={tabExecutiveId}
            aria-selected={tab === "executive"}
            aria-controls={panelExecutiveId}
            tabIndex={tab === "executive" ? 0 : -1}
            onClick={() => setTab("executive")}
            className={
              tab === "executive"
                ? "relative rounded-t-xl border border-b-0 border-line bg-white px-4 py-3 text-sm font-bold text-ink shadow-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                : "rounded-t-xl border border-transparent px-4 py-3 text-sm font-semibold text-muted transition hover:text-ink dark:text-slate-400 dark:hover:text-white"
            }
          >
            Executive team
          </button>
        </div>
      </div>

      <div
        id={panelOverviewId}
        role="tabpanel"
        aria-labelledby={tabOverviewId}
        hidden={tab !== "overview"}
      >
        {overview}
      </div>
      <div
        id={panelExecutiveId}
        role="tabpanel"
        aria-labelledby={tabExecutiveId}
        hidden={tab !== "executive"}
      >
        {executive}
      </div>
    </div>
  );
}
