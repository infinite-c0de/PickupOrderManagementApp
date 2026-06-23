import type {
  AppSettings,
  Customer,
  NewPickupOrder,
  PickupOrder,
  Status,
  SyncRun,
  SyncStatus,
} from "@/shared/types";

// Mirror of the API exposed by the preload bridge (src/preload/preload.ts).
// Declared on the renderer side so the two processes stay decoupled.
export interface ElectronApi {
  app: {
    getVersion(): Promise<string>;
    ping(): Promise<string>;
  };
  customers: {
    list(): Promise<Customer[]>;
    search(query: string): Promise<Customer[]>;
    getById(id: string): Promise<Customer | undefined>;
  };
  pickupOrders: {
    list(): Promise<PickupOrder[]>;
    search(query: string): Promise<PickupOrder[]>;
    getById(id: string): Promise<PickupOrder | undefined>;
    create(input: NewPickupOrder): Promise<PickupOrder>;
    updateStatus(id: string, status: Status): Promise<PickupOrder | undefined>;
  };
  print: {
    driverTicket(orderOrId: PickupOrder | string): Promise<{ success: boolean }>;
  };
  sync: {
    run(): Promise<SyncRun>;
    getStatus(): Promise<SyncStatus>;
    getHistory(): Promise<SyncRun[]>;
  };
  settings: {
    get(): Promise<AppSettings>;
    update(patch: Partial<AppSettings>): Promise<AppSettings>;
  };
}

declare global {
  interface Window {
    electron?: ElectronApi;
  }
}

// Returns the preload-exposed API, or throws if not running inside Electron
// (e.g. the plain web build). Use this from the *.api.ts wrappers.
export function getElectron(): ElectronApi {
  if (typeof window === "undefined" || !window.electron) {
    throw new Error("window.electron is unavailable — not running inside the Electron desktop app");
  }
  return window.electron;
}

export function isElectron(): boolean {
  return typeof window !== "undefined" && !!window.electron;
}
