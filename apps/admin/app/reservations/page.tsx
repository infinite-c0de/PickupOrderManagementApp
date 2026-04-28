"use client"

import { useEffect, useMemo, useState } from "react"
import {
  getAdminReservations,
  markGoalFulfillmentFailed,
  updateAdminReservation,
  type AdminReservation,
} from "@/lib/admin-api"

export default function AdminReservationsPage() {
  const [rows, setRows] = useState<AdminReservation[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        setRows(await getAdminReservations())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load reservations.")
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return rows
      .filter((r) => {
        if (!q) return true
        return (
          r.user.email.toLowerCase().includes(q) ||
          r.goal.productName.toLowerCase().includes(q) ||
          r.preferredTiming.toLowerCase().includes(q)
        )
      })
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
  }, [rows, search, statusFilter])

  async function setStatus(row: AdminReservation, status: "new" | "contacted" | "processing" | "fulfilled" | "cancelled") {
    setUpdatingId(row.id)
    setError("")
    try {
      const res = await updateAdminReservation(row.id, { status })
      setRows((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, status: res.status, updatedAt: res.updatedAt } : item)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update reservation.")
    } finally {
      setUpdatingId("")
    }
  }

  async function failAndRefund(row: AdminReservation) {
    if (!["completed", "unlocked"].includes(row.goal.status)) return
    if (!window.confirm(`Mark fulfillment failed for ${row.goal.productName}?`)) return
    setUpdatingId(row.id)
    setError("")
    try {
      const res = await markGoalFulfillmentFailed(row.goal.id)
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                goal: {
                  ...item.goal,
                  status: res.goal.status,
                  refundedAmount: res.goal.refundedAmount,
                  retailerPaymentStatus: res.goal.retailerPaymentStatus,
                },
              }
            : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process refund flow.")
    } finally {
      setUpdatingId("")
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Reservations</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Manage reservation intents and fulfillment states.</p>
      {error ? (
        <div style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 12 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user, product, timing"
          style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", minWidth: 170 }}
        >
          {["all", "new", "contacted", "processing", "fulfilled", "cancelled"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 1180, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["User", "Product", "Status", "Goal", "Timing", "Budget", "Created", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.user.email}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.goal.productName}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.status}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  {r.goal.status} ({r.goal.retailerPaymentStatus})
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.preferredTiming}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>${Number(r.budgetConfirmation).toFixed(2)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{new Date(r.createdAt).toLocaleString()}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={() => void setStatus(r, "contacted")} disabled={updatingId === r.id}>Contacted</button>
                    <button onClick={() => void setStatus(r, "processing")} disabled={updatingId === r.id}>Processing</button>
                    <button onClick={() => void setStatus(r, "fulfilled")} disabled={updatingId === r.id}>Fulfilled</button>
                    <button onClick={() => void failAndRefund(r)} disabled={updatingId === r.id}>Fail & Refund</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 16, color: "#64748b" }}>No reservations found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
