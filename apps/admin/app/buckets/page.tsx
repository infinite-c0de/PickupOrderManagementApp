"use client"

import { useEffect, useMemo, useState } from "react"
import { getAdminSavingsDemand, type SavingsDemandItem } from "@/lib/admin-api"

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export default function AdminBucketsPage() {
  const [rows, setRows] = useState<SavingsDemandItem[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const res = await getAdminSavingsDemand()
        setRows([...(res.byIndustry || []), ...(res.byRetailer || [])])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load bucket demand.")
      }
    })()
  }, [])

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.users += row.userCount
        acc.buckets += row.bucketCount
        acc.monthly += row.monthlyCommitted
        acc.saved += row.savedAmount
        return acc
      },
      { users: 0, buckets: 0, monthly: 0, saved: 0 },
    )
  }, [rows])

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Savings Bucket Demand</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>
        Core live demand metrics: saver count, intent volume, avg contribution, conversion.
      </p>
      {error ? (
        <div style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 12 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginBottom: 14 }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Savers</div>
          <div style={{ fontWeight: 700, fontSize: 24 }}>{totals.users}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Buckets</div>
          <div style={{ fontWeight: 700, fontSize: 24 }}>{totals.buckets}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Monthly Committed</div>
          <div style={{ fontWeight: 700, fontSize: 24 }}>{money(totals.monthly)}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Saved Amount</div>
          <div style={{ fontWeight: 700, fontSize: 24 }}>{money(totals.saved)}</div>
        </div>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 1000, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Type", "Name", "Savers", "Buckets", "Monthly", "Saved", "Avg Contribution", "Intent", "Conversion"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.type}-${row.name}`}>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row.type}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row.name}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row.userCount}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row.bucketCount}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{money(row.monthlyCommitted)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{money(row.savedAmount)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{money(row.avgContribution)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row.intentVolume}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row.conversionRate.toFixed(1)}%</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 16, color: "#64748b" }}>No demand data yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
