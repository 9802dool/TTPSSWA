import { describe, it, expect } from "vitest";
import { getApplicantDisplayName } from "@/lib/applicant-name";

describe("getApplicantDisplayName", () => {
  it("prefers fullName", () => {
    expect(getApplicantDisplayName({ fullName: "  Jane   Doe ", guestName: "x", firstName: "A" })).toBe("Jane Doe");
  });

  it("uses guestName for hotel bookings", () => {
    expect(getApplicantDisplayName({ guestName: "Guest Person" })).toBe("Guest Person");
  });

  it("builds the name from first/last name fields when fullName is missing (Merit Loan)", () => {
    expect(getApplicantDisplayName({ firstName: "DEMO", surname: "Member (presentation)" })).toBe(
      "DEMO Member (presentation)",
    );
    expect(getApplicantDisplayName({ first_name: "Ann", middleName: "B.", lastName: "Cee" })).toBe("Ann B. Cee");
    expect(getApplicantDisplayName({ surname: "OnlySurname" })).toBe("OnlySurname");
  });

  it("falls back to the linked member's full name", () => {
    expect(getApplicantDisplayName({ email: "a@b.c", regimentalNumber: "1" }, "Member Name")).toBe("Member Name");
  });

  it("form name fields win over the member record", () => {
    expect(getApplicantDisplayName({ firstName: "Form" , surname: "Name" }, "Member Name")).toBe("Form Name");
  });

  it("returns empty string when nothing is known, ignoring non-string values", () => {
    expect(getApplicantDisplayName({ fullName: 42, firstName: null })).toBe("");
    expect(getApplicantDisplayName(null)).toBe("");
    expect(getApplicantDisplayName(["x"], "  ")).toBe("");
  });
});
