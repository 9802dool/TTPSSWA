import { NextResponse, type NextRequest } from "next/server";
import { mobileWebCorsHeaders } from "@/lib/mobile-web-cors";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
  matcher: "/api/:path*",
};
