import { ipcMain } from "electron";
import { customerService } from "../services/customer.service";
import { CHANNELS } from "../../shared/ipc-channels";

export function registerCustomerIpc(): void {
  ipcMain.handle(CHANNELS.customers.list, () => customerService.list());
  ipcMain.handle(CHANNELS.customers.search, (_e, query: string) => customerService.search(query));
  ipcMain.handle(CHANNELS.customers.getById, (_e, id: string) => customerService.getById(id));
}
