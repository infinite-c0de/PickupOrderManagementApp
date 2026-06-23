import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { customers } from "@/lib/mock-data";
import { Search, Plus, Phone, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const filtered = customers.filter((c) => {
    const m = q.toLowerCase();
    return !m || c.name.toLowerCase().includes(m) || c.phone.includes(m) || c.address1.toLowerCase().includes(m);
  });

  return (
    <AppShell title="Customers" subtitle="Synced daily from QuickBooks Desktop Enterprise.">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, or address" className="pl-9" />
          </div>

          <ul className="mt-4 space-y-2 sm:hidden">
            {filtered.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium">{c.name}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{c.phone}</div>
                    {c.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{c.email}</div>}
                    <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /><span className="truncate">{c.address1}, {c.city}, {c.state} {c.zip}</span></div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{c.qbId}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">Synced {c.lastSynced}</span>
                  <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
                    <Link to="/new-pickup"><Plus className="mr-1 h-3.5 w-3.5" />Pickup Order</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">
                  {["Customer", "Phone", "Address", "Email", "QB ID", "Last Synced", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-3 font-medium">{c.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.address1}, {c.city}, {c.state} {c.zip}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{c.qbId}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{c.lastSynced}</td>
                    <td className="px-3 py-3 text-right">
                      <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
                        <Link to="/new-pickup">Create Pickup</Link>
                      </Button>
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
