import { app, ipcMain } from "electron";
import type { AppSettings } from "../../shared/types";
import { settingsService } from "../services/settings.service";
import { CHANNELS } from "../../shared/ipc-channels";
import { registerCustomerIpc } from "./customer.ipc";
import { registerPickupOrderIpc } from "./pickup-order.ipc";
import { registerPrintIpc } from "./print.ipc";
import { registerSyncIpc } from "./sync.ipc";

export function registerIpcHandlers(): void {
  ipcMain.handle(CHANNELS.app.getVersion, () => app.getVersion());
  ipcMain.handle(CHANNELS.app.ping, () => "pong");

  ipcMain.handle(CHANNELS.settings.get, () => settingsService.get());
  ipcMain.handle(CHANNELS.settings.update, (_e, patch: Partial<AppSettings>) => settingsService.update(patch));

  registerCustomerIpc();
  registerPickupOrderIpc();
  registerPrintIpc();
  registerSyncIpc();
}
