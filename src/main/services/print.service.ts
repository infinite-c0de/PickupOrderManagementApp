import { BrowserWindow } from "electron";
import type { PickupOrder } from "../../shared/types";
import { settingsService } from "./settings.service";
import { createLogger } from "../utils/logger";

const log = createLogger("print");

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string | number | undefined): string {
  if (value === undefined || value === "") return "";
  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(String(value))}</td></tr>`;
}

export function buildTicketHtml(order: PickupOrder): string {
  const settings = settingsService.get();
  return `<!doctype html><html><head><meta charset="utf-8" />
  <style>
    * { font-family: Arial, Helvetica, sans-serif; }
    body { margin: 24px; color: #111; }
    h1 { font-size: 20px; margin: 0 0 2px; }
    .sub { color: #555; font-size: 12px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; width: 180px; padding: 6px 8px; vertical-align: top; color: #333; }
    td { padding: 6px 8px; border-bottom: 1px solid #eee; }
    .id { font-family: monospace; }
  </style></head><body>
    <h1>${escapeHtml(settings.companyName)} — Driver Pickup Ticket</h1>
    <div class="sub">Order <span class="id">${escapeHtml(order.id)}</span> · Created ${escapeHtml(order.createdAt)}</div>
    <table>
      ${row("Customer", order.customerName)}
      ${row("Phone", order.phone)}
      ${row("Address", [order.address, order.city, order.state, order.zip].filter(Boolean).join(", "))}
      ${row("Coats", order.coats)}
      ${row("Pickup From", order.pickupLocation)}
      ${row("Scheduled", `${order.scheduledDate} ${order.scheduledTime}`)}
      ${row("Driver", order.driver)}
      ${row("Priority", order.priority)}
      ${row("Payment", order.paymentStatus)}
      ${row("Amount", order.amount !== undefined ? `$${order.amount.toFixed(2)}` : undefined)}
      ${row("Driver Notes", order.driverNotes)}
    </table>
  </body></html>`;
}

// Renders the ticket in an offscreen window and sends it to the printer.
export async function printDriverTicket(order: PickupOrder): Promise<{ success: boolean }> {
  const html = buildTicketHtml(order);
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    const success = await new Promise<boolean>((resolve) => {
      win.webContents.print({ silent: false, printBackground: true }, (ok, reason) => {
        if (!ok) log.warn(`print not completed: ${reason}`);
        resolve(ok);
      });
    });
    return { success };
  } catch (err) {
    log.error("failed to print driver ticket", err);
    return { success: false };
  } finally {
    if (!win.isDestroyed()) win.destroy();
  }
}
