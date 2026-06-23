import { ipcMain } from "electron";
import type { Status } from "../../shared/types";
import { pickupOrderService } from "../services/pickup-order.service";
import { newPickupOrderSchema } from "../../shared/validators/pickup-order.validator";
import { CHANNELS } from "../../shared/ipc-channels";

export function registerPickupOrderIpc(): void {
  ipcMain.handle(CHANNELS.pickupOrders.list, () => pickupOrderService.list());
  ipcMain.handle(CHANNELS.pickupOrders.search, (_e, query: string) => pickupOrderService.search(query));
  ipcMain.handle(CHANNELS.pickupOrders.getById, (_e, id: string) => pickupOrderService.getById(id));

  ipcMain.handle(CHANNELS.pickupOrders.create, (_e, input: unknown) => {
    const parsed = newPickupOrderSchema.parse(input);
    return pickupOrderService.create(parsed);
  });

  ipcMain.handle(CHANNELS.pickupOrders.updateStatus, (_e, id: string, status: Status) =>
    pickupOrderService.updateStatus(id, status),
  );
}
