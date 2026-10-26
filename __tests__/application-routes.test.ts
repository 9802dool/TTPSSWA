import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  upsertMember: vi.fn(),
  createApplication: vi.fn(),
  uploadApplicationDocument: vi.fn(),
  sendAdminNotification: vi.fn(),
  sendApplicantConfirmation: vi.fn(),
  notifyMembershipApplicationPending: vi.fn(),
}));

vi.mock("@/lib/supabase/applications", () => ({
  upsertMember: mocks.upsertMember,
  createApplication: mocks.createApplication,
  uploadApplicationDocument: mocks.uploadApplicationDocument,
}));
vi.mock("@/lib/email-notifications", () => ({
  sendAdminNotification: mocks.sendAdminNotification,
  sendApplicantConfirmation: mocks.sendApplicantConfirmation,
}));
vi.mock("@/lib/member-application-notify", () => ({
  notifyMembershipApplicationPending: mocks.notifyMembershipApplicationPending,
}));
vi.mock("@/lib/supabase/server", () => ({ isSupabaseConfigured: () => true }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(async () => ({ success: true, remaining: 4, resetAt: 0 })),
  getClientIP: () => "203.0.113.1",
  RATE_LIMITS: { applicationForm: { maxRequests: 5, windowSeconds: 3600 } },
}));
vi.mock("@/lib/turnstile", () => ({
  isTurnstileConfigured: () => false,
  verifyTurnstileToken: vi.fn(async () => ({ success: true })),
}));

const ROUTES = [
  "dental-optical-grant",
  "legal-aid-application",
  "member-signup",
  "merit-loan-application",
  "merit-salary-deduction",
  "retirement-benefit-application",
  "salary-deduction",
] as const;

async function loadRoute(name: (typeof ROUTES)[number]) {
  return import(`../app/api/${name}/route.ts`);
}

function post(fd: FormData) {
  return new Request("https://example.test/api/x", { method: "POST", body: fd });
}

function salaryDeductionForm(): FormData {
  const fd = new FormData();
  const fields: Record<string, string> = {
    regimentalNumber: "12345",
    rank: "PC",
    fullName: "Test Officer",
    departmentDivision: "Port of Spain",
    sectionStation: "Central",
    address: "1 Test Street",
    email: "officer@example.com",
    age: "35",
    sex: "male",
    dateOfBirth: "1990-01-01",
    dateOfEnlistment: "2010-01-01",
    phoneCountryCode: "+1868",
    phone: "6201234",
    commencementDate: "2026-11-01",
    witnessName: "Witness",
    witnessDate: "2026-10-26",
    applicantDateSigned: "2026-10-26",
    authMonthlyDeduction: "yes",
    policyAcknowledgment: "yes",
    electronicSignature: "yes",
  };
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

function meritSalaryDeductionForm(): FormData {
  const fd = new FormData();
  const fields: Record<string, string> = {
    regimentalNumber: "12345",
    rank: "PC",
    fullName: "Test Officer",
    address: "1 Test Street",
    divisionBranchSection: "Central",
    workplaceAddress: "HQ",
    deductionSumWords: "One hundred",
    deductionSumDollars: "100",
    startMonth: "November",
    startYear: "26",
    endMonth: "December",
    endYear: "27",
    nameInBlockLetters: "TEST OFFICER",
    signatureRegimentalNumber: "12345",
    signatureRank: "PC",
    signedDate: "2026-10-26",
    witnessName: "Witness",
  };
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  fd.set("signedSalaryDeduction", new File([new Uint8Array([37, 80, 68, 70])], "form.pdf", { type: "application/pdf" }));
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.upsertMember.mockResolvedValue({ member_id: "member-1", is_new: true });
  mocks.createApplication.mockResolvedValue({ application_id: "app-1" });
  mocks.uploadApplicationDocument.mockResolvedValue({ document_id: "doc-1" });
  mocks.sendAdminNotification.mockResolvedValue(undefined);
  mocks.sendApplicantConfirmation.mockResolvedValue(undefined);
  mocks.notifyMembershipApplicationPending.mockResolvedValue(undefined);
});

describe("honeypot rejects spam on every application route", () => {
  it.each(ROUTES)("%s", async (name) => {
    const { POST } = await loadRoute(name);
    const fd = new FormData();
    fd.set("website", "http://spam.example");
    fd.set("fullName", "Bot");
    const res = await POST(post(fd));
    const body = await res.json();
    // Silent rejection: looks like success to a bot, but nothing is stored or sent.
    expect(body.ok).toBe(true);
    expect(body.id === undefined || body.id === "spam-rejected").toBe(true);
    expect(mocks.upsertMember).not.toHaveBeenCalled();
    expect(mocks.createApplication).not.toHaveBeenCalled();
    expect(mocks.sendAdminNotification).not.toHaveBeenCalled();
    expect(mocks.sendApplicantConfirmation).not.toHaveBeenCalled();
  });
});

describe("salary-deduction route", () => {
  it("saves the application and awaits both notifications", async () => {
    let adminDone = false;
    let applicantDone = false;
    mocks.sendAdminNotification.mockImplementation(
      () => new Promise<void>((r) => setTimeout(() => { adminDone = true; r(); }, 20)),
    );
    mocks.sendApplicantConfirmation.mockImplementation(
      () => new Promise<void>((r) => setTimeout(() => { applicantDone = true; r(); }, 20)),
    );
    const { POST } = await loadRoute("salary-deduction");
    const res = await POST(post(salaryDeductionForm()));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ ok: true, id: "app-1" });
    expect(mocks.createApplication).toHaveBeenCalledWith(
      expect.objectContaining({ application_type: "salary_deduction", member_id: "member-1" }),
    );
    // Emails were awaited before the response was returned.
    expect(adminDone).toBe(true);
    expect(applicantDone).toBe(true);
    expect(mocks.sendApplicantConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ applicantEmail: "officer@example.com" }),
    );
  });

  it("links an existing member and keeps the submitted data on the application", async () => {
    mocks.upsertMember.mockResolvedValue({ member_id: "existing-9", is_new: false });
    const { POST } = await loadRoute("salary-deduction");
    const res = await POST(post(salaryDeductionForm()));
    expect((await res.json()).ok).toBe(true);
    const arg = mocks.createApplication.mock.calls[0][0];
    expect(arg.member_id).toBe("existing-9");
    expect(arg.application_data).toMatchObject({ regimentalNumber: "12345" });
    expect(arg).not.toHaveProperty("submitted_data");
  });

});

describe("merit-salary-deduction route", () => {
  it("stores the merit type, uploads the form, notifies admins only", async () => {
    const { POST } = await loadRoute("merit-salary-deduction");
    const res = await POST(post(meritSalaryDeductionForm()));
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, id: "app-1" });
    expect(mocks.createApplication).toHaveBeenCalledWith(
      expect.objectContaining({ application_type: "merit_salary_deduction" }),
    );
    expect(mocks.uploadApplicationDocument).toHaveBeenCalledTimes(1);
    expect(mocks.sendAdminNotification).toHaveBeenCalledWith(
      expect.objectContaining({ applicationType: "merit_salary_deduction" }),
    );
    // No real applicant email exists for this form, so no confirmation is sent.
    expect(mocks.sendApplicantConfirmation).not.toHaveBeenCalled();
  });
});
