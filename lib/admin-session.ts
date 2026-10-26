/**
 * @deprecated Use @/lib/admin-auth instead. This file is kept for backward compatibility only.
 * All admin authentication should now use the individual account system in admin-auth.ts.
 */
export {
  getAdminCookieName,
  verifyAdminSession,
  signAdminSession,
  type AdminSession,
  type AdminRole,
} from "./admin-auth";

