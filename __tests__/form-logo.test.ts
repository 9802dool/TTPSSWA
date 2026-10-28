import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { AssociationFormHeader, AssociationFormLogo } from "@/components/AssociationFormLetterhead";
import { SITE_LOGO_SRC, SITE_LOGO_SIZE } from "@/lib/site-logo";

const root = path.resolve(__dirname, "..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx|ts)$/.test(p) ? [p] : [];
  });
}

describe("site logo", () => {
  it("points at the real emblem in public/", () => {
    const file = path.join(root, "public", SITE_LOGO_SRC.replace(/^\//, ""));
    expect(existsSync(file)).toBe(true);
    // PNG IHDR: width/height are big-endian uint32 at bytes 16..24.
    const buf = readFileSync(file);
    expect(buf.subarray(1, 4).toString()).toBe("PNG");
    expect(buf.readUInt32BE(16)).toBe(SITE_LOGO_SIZE);
    expect(buf.readUInt32BE(20)).toBe(SITE_LOGO_SIZE);
  });

  it("the site header uses the shared logo constant", () => {
    const src = readFileSync(path.join(root, "components/SiteHeader.tsx"), "utf8");
    expect(src).toContain("src={SITE_LOGO_SRC}");
  });
});

describe("form letterhead logo", () => {
  it("renders the real logo image, not the old placeholder emblem", () => {
    const html = renderToStaticMarkup(createElement(AssociationFormLogo));
    expect(html).toContain("<img");
    expect(html).toContain('alt="TTPSSWA logo"');
    expect(html).toContain(encodeURIComponent(SITE_LOGO_SRC));
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("<polygon");
    expect(html).not.toContain(">SERVICE<");
  });

  it("is part of the form header shown on every application form and its printout", () => {
    const html = renderToStaticMarkup(createElement(AssociationFormHeader));
    expect(html).toContain('data-testid="association-form-logo"');
    expect(html).toContain(encodeURIComponent(SITE_LOGO_SRC));
  });

  it("every form that has a letterhead uses the shared AssociationFormHeader", () => {
    const forms = [
      "MemberSignupForm",
      "SalaryDeductionForm",
      "MeritLoanForm",
      "MeritSalaryDeductionForm",
      "LegalAidApplicationForm",
      "RetirementBenefitForm",
      "DentalOpticalGrantForm",
    ];
    for (const name of forms) {
      const src = readFileSync(path.join(root, "components", `${name}.tsx`), "utf8");
      expect(src, name).toContain("<AssociationFormHeader />");
    }
  });

  it("no component or page draws its own placeholder emblem or points at another logo file", () => {
    const offenders: string[] = [];
    for (const file of [...walk(path.join(root, "components")), ...walk(path.join(root, "app"))]) {
      const src = readFileSync(file, "utf8");
      if (/<polygon\b/.test(src)) offenders.push(`${path.relative(root, file)}: <polygon> emblem`);
      const logoRefs = src.match(/["'`]\/(?:icon1?|logo\w*)\.(?:png|svg|jpe?g|webp)["'`]/g) ?? [];
      for (const ref of logoRefs) offenders.push(`${path.relative(root, file)}: ${ref} (use SITE_LOGO_SRC)`);
    }
    expect(offenders).toEqual([]);
  });
});
