import { describe, it, expect, vi, beforeEach } from "vitest";

const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import { sendAdminNotification, sendApplicantConfirmation } from "../lib/email-notifications";

beforeEach(() => {
  send.mockReset();
  process.env.RESEND_API_KEY = "test-key";
  process.env.BOOKING_FROM_EMAIL = "TTPSSWA <bookings@example.org>";
  process.env.ADMIN_NOTIFY_EMAIL = "a@example.org, b@example.org";
});

describe("email notifications", () => {
  it("sends the admin notification to every configured admin address", async () => {
    send.mockResolvedValue({ data: { id: "1" }, error: null });
    await sendAdminNotification({
      applicationType: "merit_salary_deduction",
      applicantName: "Test",
      applicantEmail: "(not provided)",
      applicantServiceNumber: "123",
      applicationId: "app-1",
    });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["a@example.org", "b@example.org"],
        from: "TTPSSWA <bookings@example.org>",
        subject: "New Application: Merit Salary Deduction Authorization",
      }),
    );
  });

  it("never throws when the email provider fails", async () => {
    send.mockRejectedValue(new Error("provider down"));
    await expect(
      sendAdminNotification({
        applicationType: "salary_deduction",
        applicantName: "T",
        applicantEmail: "t@example.com",
        applicantServiceNumber: "1",
        applicationId: "x",
      }),
    ).resolves.toBeUndefined();
    await expect(
      sendApplicantConfirmation({
        applicationType: "salary_deduction",
        applicantName: "T",
        applicantEmail: "t@example.com",
        applicationId: "x",
      }),
    ).resolves.toBeUndefined();
  });

  it("does not email placeholder addresses", async () => {
    await sendApplicantConfirmation({
      applicationType: "merit_salary_deduction",
      applicantName: "T",
      applicantEmail: "123@placeholder.local",
      applicationId: "x",
    });
    expect(send).not.toHaveBeenCalled();
  });
});
