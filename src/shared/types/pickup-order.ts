export type Status = "Draft" | "Scheduled" | "Printed" | "Picked Up" | "Completed" | "Cancelled";
export type PaymentStatus = "Already Paid" | "Collect Cash" | "Collect Check" | "Not Paid";
export type Priority = "Normal" | "Urgent" | "VIP";
export type PickupLocation =
  | "Front Door"
  | "Back Door"
  | "Doorman"
  | "Front Desk"
  | "Garage"
  | "Side Entrance"
  | "Other";

export interface PickupOrder {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coats: number;
  pickupLocation: PickupLocation;
  instructions?: string;
  scheduledDate: string;
  scheduledTime: string;
  driver: string;
  priority: Priority;
  paymentStatus: PaymentStatus;
  amount?: number;
  paymentNotes?: string;
  internalNotes?: string;
  driverNotes?: string;
  status: Status;
  createdBy: string;
  createdAt: string;
}

// Payload accepted when creating a new pickup order (server assigns id/createdAt).
export type NewPickupOrder = Omit<PickupOrder, "id" | "createdAt" | "status"> & {
  status?: Status;
};
