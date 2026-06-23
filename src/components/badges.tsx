import type { Status, PaymentStatus, Priority } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<Status, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  Scheduled: "bg-[color-mix(in_oklab,var(--info)_15%,transparent)] text-[var(--info)] border-[color-mix(in_oklab,var(--info)_30%,transparent)]",
  Printed: "bg-brand-soft text-brand border-brand/30",
  "Picked Up": "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[oklch(0.45_0.12_70)] border-[color-mix(in_oklab,var(--warning)_40%,transparent)]",
  Completed: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)] border-[color-mix(in_oklab,var(--success)_30%,transparent)]",
  Cancelled: "bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] text-destructive border-[color-mix(in_oklab,var(--destructive)_30%,transparent)]",
};

const paymentStyles: Record<PaymentStatus, string> = {
  "Already Paid": "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)] border-[color-mix(in_oklab,var(--success)_30%,transparent)]",
  "Collect Cash": "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[oklch(0.45_0.12_70)] border-[color-mix(in_oklab,var(--warning)_40%,transparent)]",
  "Collect Check": "bg-brand-soft text-brand border-brand/30",
  "Not Paid": "bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] text-destructive border-[color-mix(in_oklab,var(--destructive)_30%,transparent)]",
};

const priorityStyles: Record<Priority, string> = {
  Normal: "bg-muted text-muted-foreground border-border",
  Urgent: "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[oklch(0.45_0.12_70)] border-[color-mix(in_oklab,var(--warning)_40%,transparent)]",
  VIP: "bg-brand text-brand-foreground border-brand",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant="outline" className={`${statusStyles[status]} font-medium`}>{status}</Badge>;
}
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant="outline" className={`${paymentStyles[status]} font-medium`}>{status}</Badge>;
}
export function PriorityBadge({ p }: { p: Priority }) {
  return <Badge variant="outline" className={`${priorityStyles[p]} font-medium`}>{p}</Badge>;
}
