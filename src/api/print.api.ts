import type { PickupOrder } from "@/shared/types";
import { getElectron } from "./types";

export const printApi = {
  driverTicket: (orderOrId: PickupOrder | string) => getElectron().print.driverTicket(orderOrId),
};
