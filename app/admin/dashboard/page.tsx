import { redirect } from "next/navigation";

// The legacy registration dashboard read a table layout and storage bucket
// ("registration-docs") that no longer exist. All applications are managed in
// /admin/applications.
export default function AdminDashboardPage() {
  redirect("/admin/applications");
}
