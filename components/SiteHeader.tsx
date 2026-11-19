import SiteHeaderClient, { type SiteNavItem } from "@/components/SiteHeaderClient";
import { isSectionEnabled } from "@/lib/feature-flags";

const NAV: readonly SiteNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/executive", label: "Executive team" },
  { href: "/subsidiaries", label: "Subsidiaries" },
  { href: "/partnership", label: "Partnership" },
  { href: "/login", label: "Signup / Login" },
];

export default function SiteHeader() {
  const items = NAV.filter(
    (item) => item.href !== "/login" || isSectionEnabled("membershipSignup"),
  );
  return <SiteHeaderClient items={items} />;
}
