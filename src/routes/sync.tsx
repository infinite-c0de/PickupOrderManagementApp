import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { syncHistory } from "@/lib/mock-data";
import { RefreshCw, Database, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sync")({
  head: () => ({ meta: [{ title: "Sync Status" }] }),
  component: SyncPage,
});

function SyncPage() {
  return (
    <AppShell title="Sync Status" subtitle="Customer data syncs once per day from QuickBooks Desktop Enterprise.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Last Successful Sync</div>
              <div className="mt-1 font-display text-2xl text-brand">Today · 06:00</div>
              <div className="mt-1 text-xs text-muted-foreground">1,247 customers imported</div>
            </div>
            <Badge variant="outline" className="border-[color-mix(in_oklab,var(--success)_30%,transparent)] bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)]">
              <CheckCircle2 className="mr-1 h-3 w-3" />Successful
            </Badge>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Source</div>
              <div className="mt-1 font-display text-lg">QuickBooks Desktop Enterprise</div>
              <div className="mt-1 text-xs text-muted-foreground">Local database · 3.2 MB</div>
            </div>
            <Database className="h-8 w-8 text-brand" />
          </div>
        </CardContent></Card>
      </div>

      <Card className="mt-4"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <div className="font-medium">Manual Sync</div>
          <div className="text-xs text-muted-foreground">Pull the latest customers right now.</div>
        </div>
        <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => toast.success("Sync started…")}>
          <RefreshCw className="mr-1 h-4 w-4" />Run Sync Now
        </Button>
      </CardContent></Card>

      <Card className="mt-4">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-display text-lg text-brand">Sync History</h3>
          <ul className="mt-3 space-y-2 sm:hidden">
            {syncHistory.map((s) => (
              <li key={s.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{s.datetime}</div>
                    <div className="text-xs text-muted-foreground">{s.imported} imported · {s.errors} errors</div>
                  </div>
                  <SyncBadge status={s.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.notes}</div>
              </li>
            ))}
          </ul>
          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">{["Date/Time", "Status", "Imported", "Errors", "Notes"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
              </thead>
              <tbody>
                {syncHistory.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-3">{s.datetime}</td>
                    <td className="px-3 py-3"><SyncBadge status={s.status} /></td>
                    <td className="px-3 py-3">{s.imported}</td>
                    <td className="px-3 py-3">{s.errors}</td>
                    <td className="px-3 py-3 text-muted-foreground">{s.notes}</td>
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

function SyncBadge({ status }: { status: "Successful" | "Failed" | "In Progress" }) {
  if (status === "Successful") return <Badge variant="outline" className="border-[color-mix(in_oklab,var(--success)_30%,transparent)] bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)]"><CheckCircle2 className="mr-1 h-3 w-3" />Successful</Badge>;
  if (status === "Failed") return <Badge variant="outline" className="border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] text-destructive"><AlertTriangle className="mr-1 h-3 w-3" />Failed</Badge>;
  return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />In Progress</Badge>;
}
