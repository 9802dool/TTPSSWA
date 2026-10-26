import { describe, it, expect, vi, beforeEach } from "vitest";

type Row = Record<string, unknown>;
const state = vi.hoisted(() => ({
  members: [] as Row[],
  updates: 0,
  inserts: [] as Row[],
}));

function builder(table: string) {
  const filters: [string, unknown][] = [];
  let op: "select" | "insert" | "update" = "select";
  let payload: Row | null = null;
  const run = () => {
    if (op === "update") {
      state.updates++;
      return { data: null, error: null };
    }
    if (op === "insert") {
      const row = { id: `new-${state.inserts.length + 1}`, ...payload };
      state.inserts.push(row);
      return { data: row, error: null };
    }
    const rows = state.members.filter((m) => filters.every(([k, v]) => m[k] === v));
    return { data: rows[0] ?? null, error: rows[0] ? null : { code: "PGRST116" } };
  };
  const b: Record<string, unknown> = {
    select: () => b,
    eq: (k: string, v: unknown) => { filters.push([k, v]); return b; },
    ilike: (k: string, v: unknown) => { filters.push([k, v]); return b; },
    limit: () => b,
    update: (p: Row) => { op = "update"; payload = p; return b; },
    insert: (p: Row) => { op = "insert"; payload = p; return b; },
    single: async () => run(),
    maybeSingle: async () => { const r = run(); return { data: r.data, error: null }; },
    then: (res: (v: unknown) => unknown) => Promise.resolve(run()).then(res),
  };
  void table;
  return b;
}

function rpcHandler(funcName: string, params: Record<string, unknown>) {
  if (funcName === "get_member_by_email_lower") {
    const searchEmail = (params.search_email as string).toLowerCase();
    const member = state.members.find((m) => 
      typeof m.email === "string" && m.email.toLowerCase() === searchEmail
    );
    return {
      maybeSingle: async () => ({ data: member ?? null, error: null }),
    };
  }
  return {
    maybeSingle: async () => ({ data: null, error: null }),
  };
}

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ 
    from: (t: string) => builder(t),
    rpc: (fn: string, p: Record<string, unknown>) => rpcHandler(fn, p),
  }),
}));
vi.mock("../lib/supabase/service", () => ({
  createServiceClient: () => ({ 
    from: (t: string) => builder(t),
    rpc: (fn: string, p: Record<string, unknown>) => rpcHandler(fn, p),
  }),
}));

import { upsertMember } from "../lib/supabase/applications";

beforeEach(() => {
  state.members = [];
  state.updates = 0;
  state.inserts = [];
});

describe("upsertMember (public submissions)", () => {
  it("creates a new member when none matches", async () => {
    const r = await upsertMember({ email: "new@example.com", full_name: "New Person", service_number: "999" });
    expect(r).toMatchObject({ is_new: true });
    expect(state.inserts).toHaveLength(1);
    expect(state.updates).toBe(0);
    // Verify email is lowercased
    expect(state.inserts[0].email).toBe("new@example.com");
  });

  it("links an existing member by email without updating their profile", async () => {
    state.members = [{ id: "m1", email: "real@example.com", full_name: "Real Name", address: "Real Address" }];
    const r = await upsertMember({ email: "real@example.com", full_name: "Attacker", address: "Fake Address" });
    expect(r).toEqual({ member_id: "m1", is_new: false });
    expect(state.updates).toBe(0);
    expect(state.inserts).toHaveLength(0);
    expect(state.members[0]).toMatchObject({ full_name: "Real Name", address: "Real Address" });
  });

  it("matches emails case-insensitively", async () => {
    state.members = [{ id: "m1", email: "user@example.com", full_name: "Real Name" }];
    const r = await upsertMember({ email: "USER@EXAMPLE.COM", full_name: "Someone", service_number: "999" });
    expect(r).toEqual({ member_id: "m1", is_new: false });
    expect(state.inserts).toHaveLength(0);
  });

  it("stores new member emails in lowercase", async () => {
    const r = await upsertMember({ email: "MixedCase@Example.COM", full_name: "Test User" });
    expect(r).toMatchObject({ is_new: true });
    expect(state.inserts[0].email).toBe("mixedcase@example.com");
  });

  it("links an existing member by service number without updating their profile", async () => {
    state.members = [{ id: "m2", email: "other@example.com", service_number: "12345", full_name: "Real" }];
    const r = await upsertMember({ email: "12345@placeholder.local", full_name: "X", service_number: "12345" });
    expect(r).toEqual({ member_id: "m2", is_new: false });
    expect(state.updates).toBe(0);
  });
});
