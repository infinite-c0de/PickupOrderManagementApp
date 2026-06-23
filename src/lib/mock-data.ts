// Domain types now live in src/shared/types (single source of truth, shared
// with the Electron main/preload processes). Re-exported here so existing
// renderer imports from "@/lib/mock-data" keep working unchanged.
export type {
  Status,
  PaymentStatus,
  Priority,
  PickupLocation,
  Customer,
  PickupOrder,
} from "@/shared/types";

import type { Customer, PickupOrder } from "@/shared/types";

export const drivers = ["Marcus Reed", "Tony Alvarez", "Dimitri Volkov", "Jamal Foster", "Unassigned"];

export const customers: Customer[] = [
  { id: "c1", qbId: "QB-1041", name: "Jane Smith", phone: "(212) 555-0198", email: "jane@example.com", address1: "123 Park Avenue", address2: "Apt 8B", city: "New York", state: "NY", zip: "10022", notes: "Doorman building. Ask for Carlos.", lastSynced: "2025-01-15 06:00" },
  { id: "c2", qbId: "QB-1042", name: "Eleanor Whitfield", phone: "(212) 555-0144", altPhone: "(917) 555-2210", email: "eleanor@whitfield.co", address1: "455 Fifth Ave", address2: "PH-2", city: "New York", state: "NY", zip: "10016", notes: "VIP. Mink and sable only. Handle with care.", lastSynced: "2025-01-15 06:00" },
  { id: "c3", qbId: "QB-1043", name: "Robert Kensington", phone: "(646) 555-0177", email: "rkensington@mail.com", address1: "88 Greenwich St", city: "New York", state: "NY", zip: "10006", notes: "Front desk pickup, ID required.", lastSynced: "2025-01-15 06:00" },
  { id: "c4", qbId: "QB-1044", name: "Margaret O'Hara", phone: "(718) 555-0102", address1: "212 Prospect Park West", city: "Brooklyn", state: "NY", zip: "11215", notes: "Brownstone, ring twice.", lastSynced: "2025-01-15 06:00" },
  { id: "c5", qbId: "QB-1045", name: "Sophia Laurent", phone: "(212) 555-0166", email: "s.laurent@laurent.fr", address1: "1040 Madison Ave", city: "New York", state: "NY", zip: "10075", notes: "Garage entrance on 79th.", lastSynced: "2025-01-15 06:00" },
  { id: "c6", qbId: "QB-1046", name: "Harold Beckman", phone: "(212) 555-0123", address1: "9 East 96th St", city: "New York", state: "NY", zip: "10128", lastSynced: "2025-01-15 06:00" },
  { id: "c7", qbId: "QB-1047", name: "Vivian Crowe", phone: "(917) 555-0189", email: "vivian@crowe.com", address1: "350 Bleecker St", address2: "3R", city: "New York", state: "NY", zip: "10014", lastSynced: "2025-01-15 06:00" },
  { id: "c8", qbId: "QB-1048", name: "Theodore Hammond", phone: "(212) 555-0145", address1: "15 Central Park West", address2: "12A", city: "New York", state: "NY", zip: "10023", notes: "Doorman: Frank or Luis.", lastSynced: "2025-01-15 06:00" },
];

