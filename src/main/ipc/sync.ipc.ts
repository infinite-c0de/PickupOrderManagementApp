import { ipcMain } from "electron";
import { quickbooksSyncService } from "../services/quickbooks-sync.service";
import { CHANNELS } from "../../shared/ipc-channels";

export function registerSyncIpc(): void {
  ipcMain.handle(CHANNELS.sync.run, () => quickbooksSyncService.run());
  ipcMain.handle(CHANNELS.sync.getStatus, () => quickbooksSyncService.getStatus());
  ipcMain.handle(CHANNELS.sync.getHistory, () => quickbooksSyncService.getHistory());
}
