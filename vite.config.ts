import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  // Works at username.github.io/repository/ and at a custom-domain root.
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(dirname, "src") } },
  build: { chunkSizeWarningLimit: 650 },
});
