import { z } from "zod";

export const customerSchema = z.object({
  id: z.string(),
  qbId: z.string(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  altPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  notes: z.string().optional(),
  lastSynced: z.string(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
