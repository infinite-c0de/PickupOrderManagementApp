import type { Status } from "../types/pickup-order";

export const ORDER_STATUSES: readonly Status[] = [
  "Draft",
  "Scheduled",
  "Printed",
  "Picked Up",
  "Completed",
  "Cancelled",
] as const;
