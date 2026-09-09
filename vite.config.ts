import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Low-end friendly output: small chunks (lazy screens/games stay separate
    // so weak devices parse less JS per navigation), minified CSS, and tiny
    // assets inlined to cut HTTP requests on slow networks.
    cssMinify: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 600,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Keep the framework in one shared chunk so each lazy screen/game
        // chunk stays small on low-memory devices.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("preact") || id.includes("@preact/signals")) return "vendor";
          }
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/test-setup.ts"],
    css: false,
  },
});