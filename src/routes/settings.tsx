import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { driverList } from "@/lib/mock-data";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Business, printing, sync, and driver configuration.">
      <div className="space-y-4">
        <Section title="Business Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business Name"><Input defaultValue="Without A Trace Inc." /></Field>
            <Field label="Business Phone"><Input defaultValue="(212) 555-0100" /></Field>
            <Field label="Business Address" className="sm:col-span-2"><Input defaultValue="220 W 37th St, New York, NY 10018" /></Field>
          </div>
        </Section>

        <Section title="Print Settings">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Default Printer">
              <Select defaultValue="hp-laserjet">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hp-laserjet">HP LaserJet (Front)</SelectItem>
                  <SelectItem value="brother">Brother HL-L2350DW</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Ticket Format">
              <Select defaultValue="letter">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">US Letter</SelectItem>
                  <SelectItem value="receipt">3" Receipt</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Copies"><Input type="number" defaultValue={2} min={1} /></Field>
          </div>
        </Section>

        <Section title="QuickBooks Sync">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Sync Frequency">
              <Select defaultValue="daily" disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="daily">Daily (06:00)</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Last Sync"><Input readOnly defaultValue="2026-06-15 06:00" /></Field>
            <Field label="Data Source"><Input readOnly defaultValue="\\\\QB-SERVER\\Company.QBW" /></Field>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Live invoice writing & payment recording — <Badge variant="outline" className="ml-1">Coming in Phase 2</Badge>
          </div>
        </Section>

        <Section title="Driver List">
          <ul className="divide-y divide-border rounded-lg border border-border">
            {driverList.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-3">
                <div>
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.active ? "Active" : "Inactive"}</div>
                </div>
                <Switch defaultChecked={d.active} />
              </li>
            ))}
          </ul>
          <Button variant="outline" className="mt-3" onClick={() => toast("Driver added")}>+ Add Driver</Button>
        </Section>

        <div className="flex justify-end">
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => toast.success("Settings saved")}>Save Settings</Button>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card><CardContent className="p-5 sm:p-6">
      <h3 className="font-display text-lg text-brand">{title}</h3>
      <div className="mt-4">{children}</div>
    </CardContent></Card>
  );
}
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm font-semibold">{label}</Label>
      {children}
    </div>
  );
}
