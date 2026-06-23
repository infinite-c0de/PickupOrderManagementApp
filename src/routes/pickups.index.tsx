import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orders, type Status } from "@/lib/mock-data";
import { StatusBadge, PaymentBadge, PriorityBadge } from "@/components/badges";
import { Search, Eye, Printer, Pencil } from "lucide-react";

export const Route = createFileRoute("/pickups/")({
  head: () => ({ meta: [{ title: "Pickup Log" }] }),
  component: PickupLog,
});

function PickupLog() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const filtered = orders.filter((o) => {
    const m = q.toLowerCase();
    const matchQ = !m || o.customerName.toLowerCase().includes(m) || o.phone.includes(m) || o.id.toLowerCase().includes(m);
    const matchS = status === "all" || o.status === (status as Status);
    return matchQ && matchS;
  });

  return (
    <AppShell title="Pickup Log" subtitle="Search and review all pickup orders.">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-[1fr_180px_180px_140px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, or order ID" className="pl-9" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["Draft", "Scheduled", "Printed", "Picked Up", "Completed", "Cancelled"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" />
            <Button variant="outline">More filters</Button>
          </div>

          {/* Mobile cards */}
          <ul className="mt-4 space-y-2 sm:hidden">
            {filtered.map((o) => (
              <li key={o.id}>
                <Link to="/pickups/$id" params={{ id: o.id }} className="block rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono text-muted-foreground">{o.id}</div>
                      <div className="truncate font-medium">{o.customerName}</div>
                      <div className="truncate text-xs text-muted-foreground">{o.phone} · {o.coats} coats</div>
                      <div className="truncate text-xs text-muted-foreground">{o.address}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={o.status} />
                      <PaymentBadge status={o.paymentStatus} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{o.scheduledDate} · {o.scheduledTime}</span>
                    <span className="text-muted-foreground">{o.driver}</span>
                  </div>
                </Link>
              </li>
            ))}
            {filtered.length === 0 && <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No orders match your filters.</li>}
          </ul>

          {/* Desktop table */}
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">
                  {["Order", "Customer", "Phone", "Address", "When", "Coats", "Payment", "Driver", "Priority", "Status", ""].map((h) => (
                    <th key={h} className="px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-3 py-3 font-medium">{o.customerName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{o.phone}</td>
                    <td className="px-3 py-3 text-muted-foreground">{o.address}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{o.scheduledDate} · {o.scheduledTime}</td>
                    <td className="px-3 py-3">{o.coats}</td>
                    <td className="px-3 py-3"><PaymentBadge status={o.paymentStatus} /></td>
                    <td className="px-3 py-3 text-muted-foreground">{o.driver}</td>
                    <td className="px-3 py-3"><PriorityBadge p={o.priority} /></td>
                    <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild size="icon" variant="ghost"><Link to="/pickups/$id" params={{ id: o.id }}><Eye className="h-4 w-4" /></Link></Button>
                        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                        <Button asChild size="icon" variant="ghost"><Link to="/pickups/$id" params={{ id: o.id }}><Printer className="h-4 w-4" /></Link></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
