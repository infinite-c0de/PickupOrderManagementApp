import { app } from "electron";
import path from "node:path";

// Compiled main lives in dist-electron/; the static renderer build sits next to
// it at dist/client (see electron-builder.yml `files`).
export const RENDERER_DIR = path.join(__dirname, "..", "dist", "client");
export const SPA_SHELL = path.join(RENDERER_DIR, "index.html");
export const PRELOAD_PATH = path.join(__dirname, "preload.cjs");

// Per-user writable location for the SQLite database, logs, and settings.
export function userDataPath(...segments: string[]): string {
  return path.join(app.getPath("userData"), ...segments);
}

export const DB_PATH = () => userDataPath("pickup-orders.db");
