import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-session";
import { createClient } from "@/lib/supabase/server";

export async function isRegistrationAdmin(): Promise<{
  ok: boolean;
  reviewerId: string | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (token && verifyAdminSession(token)) {
    return { ok: true, reviewerId: null };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, reviewerId: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as string | undefined;
    if (role === "admin" || role === "super_admin") {
      return { ok: true, reviewerId: user.id };
    }
  } catch {
    return { ok: false, reviewerId: null };
  }

  return { ok: false, reviewerId: null };
}
