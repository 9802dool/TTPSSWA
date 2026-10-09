"use server";

import { revalidatePath } from "next/cache";
import { isRegistrationAdmin } from "@/lib/registration-admin";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

function textField(formData: FormData, key: string, max: number): string {
  const value = String(formData.get(key) ?? "").trim();
  return value.slice(0, max);
}

function safeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return cleaned || "file";
}

function validateUpload(file: FormDataEntryValue | null, label: string): File | { error: string } {
  if (!(file instanceof File) || file.size === 0) {
    return { error: `Please upload a ${label}.` };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: `${label} must be a JPG, PNG, WEBP, or PDF.` };
  }
  if (file.size > MAX_BYTES) {
    return { error: `${label} must be 8 MB or smaller.` };
  }
  return file;
}

export async function submitRegistrationForm(formData: FormData) {
  const regNumber = textField(formData, "regNumber", 40);
  const fullName = textField(formData, "fullName", 120);
  const rank = textField(formData, "rank", 40);
  const division = textField(formData, "division", 80);
  const phone = textField(formData, "phone", 40);
  const email = textField(formData, "email", 120);

  if (!regNumber || !fullName || !rank || !division || !phone || !email) {
    return { error: "Please complete every field." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const idCard = validateUpload(formData.get("idCard"), "service ID card");
  if ("error" in idCard) return idCard;
  const payslip = validateUpload(formData.get("payslip"), "payslip");
  if ("error" in payslip) return payslip;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "Registration storage is not configured yet." };
  }

  const timestamp = Date.now();
  const idCardPath = `ids/${timestamp}_${regNumber}_${safeFileName(idCard.name)}`;
  const payslipPath = `payslips/${timestamp}_${regNumber}_${safeFileName(payslip.name)}`;

  const { error: idUploadError } = await supabase.storage
    .from("registration-docs")
    .upload(idCardPath, idCard, { contentType: idCard.type, upsert: false });

  if (idUploadError) return { error: `ID upload failed: ${idUploadError.message}` };

  const { error: payslipUploadError } = await supabase.storage
    .from("registration-docs")
    .upload(payslipPath, payslip, { contentType: payslip.type, upsert: false });

  if (payslipUploadError) {
    await supabase.storage.from("registration-docs").remove([idCardPath]);
    return { error: `Payslip upload failed: ${payslipUploadError.message}` };
  }

  const { error: dbError } = await supabase.from("applications").insert({
    reg_number: regNumber,
    full_name: fullName,
    rank,
    division,
    phone,
    email,
    id_card_path: idCardPath,
    payslip_path: payslipPath,
    status: "pending",
  });

  if (dbError) {
    await supabase.storage.from("registration-docs").remove([idCardPath, payslipPath]);
    return { error: `Could not save the application: ${dbError.message}` };
  }

  return { success: true as const };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  adminNotes: string,
) {
  const admin = await isRegistrationAdmin();
  if (!admin.ok) return { error: "Unauthorized action." };

  const supabase = createServiceClient() ?? (await createClient().catch(() => null));
  if (!supabase) return { error: "Registration storage is not configured yet." };

  const { error } = await supabase
    .from("applications")
    .update({
      status,
      admin_notes: adminNotes.slice(0, 2000),
      reviewed_by: admin.reviewerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (error) return { error: error.message };

  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function getDocumentSignedUrl(filePath: string) {
  const admin = await isRegistrationAdmin();
  if (!admin.ok) return null;
  if (!filePath.startsWith("ids/") && !filePath.startsWith("payslips/")) return null;
  if (filePath.includes("..")) return null;

  const supabase = createServiceClient() ?? (await createClient().catch(() => null));
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from("registration-docs")
    .createSignedUrl(filePath, 60 * 15);

  if (error || !data) return null;
  return data.signedUrl;
}
