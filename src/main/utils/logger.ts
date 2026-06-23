type Level = "info" | "warn" | "error";

function emit(level: Level, scope: string, args: unknown[]) {
  const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${scope}]`;
  // eslint-disable-next-line no-console
  console[level](prefix, ...args);
}

// Minimal namespaced logger for the main process. Swap the `emit` sink for a
// file-based logger (e.g. into userDataPath('logs')) when needed.
export function createLogger(scope: string) {
  return {
    info: (...args: unknown[]) => emit("info", scope, args),
    warn: (...args: unknown[]) => emit("warn", scope, args),
    error: (...args: unknown[]) => emit("error", scope, args),
  };
}

export type Logger = ReturnType<typeof createLogger>;
