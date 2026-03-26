import { NextResponse } from "next/server";
import { recordPageVisit } from "@/lib/analytics-storage";

function shouldSkipPath(path: string): boolean {
  const p = path || "/";
  if (p.startsWith("/api")) return true;
  if (p.startsWith("/_next")) return true;
  if (p.startsWith("/admin")) return true;
  if (/\.(ico|png|jpg|jpeg|gif|webp|svg|woff2?)$/i.test(p)) return true;
  return false;
}

export async function POST(request: Request) {
  let path = "/";
  try {
    const body = (await request.json()) as { path?: string };
    path = typeof body.path === "string" ? body.path : "/";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (path.length > 512) path = path.slice(0, 512);
  if (shouldSkipPath(path)) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  await recordPageVisit(path);
  return NextResponse.json({ ok: true });
}
