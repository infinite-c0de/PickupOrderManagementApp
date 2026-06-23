import type { SyncRun, SyncStatus } from "../../shared/types";
import { customerService } from "./customer.service";
import { createLogger } from "../utils/logger";

const log = createLogger("qb-sync");

const history: SyncRun[] = [];
let running = false;

function timestamp(): string {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

export const quickbooksSyncService = {
  // Phase 2: replace this stub with a real QuickBooks Desktop pull (qbXML / SDK)
  // that maps customers and calls customerService.upsertMany(...).
  async run(): Promise<SyncRun> {
    if (running) {
      return history[0] ?? { id: "s0", datetime: timestamp(), status: "Failed", imported: 0, errors: 1, notes: "Sync already running" };
    }
    running = true;
    log.info("starting QuickBooks sync (stub)");
    try {
      const imported = customerService.list().length;
      const run: SyncRun = {
        id: `s${history.length + 1}`,
        datetime: timestamp(),
        status: "Successful",
        imported,
        errors: 0,
        notes: "Stubbed sync (no live QuickBooks connection yet)",
      };
      history.unshift(run);
      return run;
    } finally {
      running = false;
    }
  },

  getStatus(): SyncStatus {
    return {
      lastRun: history[0],
      customerCount: customerService.list().length,
      running,
    };
  },

  getHistory(): SyncRun[] {
    return history;
  },
};
