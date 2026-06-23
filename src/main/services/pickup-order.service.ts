import type { NewPickupOrder, PickupOrder, Status } from "../../shared/types";

// In-memory store. Replace with SQLite-backed queries (see database/db.ts).
const orders: PickupOrder[] = [];
let seq = 2046;

function nextId(): string {
  return `PU-${seq++}`;
}

export const pickupOrderService = {
  list(): PickupOrder[] {
    return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getById(id: string): PickupOrder | undefined {
    return orders.find((o) => o.id === id);
  },

  search(query: string): PickupOrder[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.list();
    return this.list().filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        o.id.toLowerCase().includes(q),
    );
  },

  create(input: NewPickupOrder): PickupOrder {
    const order: PickupOrder = {
      ...input,
      id: nextId(),
      status: input.status ?? "Scheduled",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    orders.push(order);
    return order;
  },

  updateStatus(id: string, status: Status): PickupOrder | undefined {
    const order = orders.find((o) => o.id === id);
    if (order) order.status = status;
    return order;
  },
};
