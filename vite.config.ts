import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Desktop-only renderer build: a plain TanStack Router SPA bundled by Vite and
// loaded by Electron (dev: Vite dev server, prod: static files via the app:// protocol).
export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: "127.0.0.1",
    port: 8080,
    strictPort: true,
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
});