export const orders: PickupOrder[] = [
  { id: "PU-2041", customerId: "c1", customerName: "Jane Smith", phone: "(212) 555-0198", address: "123 Park Avenue, Apt 8B", city: "New York", state: "NY", zip: "10022", coats: 3, pickupLocation: "Doorman", scheduledDate: "2026-06-15", scheduledTime: "10:30", driver: "Marcus Reed", priority: "Normal", paymentStatus: "Collect Check", amount: 285, paymentNotes: "Check payable to Without A Trace Inc.", driverNotes: "Call customer when arriving. Ask doorman for garment bag.", status: "Scheduled", createdBy: "Sarah K.", createdAt: "2026-06-12 14:22" },
  { id: "PU-2042", customerId: "c2", customerName: "Eleanor Whitfield", phone: "(212) 555-0144", address: "455 Fifth Ave, PH-2", city: "New York", state: "NY", zip: "10016", coats: 5, pickupLocation: "Front Desk", scheduledDate: "2026-06-15", scheduledTime: "13:00", driver: "Tony Alvarez", priority: "VIP", paymentStatus: "Already Paid", driverNotes: "VIP customer. White glove handling. Sign garment receipt.", status: "Printed", createdBy: "Sarah K.", createdAt: "2026-06-12 09:11" },
  { id: "PU-2043", customerId: "c3", customerName: "Robert Kensington", phone: "(646) 555-0177", address: "88 Greenwich St", city: "New York", state: "NY", zip: "10006", coats: 1, pickupLocation: "Front Desk", scheduledDate: "2026-06-16", scheduledTime: "09:15", driver: "Marcus Reed", priority: "Normal", paymentStatus: "Collect Cash", amount: 95, status: "Scheduled", createdBy: "Daniel M.", createdAt: "2026-06-13 10:02" },
  { id: "PU-2044", customerId: "c4", customerName: "Margaret O'Hara", phone: "(718) 555-0102", address: "212 Prospect Park West", city: "Brooklyn", state: "NY", zip: "11215", coats: 2, pickupLocation: "Front Door", scheduledDate: "2026-06-17", scheduledTime: "11:00", driver: "Jamal Foster", priority: "Normal", paymentStatus: "Not Paid", driverNotes: "Brownstone, ring twice.", status: "Draft", createdBy: "Sarah K.", createdAt: "2026-06-13 16:40" },
  { id: "PU-2045", customerId: "c5", customerName: "Sophia Laurent", phone: "(212) 555-0166", address: "1040 Madison Ave", city: "New York", state: "NY", zip: "10075", coats: 4, pickupLocation: "Garage", scheduledDate: "2026-06-18", scheduledTime: "14:30", driver: "Dimitri Volkov", priority: "Urgent", paymentStatus: "Already Paid", driverNotes: "Use 79th St garage entrance.", status: "Scheduled", createdBy: "Daniel M.", createdAt: "2026-06-14 08:15" },
  { id: "PU-2039", customerId: "c6", customerName: "Harold Beckman", phone: "(212) 555-0123", address: "9 East 96th St", city: "New York", state: "NY", zip: "10128", coats: 1, pickupLocation: "Front Door", scheduledDate: "2026-06-10", scheduledTime: "10:00", driver: "Marcus Reed", priority: "Normal", paymentStatus: "Already Paid", status: "Completed", createdBy: "Sarah K.", createdAt: "2026-06-08 11:00" },
  { id: "PU-2040", customerId: "c7", customerName: "Vivian Crowe", phone: "(917) 555-0189", address: "350 Bleecker St, 3R", city: "New York", state: "NY", zip: "10014", coats: 2, pickupLocation: "Back Door", scheduledDate: "2026-06-11", scheduledTime: "15:45", driver: "Tony Alvarez", priority: "Normal", paymentStatus: "Collect Cash", amount: 180, status: "Picked Up", createdBy: "Daniel M.", createdAt: "2026-06-09 13:20" },
  { id: "PU-2038", customerId: "c8", customerName: "Theodore Hammond", phone: "(212) 555-0145", address: "15 Central Park West, 12A", city: "New York", state: "NY", zip: "10023", coats: 2, pickupLocation: "Doorman", scheduledDate: "2026-06-09", scheduledTime: "09:30", driver: "Jamal Foster", priority: "Normal", paymentStatus: "Already Paid", status: "Cancelled", createdBy: "Sarah K.", createdAt: "2026-06-07 10:10" },
];

export const syncHistory = [
  { id: "s1", datetime: "2026-06-15 06:00", status: "Successful" as const, imported: 1247, errors: 0, notes: "Daily scheduled sync" },
  { id: "s2", datetime: "2026-06-14 06:00", status: "Successful" as const, imported: 1245, errors: 0, notes: "Daily scheduled sync" },
  { id: "s3", datetime: "2026-06-13 06:00", status: "Successful" as const, imported: 1244, errors: 2, notes: "2 customers skipped (missing phone)" },
  { id: "s4", datetime: "2026-06-12 06:00", status: "Failed" as const, imported: 0, errors: 1, notes: "QuickBooks Desktop not running" },
  { id: "s5", datetime: "2026-06-11 06:00", status: "Successful" as const, imported: 1242, errors: 0, notes: "Daily scheduled sync" },
];

export const driverList = [
  { id: "d1", name: "Marcus Reed", active: true },
  { id: "d2", name: "Tony Alvarez", active: true },
  { id: "d3", name: "Dimitri Volkov", active: true },
  { id: "d4", name: "Jamal Foster", active: true },
  { id: "d5", name: "Pete Sullivan", active: false },
];
