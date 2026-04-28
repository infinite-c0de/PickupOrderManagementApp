"use client"

import { useEffect, useState } from "react"
import { getAdminFunnel, getAdminGoals, type AdminFunnel, type AdminGoal } from "@/lib/admin-api"

export default function AdminGoalsPage() {
  const [funnel, setFunnel] = useState<AdminFunnel | null>(null)
  const [goals, setGoals] = useState<AdminGoal[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        setError("")
        const [funnelRes, goalsRes] = await Promise.all([getAdminFunnel(), getAdminGoals()])
        setFunnel(funnelRes)
        setGoals(goalsRes)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load goals analytics.")
      }
    })()
  }, [])

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Goal Analytics</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Migrated baseline for admin goals and funnel metrics.</p>
      {error ? (
        <div style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 12 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginBottom: 14 }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Goal Creation Rate</div>
          <div style={{ fontWeight: 700, fontSize: 24 }}>{funnel?.goalCreationRate ?? 0}/mo</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Completion Rate</div>
          <div style={{ fontWeight: 700, fontSize: 24 }}>{funnel?.goalCompletionRate ?? 0}%</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Unlock Rate</div>
          <div style={{ fontWeight: 700, fontSize: 24 }}>{funnel?.unlockRate ?? 0}%</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Reservation Rate</div>
          <div style={{ fontWeight: 700, fontSize: 24 }}>{funnel?.reservationRate ?? 0}%</div>
        </div>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 1000, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["User", "Product", "Status", "Progress", "Reservations", "Created"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {goals.map((goal) => (
              <tr key={goal.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  {`${goal.user?.firstName || ""} ${goal.user?.lastName || ""}`.trim() || goal.user?.email || "User"}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{goal.product?.name || "-"}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{goal.status}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  ${Number(goal.contributed || 0).toFixed(2)} / ${Number(goal.goalAmount || 0).toFixed(2)}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{goal.reservationCount || 0}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{new Date(goal.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {goals.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: "#64748b" }}>No goals yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
