import { createHmac, timingSafeEqual } from "node:crypto";
import { createServiceClient } from "./supabase/service";
import { hashPassword, verifyPassword } from "./password-hash";

const COOKIE = "ttpsswa_admin";

export type AdminRole = "super_admin" | "staff" | "viewer";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
  exp: number;
}

export function getAdminCookieName(): string {
  return COOKIE;
}

function sessionSecret(): string {
  const p = process.env.ADMIN_SESSION_SECRET?.trim();
  if (p && p.length >= 16) return p;
  // Fallback to ADMIN_PASSWORD-derived key for backward compatibility
  const legacy = process.env.ADMIN_PASSWORD?.trim();
  if (!legacy || legacy.length < 8) return "";
  return createHmac("sha256", "ttpsswa-admin-session-v2").update(legacy).digest("hex");
}

export function signAdminSession(session: AdminSession): string | null {
  const s = sessionSecret();
  if (!s) return null;
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const sig = createHmac("sha256", s).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminSession(token: string): AdminSession | null {
  const s = sessionSecret();
  if (!s) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", s).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;
    if (typeof session.exp !== "number" || session.exp <= Date.now()) return null;
    if (!session.userId || !session.email || !session.role) return null;
    return session;
  } catch {
    return null;
  }
}

/**
 * Authenticate admin by email and password.
 * Returns admin user if successful, null otherwise.
 */
export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .eq("active", true)
    .single();

  if (error || !admin) {
    return null;
  }

  if (!verifyPassword(password, admin.password_hash)) {
    return null;
  }

  // Update last login time
  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", admin.id);

  return {
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name,
    role: admin.role as AdminRole,
    active: admin.active,
    created_at: admin.created_at,
    last_login_at: admin.last_login_at,
  };
}

/**
 * Bootstrap admin creation - uses ADMIN_PASSWORD for first super_admin.
 * Returns null if bootstrap is disabled or Supabase is not configured.
 */
export async function checkBootstrapAdmin(password: string): Promise<boolean> {
  // Check if bootstrap is disabled
  if (process.env.ADMIN_BOOTSTRAP_DISABLED === "true") {
    return false;
  }

  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected || expected.length < 8) {
    return false;
  }

  return password === expected;
}

/**
 * Get admin user by ID.
 */
export async function getAdminById(id: string): Promise<AdminUser | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !admin) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name,
    role: admin.role as AdminRole,
    active: admin.active,
    created_at: admin.created_at,
    last_login_at: admin.last_login_at,
  };
}

/**
 * List all admin users (super_admin only).
 */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];

  const { data: admins, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !admins) {
    return [];
  }

  return admins.map((admin) => ({
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name,
    role: admin.role as AdminRole,
    active: admin.active,
    created_at: admin.created_at,
    last_login_at: admin.last_login_at,
  }));
}

/**
 * Create a new admin user (super_admin only).
 * For bootstrap (first admin), use bootstrapFirstAdmin instead.
 */
export async function createAdminUser(data: {
  email: string;
  full_name: string;
  password: string;
  role: AdminRole;
  created_by?: string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createServiceClient();
  if (!supabase) return { error: "Supabase not configured" };

  // Check if email already exists
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", data.email.toLowerCase())
    .single();

  if (existing) {
    return { error: "Email already exists" };
  }

  const passwordHash = hashPassword(data.password);

  const { data: admin, error } = await supabase
    .from("admin_users")
    .insert({
      email: data.email.toLowerCase(),
      full_name: data.full_name,
      password_hash: passwordHash,
      role: data.role,
      active: true,
      created_by: data.created_by || null,
    })
    .select("id")
    .single();

  if (error || !admin) {
    console.error("Error creating admin user:", error);
    return { error: "Failed to create admin user" };
  }

  return { id: admin.id };
}

/**
 * Bootstrap first super_admin atomically using advisory lock.
 * Prevents race conditions when multiple requests try to bootstrap simultaneously.
 */
export async function bootstrapFirstAdmin(
  email: string,
  fullName: string,
  password: string,
): Promise<{ id: string } | { error: string }> {
  const supabase = createServiceClient();
  if (!supabase) return { error: "Supabase not configured" };

  const passwordHash = hashPassword(password);

  const { data, error } = await supabase.rpc("bootstrap_first_admin", {
    p_email: email.toLowerCase(),
    p_full_name: fullName,
    p_password_hash: passwordHash,
  });

  if (error) {
    console.error("Bootstrap error:", error);
    return { error: "Failed to bootstrap first admin" };
  }

  // data is an array with one row: { success, admin_id, message }
  const result = Array.isArray(data) ? data[0] : data;
  
  if (!result || !result.success) {
    return { error: result?.message || "Bootstrap failed" };
  }

  return { id: result.admin_id };
}

/**
 * Update admin user active status (super_admin only).
 */
export async function updateAdminActive(
  id: string,
  active: boolean,
): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("admin_users")
    .update({ active })
    .eq("id", id);

  return !error;
}

/**
 * Update admin user role (super_admin only).
 */
export async function updateAdminRole(
  id: string,
  role: AdminRole,
): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("admin_users")
    .update({ role })
    .eq("id", id);

  return !error;
}

/**
 * Check if current session has the required role.
 * Roles hierarchy: super_admin > staff > viewer
 */
export function hasRole(session: AdminSession | null, minRole: AdminRole): boolean {
  if (!session) return false;

  const roleLevel: Record<AdminRole, number> = {
    viewer: 1,
    staff: 2,
    super_admin: 3,
  };

  return roleLevel[session.role] >= roleLevel[minRole];
}

/**
 * Check if any admin users exist in the database.
 * Returns true if error occurs (fail closed - assume admins exist for safety).
 */
export async function hasAnyAdmins(): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return true; // Fail closed - assume admins exist

  const { count, error } = await supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("hasAnyAdmins error:", error);
    return true; // Fail closed - assume admins exist on error
  }
  
  return (count ?? 0) > 0;
}
