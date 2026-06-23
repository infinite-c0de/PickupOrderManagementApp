import { contextBridge, ipcRenderer } from "electron";
import { CHANNELS } from "../shared/ipc-channels";
import type {
  AppSettings,
  Customer,
  NewPickupOrder,
  PickupOrder,
  Status,
  SyncRun,
  SyncStatus,
} from "../shared/types";

// The single, controlled surface exposed to the renderer. Nothing from Node or
// Electron is leaked directly — the renderer can only call these typed methods,
// each of which maps to an ipcMain handler in the main process.
const electronApi = {
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke(CHANNELS.app.getVersion),
    ping: (): Promise<string> => ipcRenderer.invoke(CHANNELS.app.ping),
  },
  customers: {
    list: (): Promise<Customer[]> => ipcRenderer.invoke(CHANNELS.customers.list),
    search: (query: string): Promise<Customer[]> => ipcRenderer.invoke(CHANNELS.customers.search, query),
    getById: (id: string): Promise<Customer | undefined> => ipcRenderer.invoke(CHANNELS.customers.getById, id),
  },
  pickupOrders: {
    list: (): Promise<PickupOrder[]> => ipcRenderer.invoke(CHANNELS.pickupOrders.list),
    search: (query: string): Promise<PickupOrder[]> => ipcRenderer.invoke(CHANNELS.pickupOrders.search, query),
    getById: (id: string): Promise<PickupOrder | undefined> =>
      ipcRenderer.invoke(CHANNELS.pickupOrders.getById, id),
    create: (input: NewPickupOrder): Promise<PickupOrder> =>
      ipcRenderer.invoke(CHANNELS.pickupOrders.create, input),
    updateStatus: (id: string, status: Status): Promise<PickupOrder | undefined> =>
      ipcRenderer.invoke(CHANNELS.pickupOrders.updateStatus, id, status),
  },
  print: {
    driverTicket: (orderOrId: PickupOrder | string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke(CHANNELS.print.driverTicket, orderOrId),
  },
  sync: {
    run: (): Promise<SyncRun> => ipcRenderer.invoke(CHANNELS.sync.run),
    getStatus: (): Promise<SyncStatus> => ipcRenderer.invoke(CHANNELS.sync.getStatus),
    getHistory: (): Promise<SyncRun[]> => ipcRenderer.invoke(CHANNELS.sync.getHistory),
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke(CHANNELS.settings.get),
    update: (patch: Partial<AppSettings>): Promise<AppSettings> =>
      ipcRenderer.invoke(CHANNELS.settings.update, patch),
  },
};

export type ElectronApi = typeof electronApi;

contextBridge.exposeInMainWorld("electron", electronApi);
