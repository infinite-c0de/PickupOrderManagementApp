import type { NewPickupOrder, Status } from "@/shared/types";
import { getElectron } from "./types";

export const pickupOrderApi = {
  list: () => getElectron().pickupOrders.list(),
  search: (query: string) => getElectron().pickupOrders.search(query),
  getById: (id: string) => getElectron().pickupOrders.getById(id),
  create: (input: NewPickupOrder) => getElectron().pickupOrders.create(input),
  updateStatus: (id: string, status: Status) => getElectron().pickupOrders.updateStatus(id, status),
};
