import { describe, expect, it } from "vitest";
import {
  MAX_UPLOAD_TOTAL_BYTES,
  UPLOAD_TOO_LARGE_MESSAGE,
  checkUploadTotal,
  totalUploadBytes,
  uploadErrorMessage,
} from "@/lib/upload-limits";

const file = (n: number) => new File([new Uint8Array(n)], "a.pdf", { type: "application/pdf" });

describe("upload limits", () => {
  it("sums only file entries", () => {
    const fd = new FormData();
    fd.append("name", "x");
    fd.append("a", file(100));
    fd.append("b", file(50));
    expect(totalUploadBytes(fd)).toBe(150);
  });
  it("stays under Vercel's 4.5 MB request limit", () => {
    expect(MAX_UPLOAD_TOTAL_BYTES).toBeLessThan(4.5 * 1024 * 1024);
  });
  it("flags oversized submissions", () => {
    const fd = new FormData();
    fd.append("a", file(MAX_UPLOAD_TOTAL_BYTES + 1));
    expect(checkUploadTotal(fd)).toBeTruthy();
    const ok = new FormData();
    ok.append("a", file(10));
    expect(checkUploadTotal(ok)).toBeFalsy();
  });
  it("maps 413 to a friendly message", () => {
    expect(uploadErrorMessage(413, undefined)).toBe(UPLOAD_TOO_LARGE_MESSAGE);
    expect(uploadErrorMessage(400, "bad")).toBe("bad");
  });
});
