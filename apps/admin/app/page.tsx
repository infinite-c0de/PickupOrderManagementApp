"use client"

import { useEffect, useMemo, useState } from "react"
import { getAdminSavingsDemand, getAdminSummary, type AdminSummary, type SavingsDemandSummary } from "@/lib/admin-api"

function cardStyle(): React.CSSProperties {
  return {
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#fff",
    padding: 16,
  }
}

export default function AdminHomePage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [demand, setDemand] = useState<SavingsDemandSummary | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        setError("")
        const [summaryRes, demandRes] = await Promise.all([
          getAdminSummary(),
          getAdminSavingsDemand(),
        ])
        setSummary(summaryRes)
        setDemand(demandRes)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load admin overview.")
      }
    })()
  }, [])

  const industryMonthly = useMemo(
    () => (demand?.byIndustry || []).reduce((sum, row) => sum + row.monthlyCommitted, 0),
    [demand],
  )
  const retailerMonthly = useMemo(
    () => (demand?.byRetailer || []).reduce((sum, row) => sum + row.monthlyCommitted, 0),
    [demand],
  )

  return (
    <div style={{ maxWidth: 1100 }}>
      <h1 style={{ marginBottom: 6 }}>Admin Overview</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>
        Migrated Step 4 baseline: summary + demand widgets.
      </p>
      {error ? (
        <div style={{ ...cardStyle(), borderColor: "#fecaca", color: "#b91c1c", marginBottom: 16 }}>{error}</div>
      ) : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Users</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{summary?.totalUsers ?? 0}</div>
        </div>
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Active Goals</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{summary?.activeGoals ?? 0}</div>
        </div>
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Completion Rate</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{summary?.completionRate ?? 0}%</div>
        </div>
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Unlock Rate</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{summary?.unlockRate ?? 0}%</div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
          gap: 12,
        }}
      >
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Industry Demand (Monthly)</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>${industryMonthly.toFixed(2)}</div>
        </div>
        <div style={cardStyle()}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Retailer Demand (Monthly)</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>${retailerMonthly.toFixed(2)}</div>
        </div>
      </section>
    </div>
  )
}
