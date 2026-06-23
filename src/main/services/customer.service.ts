import type { Customer } from "../../shared/types";

// In-memory seed. Replace with SQLite-backed queries (see database/db.ts) and
// populate via the QuickBooks daily sync in Phase 1/2.
const customers: Customer[] = [
  {
    id: "c1",
    qbId: "QB-1041",
    name: "Jane Smith",
    phone: "(212) 555-0198",
    email: "jane@example.com",
    address1: "123 Park Avenue",
    address2: "Apt 8B",
    city: "New York",
    state: "NY",
    zip: "10022",
    notes: "Doorman building. Ask for Carlos.",
    lastSynced: "2025-01-15 06:00",
  },
  {
    id: "c2",
    qbId: "QB-1042",
    name: "Eleanor Whitfield",
    phone: "(212) 555-0144",
    altPhone: "(917) 555-2210",
    email: "eleanor@whitfield.co",
    address1: "455 Fifth Ave",
    address2: "PH-2",
    city: "New York",
    state: "NY",
    zip: "10016",
    notes: "VIP. Mink and sable only. Handle with care.",
    lastSynced: "2025-01-15 06:00",
  },
];

export const customerService = {
  list(): Customer[] {
    return customers;
  },

  search(query: string): Customer[] {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")),
    );
  },

  getById(id: string): Customer | undefined {
    return customers.find((c) => c.id === id);
  },

  /** Used by the QuickBooks sync to upsert imported customers. */
  upsertMany(incoming: Customer[]): number {
    for (const next of incoming) {
      const idx = customers.findIndex((c) => c.id === next.id);
      if (idx >= 0) customers[idx] = next;
      else customers.push(next);
    }
    return incoming.length;
  },
};
