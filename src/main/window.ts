import { app, BrowserWindow, protocol, shell, session } from "electron";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { RENDERER_DIR, SPA_SHELL, PRELOAD_PATH } from "./utils/paths";

// In dev the renderer is served by the Vite dev server; in production it is the
// static SPA bundle loaded through our custom `app://` protocol.
// ELECTRON_FORCE_PROD lets us exercise the production path from an unpackaged run.
export const isDev = !app.isPackaged && process.env.ELECTRON_FORCE_PROD !== "1";
const DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL ?? "http://localhost:8080";

// Headless smoke test: load the renderer, report success/failure, then exit.
const isSmokeTest = process.env.ELECTRON_SMOKE === "1";

const APP_SCHEME = "app";
const APP_ORIGIN = `${APP_SCHEME}://app`;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".txt": "text/plain",
};

function contentTypeFor(filePath: string): string {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

// Serves the static SPA bundle. Real files (e.g. /assets/*.js) are returned
// directly; any path without a matching file falls back to the SPA shell so
// client-side routing (TanStack Router) works on hard navigations/reloads.
async function serveStaticFile(requestUrl: string): Promise<Response> {
  const { pathname } = new URL(requestUrl);
  const decodedPath = decodeURIComponent(pathname);
  const candidate = path.normalize(path.join(RENDERER_DIR, decodedPath));

  if (!candidate.startsWith(RENDERER_DIR)) {
    return new Response("Forbidden", { status: 403 });
  }

  const hasExtension = path.extname(candidate) !== "";
  const target = !hasExtension || !existsSync(candidate) ? SPA_SHELL : candidate;

  try {
    const data = await readFile(target);
    return new Response(data, { headers: { "content-type": contentTypeFor(target) } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

// Must run before app `ready`.
export function registerAppProtocolSchemes(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEME,
      privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
    },
  ]);
}

export function registerAppProtocol(): void {
  protocol.handle(APP_SCHEME, (request) => serveStaticFile(request.url));
}

export function applyProductionCsp(): void {
  // Dev relies on the Vite dev server + websockets for HMR, so we only lock down
  // the packaged app. Fonts are loaded from Google Fonts by the root route.
  if (isDev) return;
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          [
            "default-src 'self' app:",
            "script-src 'self' app: 'unsafe-inline'",
            "style-src 'self' app: 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' app: https://fonts.gstatic.com data:",
            "img-src 'self' app: data: blob:",
            "connect-src 'self' app:",
          ].join("; "),
        ],
      },
    });
  });
}

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: "#ffffff",
    title: "Pickup Order App",
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  win.once("ready-to-show", () => win.show());

  if (isSmokeTest) {
    win.webContents.on("did-finish-load", () => {
      console.log("[smoke] renderer loaded OK");
      app.exit(0);
    });
    win.webContents.on("did-fail-load", (_e, code, desc, url) => {
      console.error(`[smoke] renderer failed to load: ${code} ${desc} ${url}`);
      app.exit(1);
    });
  }

  // Open external links in the user's default browser, never in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Block in-window navigation to anything that isn't our own app origin.
  win.webContents.on("will-navigate", (event, url) => {
    const allowed = isDev ? DEV_SERVER_URL : APP_ORIGIN;
    if (!url.startsWith(allowed)) {
      event.preventDefault();
      if (url.startsWith("http://") || url.startsWith("https://")) shell.openExternal(url);
    }
  });

  if (isDev) {
    win.loadURL(DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadURL(`${APP_ORIGIN}/`);
  }

  return win;
}
