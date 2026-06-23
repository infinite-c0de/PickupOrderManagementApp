import { context } from "esbuild";
import { spawn } from "node:child_process";
import electronPath from "electron";
import http from "node:http";

const DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL ?? "http://127.0.0.1:8080";

let electronProc = null;
let viteProc = null;
let shuttingDown = false;

function startElectron() {
  if (electronProc) {
    electronProc.removeAllListeners("exit");
    electronProc.kill();
  }
  electronProc = spawn(electronPath, ["."], {
    stdio: "inherit",
    env: { ...process.env, ELECTRON_RENDERER_URL: DEV_SERVER_URL, NODE_ENV: "development" },
  });
  electronProc.on("exit", () => {
    if (!shuttingDown) shutdown(0);
  });
}

function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.destroy();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`Timed out waiting for ${url}`));
        else setTimeout(attempt, 300);
      });
    };
    attempt();
  });
}

function shutdown(code) {
  shuttingDown = true;
  try {
    electronProc?.kill();
  } catch {}
  try {
    viteProc?.kill();
  } catch {}
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

let started = false;

const ctx = await context({
  entryPoints: [
    { in: "src/main/main.ts", out: "main" },
    { in: "src/preload/preload.ts", out: "preload" },
  ],
  outdir: "dist-electron",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  external: ["electron"],
  sourcemap: true,
  outExtension: { ".js": ".cjs" },
  plugins: [
    {
      name: "restart-electron",
      setup(b) {
        b.onEnd((result) => {
          if (result.errors.length > 0) {
            console.error("[electron] main/preload build failed");
            return;
          }
          if (started) {
            console.log("[electron] main/preload changed, restarting...");
            startElectron();
          }
        });
      },
    },
  ],
});

await ctx.rebuild();
await ctx.watch();

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
viteProc = spawn(npmCmd, ["run", "dev:renderer"], { stdio: "inherit", shell: true, env: { ...process.env } });

console.log(`[electron] waiting for renderer at ${DEV_SERVER_URL} ...`);
await waitForServer(DEV_SERVER_URL);

started = true;
startElectron();
