import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { orders } from "@/lib/mock-data";
import { Heart, MapPin, Phone, Mail, Hourglass, Calendar, Target, DollarSign, FileText, Printer, Download, ArrowLeft, CheckCircle2, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pickups/$id")({
  head: ({ params }) => ({ meta: [{ title: `Ticket ${params.id}` }] }),
  notFoundComponent: () => <AppShell title="Not found"><p className="text-muted-foreground">Order not found.</p></AppShell>,
  component: TicketView,
});

function TicketView() {
  const { id } = Route.useParams();
  const router = useRouter();
  const o = orders.find((x) => x.id === id);
  if (!o) return <AppShell title="Not found"><p className="text-muted-foreground">Order {id} not found.</p></AppShell>;

  return (
    <AppShell title="Driver Pickup Ticket" subtitle={`Order ${o.id}`}>
      <div className="no-print mb-3 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.history.back()}><ArrowLeft className="mr-1 h-4 w-4" />Back</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Marked as Picked Up")}><Truck className="mr-1 h-4 w-4" />Mark Picked Up</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Marked as Completed")}><CheckCircle2 className="mr-1 h-4 w-4" />Complete</Button>
        <Button size="sm" variant="outline" className="text-destructive" onClick={() => toast.error("Order cancelled")}><XCircle className="mr-1 h-4 w-4" />Cancel</Button>
      </div>

      <Card className="print-area mx-auto max-w-xl overflow-hidden bg-card shadow-lg">
        <CardContent className="px-6 py-7 sm:px-10 sm:py-10">
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">Pickup / Delivery Ticket</div>
            <h2 className="font-display mt-3 text-4xl text-brand sm:text-5xl">Without A Trace</h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-border" />
              <span className="text-brand">◆</span>
              <span className="h-px w-16 bg-border" />
            </div>
          </div>

          <dl className="mt-6 divide-y divide-border">
            <Row icon={Heart} label="Customer Name" value={o.customerName} />
            <Row icon={MapPin} label="Address" value={<>
              {o.address}<br />{o.city}, {o.state} {o.zip}
            </>} />
            <div className="grid grid-cols-2 gap-4 py-3">
              <Mini icon={Phone} label="Phone" value={o.phone} />
              <Mini icon={Mail} label="Order ID" value={o.id} />
            </div>
            <Row icon={Hourglass} label="Number of Coats" value={String(o.coats)} />
            <Row icon={Calendar} label="Date of Pickup" value={`${o.scheduledDate} · ${o.scheduledTime}`} />
            <Row icon={Target} label="Pickup From Where?" value={o.pickupLocation} />
            <Row icon={DollarSign} label="Payment Method" value={<>
              {o.paymentStatus}
              {o.amount && <div className="mt-1 text-xs text-muted-foreground">Collect ${o.amount.toFixed(2)}</div>}
              {o.paymentStatus === "Collect Check" && <div className="mt-1 text-xs text-muted-foreground">Check will be collected at time of pickup.</div>}
            </>} />
            {o.driverNotes && <Row icon={FileText} label="Notes" value={o.driverNotes} />}
          </dl>

          <div className="mt-8 rounded-lg border border-brand/30 bg-brand-soft/40 px-5 py-4 text-center">
            <p className="font-display text-base text-brand">Thank you for choosing<br />Without A Trace.</p>
            <p className="mt-1 text-xs text-muted-foreground">We appreciate your business.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
            <SigLine label="Driver Signature" />
            <SigLine label="Driver Name" />
            <SigLine label="Date Completed" />
          </div>
        </CardContent>
      </Card>

      <div className="no-print mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" />Print Ticket
        </Button>
        <Button variant="outline" onClick={() => toast("PDF download coming soon")}>
          <Download className="mr-1 h-4 w-4" />Download PDF
        </Button>
      </div>
    </AppShell>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}
function Mini({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
function SigLine({ label }: { label: string }) {
  return (
    <div>
      <div className="h-8 border-b border-foreground/60" />
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
