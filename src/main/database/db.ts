import { DB_PATH } from "../utils/paths";
import { createLogger } from "../utils/logger";

const log = createLogger("database");

// --- Phase 1 wiring guide -------------------------------------------------
// This is a scaffold. To enable persistent storage:
//   1. `npm i better-sqlite3` and add an electron-builder rebuild step
//      (better-sqlite3 is a native module and must be rebuilt for Electron).
//   2. Replace the body of `getDatabase()` with:
//        import Database from "better-sqlite3";
//        db = new Database(DB_PATH());
//        db.pragma("journal_mode = WAL");
//        db.exec(readFileSync(join(__dirname, "schema.sql"), "utf8"));
//   3. Point the services in src/main/services at this database instead of
//      their in-memory seed data.
// Until then the services run fully in-memory so the app works end-to-end.
// -------------------------------------------------------------------------

let initialized = false;

export function initDatabase(): void {
  if (initialized) return;
  initialized = true;
  log.info(`database path (Phase 1): ${DB_PATH()}`);
  log.info("using in-memory stores; SQLite not yet wired (see db.ts)");
}

export function getDatabase(): never {
  throw new Error("SQLite backend not enabled yet — see src/main/database/db.ts");
}
