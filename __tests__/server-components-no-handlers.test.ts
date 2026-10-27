import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Regression: /admin/applications crashed (digest 99587962) because a Server
 * Component passed onChange to <select>. Server Components (no "use client")
 * must not pass event handler props such as onClick/onChange.
 */
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

describe("server components", () => {
  it("do not pass event handlers", () => {
    const offenders = walk(path.resolve(__dirname, "../app")).filter((file) => {
      const src = readFileSync(file, "utf8");
      if (/^\s*["']use client["']/.test(src)) return false;
      return /\son[A-Z][A-Za-z]*=\{/.test(src);
    });
    expect(offenders).toEqual([]);
  });
});
