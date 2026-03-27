import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Pass current path into server layout for post-login redirects. */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-cc-return",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/central-committee-representatives/:path*"],
};
