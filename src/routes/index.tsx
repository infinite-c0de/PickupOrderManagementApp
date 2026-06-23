import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PaymentBadge } from "@/components/badges";
import { orders } from "@/lib/mock-data";
import { CalendarClock, CalendarDays, Printer, CheckCircle2, RefreshCw, Eye, Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard · Pickup Order App" }] }),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint?: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 font-display text-2xl text-brand">{value}</div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const upcoming = orders.filter((o) => ["Scheduled", "Printed", "Draft"].includes(o.status)).slice(0, 6);
  return (
    <AppShell
      title="Dashboard"
      subtitle="Today's pickups and operations at a glance."
      actions={
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link to="/new-pickup"><Plus className="mr-1 h-4 w-4" />New Pickup Order</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat icon={CalendarClock} label="Today's Pickups" value="4" hint="2 still scheduled" />
        <Stat icon={CalendarDays} label="This Week" value="12" hint="Mon – Sun" />
        <Stat icon={Printer} label="Pending Tickets" value="3" hint="Awaiting print" />
        <Stat icon={CheckCircle2} label="Completed" value="38" hint="Last 30 days" />
        <Stat icon={RefreshCw} label="Last QB Sync" value="06:00" hint="Today · 1,247 customers" />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="font-display text-lg text-brand">Upcoming Pickups</CardTitle>
          <Button asChild variant="ghost" size="sm"><Link to="/pickups">View all</Link></Button>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {/* Mobile cards */}
          <ul className="space-y-2 px-4 sm:hidden">
            {upcoming.map((o) => (
              <li key={o.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{o.id}</div>
                    <div className="truncate font-medium">{o.customerName}</div>
                    <div className="truncate text-xs text-muted-foreground">{o.address}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <div className="text-muted-foreground">{o.scheduledDate} · {o.scheduledTime}</div>
                  <PaymentBadge status={o.paymentStatus} />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1"><Link to="/pickups/$id" params={{ id: o.id }}><Eye className="mr-1 h-3.5 w-3.5" />View</Link></Button>
                  <Button asChild size="sm" className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"><Link to="/pickups/$id" params={{ id: o.id }}><Printer className="mr-1 h-3.5 w-3.5" />Ticket</Link></Button>
                </div>
              </li>
            ))}
          </ul>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2">ID</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Address</th><th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Payment</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-3 py-3 font-medium">{o.customerName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{o.phone}</td>
                    <td className="px-3 py-3 text-muted-foreground">{o.address}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{o.scheduledDate} · {o.scheduledTime}</td>
                    <td className="px-3 py-3"><PaymentBadge status={o.paymentStatus} /></td>
                    <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-3 py-3 text-right">
                      <Button asChild size="sm" variant="ghost"><Link to="/pickups/$id" params={{ id: o.id }}>View</Link></Button>
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
