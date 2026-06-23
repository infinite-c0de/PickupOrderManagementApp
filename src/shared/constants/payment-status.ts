import type { PaymentStatus } from "../types/pickup-order";

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  "Already Paid",
  "Collect Cash",
  "Collect Check",
  "Not Paid",
] as const;
