import { NextResponse, type NextRequest } from "next/server";
import { disabledSectionForPath, SECTION_QUERY } from "@/lib/feature-flags";
import { mobileWebCorsHeaders } from "@/lib/mobile-web-cors";

function applyCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin");
  if (!origin) return response;
  const cors = mobileWebCorsHeaders(origin, request.method, request.headers);
  if (!cors) return response;
  for (const [key, value] of Object.entries(cors)) {
    response.headers.set(key, value);
  }
  return response;
}

/** Disabled APIs answer immediately and never reach the route handler. */
function apiUnavailable(request: NextRequest): NextResponse {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    if (!origin) {
      return new NextResponse(null, { status: 204 });
    }
    const cors = mobileWebCorsHeaders(origin, "OPTIONS", request.headers);
    if (!cors) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, { status: 204, headers: cors });
  }

  const response = NextResponse.json(
    { error: "This service is not available." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
  return applyCors(request, response);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const section = disabledSectionForPath(pathname);

  if (section) {
    if (pathname.startsWith("/api/")) {
      return apiUnavailable(request);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.searchParams.set("section", SECTION_QUERY[section]);
    return NextResponse.rewrite(url);
  }

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    if (!origin) {
      return new NextResponse(null, { status: 204 });
    }
    const cors = mobileWebCorsHeaders(origin, "OPTIONS", request.headers);
    if (!cors) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, { status: 204, headers: cors });
  }

  const res = NextResponse.next();
  if (origin) {
    const cors = mobileWebCorsHeaders(origin, request.method, request.headers);
    if (cors) {
      for (const [key, value] of Object.entries(cors)) {
        res.headers.set(key, value);
      }
    }
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|docx|pdf|css|js|map|txt|woff2?)$).*)",
  ],
};
