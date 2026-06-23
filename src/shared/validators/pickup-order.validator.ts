import { z } from "zod";

const statusSchema = z.enum([
  "Draft",
  "Scheduled",
  "Printed",
  "Picked Up",
  "Completed",
  "Cancelled",
]);
const paymentStatusSchema = z.enum(["Already Paid", "Collect Cash", "Collect Check", "Not Paid"]);
const prioritySchema = z.enum(["Normal", "Urgent", "VIP"]);
const pickupLocationSchema = z.enum([
  "Front Door",
  "Back Door",
  "Doorman",
  "Front Desk",
  "Garage",
  "Side Entrance",
  "Other",
]);

// Validates the payload used to create a pickup order. id/createdAt/status are
// assigned by the main process, so they are not required here.
export const newPickupOrderSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  coats: z.number().int().min(1, "At least one coat is required"),
  pickupLocation: pickupLocationSchema,
  instructions: z.string().optional(),
  scheduledDate: z.string().min(1, "Pickup date is required"),
  scheduledTime: z.string().min(1, "Scheduled time is required"),
  driver: z.string(),
  priority: prioritySchema,
  paymentStatus: paymentStatusSchema,
  amount: z.number().nonnegative().optional(),
  paymentNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  driverNotes: z.string().optional(),
  createdBy: z.string(),
  status: statusSchema.optional(),
});

export type NewPickupOrderInput = z.infer<typeof newPickupOrderSchema>;
