import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { customers, drivers } from "@/lib/mock-data";
import { toast } from "sonner";
import { Snowflake, Save, Printer } from "lucide-react";

export const Route = createFileRoute("/new-pickup")({
  head: () => ({ meta: [{ title: "New Pickup Order" }] }),
  component: NewPickup,
});

function NewPickup() {
  const nav = useNavigate();
  const [customerId, setCustomerId] = useState(customers[0].id);
  const c = customers.find((x) => x.id === customerId)!;
  const [pickupFrom, setPickupFrom] = useState("Doorman");
  const [payment, setPayment] = useState("Collect Check");

  const handleSave = (print: boolean) => {
    toast.success(print ? "Order saved. Opening ticket…" : "Pickup order saved.");
    setTimeout(() => nav({ to: "/pickups" }), 600);
  };

  return (
    <AppShell title="Cleaning Pickup Order" subtitle="Create a new pickup for a driver.">
      <Card>
        <CardContent className="p-5 sm:p-6">
          <SectionHeader title="Customer & Pickup Information" hint="Customer data can be selected or refreshed from QuickBooks. Fields marked with * are required." />

          <div className="grid gap-4">
            <Field label="Customer Name" required>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {customers.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Address" required>
              <Input defaultValue={c.address1} key={c.id + "a1"} />
              <Input defaultValue={c.address2 ?? ""} placeholder="Apt / Suite (optional)" className="mt-2" key={c.id + "a2"} />
              <div className="mt-2 grid grid-cols-[1fr_80px_110px] gap-2">
                <Input defaultValue={c.city} key={c.id + "city"} />
                <Input defaultValue={c.state} key={c.id + "state"} />
                <Input defaultValue={c.zip} key={c.id + "zip"} />
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" required>
                <Input defaultValue={c.phone} key={c.id + "ph"} />
              </Field>
              <Field label="Alternate Phone" hint="optional">
                <Input defaultValue={c.altPhone ?? ""} key={c.id + "ap"} placeholder="(___) ___-____" />
              </Field>
            </div>

            <Field label="Email" hint="optional">
              <Input type="email" defaultValue={c.email ?? ""} key={c.id + "em"} />
            </Field>

            <SectionHeader title="Pickup Details" className="mt-3" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Number of Coats" required>
                <Input type="number" min={1} defaultValue={3} />
              </Field>
              <Field label="Date of Pickup" required>
                <Input type="date" defaultValue="2026-06-15" />
              </Field>
              <Field label="Scheduled Time" required>
                <Input type="time" defaultValue="10:30" />
              </Field>
              <Field label="Driver">
                <Select defaultValue="Marcus Reed">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{drivers.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Pickup From Where?" required>
              <div className="overflow-hidden rounded-lg border border-border">
                <RadioGroup value={pickupFrom} onValueChange={setPickupFrom}>
                  {["Doorman", "Front Desk", "Front Door", "Back Door", "Garage", "Side Entrance", "Other"].map((opt, i) => (
                    <label key={opt} className={`flex cursor-pointer items-center gap-3 px-3 py-3 text-sm ${i > 0 ? "border-t border-border" : ""} ${pickupFrom === opt ? "bg-brand-soft/40" : ""}`}>
                      <RadioGroupItem value={opt} className="border-brand text-brand" />
                      <span className="font-medium">{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </Field>

            <Field label="Additional Pickup Instructions" hint="optional">
              <Textarea rows={2} placeholder="e.g. Use service elevator, leave with concierge..." />
            </Field>

            <Field label="Priority">
              <Select defaultValue="Normal">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <SectionHeader title="Payment" className="mt-3" />

            <Field label="Payment Method" required>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: "Collect Check", l: "Paid / Pickup a Check" },
                  { v: "Not Paid", l: "Not Paid" },
                  { v: "Already Paid", l: "Already Paid" },
                  { v: "Collect Cash", l: "Collect Cash" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setPayment(o.v)}
                    className={`rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors ${
                      payment === o.v ? "border-brand bg-brand-soft/60 text-brand" : "border-border hover:bg-muted"
                    }`}
                  >
                    <span className={`mr-2 inline-block h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-card ${payment === o.v ? "bg-brand ring-brand" : "bg-transparent ring-muted-foreground/40"}`} />
                    {o.l}
                  </button>
                ))}
              </div>
              {payment === "Collect Check" && <p className="mt-2 text-xs text-muted-foreground">Check will be collected at time of pickup.</p>}
            </Field>

            {(payment === "Collect Cash" || payment === "Collect Check") && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount to Collect">
                  <Input type="number" step="0.01" placeholder="0.00" />
                </Field>
                <Field label="Check Payable To">
                  <Input defaultValue="Without A Trace Inc." />
                </Field>
              </div>
            )}

            <SectionHeader title="Notes" className="mt-3" />

            <Field label="Internal Notes" hint="for clerk only">
              <Textarea rows={2} placeholder="Notes not shown to driver" />
            </Field>

            <Field label="Driver Notes" hint="printed on ticket">
              <Textarea rows={3} defaultValue="Call customer when arriving. Ask doorman for garment bag." />
            </Field>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" asChild><Link to="/">Cancel</Link></Button>
            <Button variant="outline" onClick={() => handleSave(false)}><Save className="mr-1 h-4 w-4" />Save Order</Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => handleSave(true)}>
              <Printer className="mr-1 h-4 w-4" />Save & Print Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function SectionHeader({ title, hint, className }: { title: string; hint?: string; className?: string }) {
  return (
    <div className={`mb-4 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-brand text-brand-foreground">
          <Snowflake className="h-3.5 w-3.5" />
        </div>
        <h2 className="font-display text-lg text-foreground">{title}</h2>
      </div>
      {hint && <p className="mt-1 text-xs text-brand/80">{hint}</p>}
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-semibold">
        {label}{required && <span className="text-destructive"> *</span>}
        {hint && <span className="ml-1 font-normal text-muted-foreground">({hint})</span>}
      </Label>
      {children}
    </div>
  );
}
