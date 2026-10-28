import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Components use the automatic JSX runtime (as in Next.js), so tests can render them.
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: { 
    environment: "node", 
    include: ["__tests__/**/*.test.ts"],
    globals: true,
  },
});
