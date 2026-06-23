import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { AppSettings } from "../../shared/types";
import { userDataPath } from "../utils/paths";
import { createLogger } from "../utils/logger";

const log = createLogger("settings");

const DEFAULTS: AppSettings = {
  companyName: "Without A Trace Inc.",
  checkPayableTo: "Without A Trace Inc.",
  syncTime: "06:00",
};

// Settings persist as plain JSON in the per-user app data directory.
const settingsFile = () => userDataPath("settings.json");

let cache: AppSettings | null = null;

export const settingsService = {
  get(): AppSettings {
    if (cache) return cache;
    try {
      const file = settingsFile();
      cache = existsSync(file)
        ? { ...DEFAULTS, ...(JSON.parse(readFileSync(file, "utf8")) as Partial<AppSettings>) }
        : { ...DEFAULTS };
    } catch (err) {
      log.error("failed to read settings, using defaults", err);
      cache = { ...DEFAULTS };
    }
    return cache;
  },

  update(patch: Partial<AppSettings>): AppSettings {
    const next = { ...this.get(), ...patch };
    try {
      writeFileSync(settingsFile(), JSON.stringify(next, null, 2), "utf8");
      cache = next;
    } catch (err) {
      log.error("failed to write settings", err);
    }
    return next;
  },
};
