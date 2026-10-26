"use client";

import { useState } from "react";
import type { AdminUser, AdminRole } from "@/lib/admin-auth";

interface AdminUsersTableProps {
  admins: AdminUser[];
  currentUserId: string;
}

export function AdminUsersTable({ admins, currentUserId }: AdminUsersTableProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("viewer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          email,
          full_name: fullName,
          password,
          role,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to create admin");
        return;
      }

      setSuccess("Admin created successfully");
      setEmail("");
      setFullName("");
      setPassword("");
      setRole("viewer");
      setShowAddForm(false);

      // Refresh the page to show new admin
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    if (
      !confirm(
        currentActive
          ? "Deactivate this admin? They will no longer be able to sign in."
          : "Reactivate this admin?",
      )
    ) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_active",
          id,
          active: !currentActive,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to update admin");
        return;
      }

      setSuccess("Admin updated successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError("Network error");
    }
  }

  async function handleChangeRole(id: string, newRole: AdminRole) {
    if (!confirm(`Change this admin's role to ${newRole}?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_role",
          id,
          role: newRole,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to update role");
        return;
      }

      setSuccess("Role updated successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-100">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Admin Accounts ({admins.length})
        </h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="site-btn-admin-primary"
          >
            Add Admin
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
            <h3 className="font-semibold">Add New Admin</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new-admin-email"
                  className="block text-sm font-medium"
                >
                  Email
                </label>
                <input
                  id="new-admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="new-admin-name"
                  className="block text-sm font-medium"
                >
                  Full Name
                </label>
                <input
                  id="new-admin-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="new-admin-password"
                  className="block text-sm font-medium"
                >
                  Password (min 8 characters)
                </label>
                <input
                  id="new-admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="new-admin-role"
                  className="block text-sm font-medium"
                >
                  Role
                </label>
                <select
                  id="new-admin-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                >
                  <option value="viewer">Viewer (read-only)</option>
                  <option value="staff">Staff (edit status & notes)</option>
                  <option value="super_admin">Super Admin (full access)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="site-btn-admin-primary disabled:opacity-60"
              >
                {busy ? "Creating..." : "Create Admin"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEmail("");
                  setFullName("");
                  setPassword("");
                  setRole("viewer");
                  setError(null);
                }}
                className="site-btn-admin-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--bg)]">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isCurrentUser = admin.id === currentUserId;
              return (
                <tr
                  key={admin.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {admin.email}
                    {isCurrentUser && (
                      <span className="ml-2 rounded bg-[var(--brand)] px-1.5 py-0.5 text-xs text-white">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{admin.full_name}</td>
                  <td className="px-4 py-3">
                    {isCurrentUser ? (
                      <span className="capitalize">{admin.role.replace("_", " ")}</span>
                    ) : (
                      <select
                        value={admin.role}
                        onChange={(e) =>
                          void handleChangeRole(admin.id, e.target.value as AdminRole)
                        }
                        className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="staff">Staff</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {admin.active ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--muted)]">
                    {admin.last_login_at
                      ? new Date(admin.last_login_at).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {!isCurrentUser && (
                      <button
                        onClick={() =>
                          void handleToggleActive(admin.id, admin.active)
                        }
                        className="text-sm text-[var(--brand)] hover:underline"
                      >
                        {admin.active ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
