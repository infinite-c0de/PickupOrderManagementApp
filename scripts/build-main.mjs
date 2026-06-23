import { build } from "esbuild";
import { rmSync } from "node:fs";

const OUTDIR = "dist-electron";

rmSync(OUTDIR, { recursive: true, force: true });

await build({
  entryPoints: [
    { in: "src/main/main.ts", out: "main" },
    { in: "src/preload/preload.ts", out: "preload" },
  ],
  outdir: OUTDIR,
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  // Electron is provided by the runtime; never bundle it.
  external: ["electron"],
  sourcemap: true,
  outExtension: { ".js": ".cjs" },
  logLevel: "info",
});
