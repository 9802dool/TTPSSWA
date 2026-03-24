export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/membership-services/:path*"],
};
