import { ipcMain } from "electron";
import type { PickupOrder } from "../../shared/types";
import { printDriverTicket } from "../services/print.service";
import { pickupOrderService } from "../services/pickup-order.service";
import { CHANNELS } from "../../shared/ipc-channels";

export function registerPrintIpc(): void {
  // Accepts either a full order object or an order id (resolved from the store).
  ipcMain.handle(CHANNELS.print.driverTicket, (_e, orderOrId: PickupOrder | string) => {
    const order = typeof orderOrId === "string" ? pickupOrderService.getById(orderOrId) : orderOrId;
    if (!order) return { success: false };
    return printDriverTicket(order);
  });
}
