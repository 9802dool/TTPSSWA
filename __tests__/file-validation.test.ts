import { describe, it, expect } from "vitest";
import { validateFile, validateFileType, validateFileSize, getExtensionForMimeType, MAX_FILE_SIZE } from "../lib/file-validation";

describe("file validation", () => {
  describe("validateFileSize", () => {
    it("rejects empty files", () => {
      const file = new File([], "empty.pdf");
      expect(validateFileSize(file)).toBe(false);
    });

    it("accepts files within size limit", () => {
      const content = new Uint8Array(1024); // 1 KB
      const file = new File([content], "small.pdf");
      expect(validateFileSize(file)).toBe(true);
    });

    it("rejects files over the size limit", () => {
      const content = new Uint8Array(MAX_FILE_SIZE + 1);
      const file = new File([content], "toolarge.pdf");
      expect(validateFileSize(file)).toBe(false);
    });

    it("accepts files at the size limit", () => {
      const content = new Uint8Array(MAX_FILE_SIZE);
      const file = new File([content], "exactly5mb.pdf");
      expect(validateFileSize(file)).toBe(true);
    });
  });

  describe("validateFileType", () => {
    it("identifies PDF by magic bytes", async () => {
      const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // %PDF-1.4
      const file = new File([pdfHeader], "test.pdf");
      const mimeType = await validateFileType(file);
      expect(mimeType).toBe("application/pdf");
    });

    it("identifies JPEG by magic bytes", async () => {
      const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const file = new File([jpegHeader], "test.jpg");
      const mimeType = await validateFileType(file);
      expect(mimeType).toBe("image/jpeg");
    });

    it("identifies PNG by magic bytes", async () => {
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const file = new File([pngHeader], "test.png");
      const mimeType = await validateFileType(file);
      expect(mimeType).toBe("image/png");
    });

    it("identifies WebP by RIFF and WEBP markers", async () => {
      // WebP: RIFF (0-3), file size (4-7), WEBP (8-11)
      const webpHeader = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // size placeholder
        0x57, 0x45, 0x42, 0x50, // WEBP
      ]);
      const file = new File([webpHeader], "test.webp");
      const mimeType = await validateFileType(file);
      expect(mimeType).toBe("image/webp");
    });

    it("rejects RIFF files that are not WebP", async () => {
      // RIFF but with AVI marker instead of WEBP
      const aviHeader = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // size
        0x41, 0x56, 0x49, 0x20, // AVI (not WEBP)
      ]);
      const file = new File([aviHeader], "test.avi");
      const mimeType = await validateFileType(file);
      expect(mimeType).toBeNull();
    });

    it("rejects files with wrong magic bytes even if extension looks valid", async () => {
      const textContent = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello"
      const file = new File([textContent], "fake.pdf");
      const mimeType = await validateFileType(file);
      expect(mimeType).toBeNull();
    });

    it("rejects unknown file types", async () => {
      const unknownHeader = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
      const file = new File([unknownHeader], "unknown.bin");
      const mimeType = await validateFileType(file);
      expect(mimeType).toBeNull();
    });
  });

  describe("validateFile", () => {
    it("accepts valid PDF", async () => {
      const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
      const file = new File([pdfHeader], "test.pdf");
      const result = await validateFile(file);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.mimeType).toBe("application/pdf");
      }
    });

    it("rejects file with invalid type", async () => {
      const textContent = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]);
      const file = new File([textContent], "test.txt");
      const result = await validateFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("Invalid file type");
      }
    });

    it("rejects empty file", async () => {
      const file = new File([], "empty.pdf");
      const result = await validateFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("must be between");
      }
    });

    it("rejects file over the size limit", async () => {
      const largeContent = new Uint8Array(MAX_FILE_SIZE + 1);
      // Add PDF magic bytes so type validation passes
      largeContent[0] = 0x25;
      largeContent[1] = 0x50;
      largeContent[2] = 0x44;
      largeContent[3] = 0x46;
      const file = new File([largeContent], "toolarge.pdf");
      const result = await validateFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("4 MB");
      }
    });
  });

  describe("getExtensionForMimeType", () => {
    it("returns .pdf for PDF", () => {
      expect(getExtensionForMimeType("application/pdf")).toBe(".pdf");
    });

    it("returns .jpg for JPEG", () => {
      expect(getExtensionForMimeType("image/jpeg")).toBe(".jpg");
    });

    it("returns .png for PNG", () => {
      expect(getExtensionForMimeType("image/png")).toBe(".png");
    });

    it("returns .webp for WebP", () => {
      expect(getExtensionForMimeType("image/webp")).toBe(".webp");
    });
  });
});
