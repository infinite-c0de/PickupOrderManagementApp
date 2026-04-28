"use client"

import { useEffect, useState } from "react"
import {
  getAdminFunnel,
  getAdminRetailers,
  getAdminSummary,
  getAdminUsers,
} from "@/lib/admin-api"

export default function AdminReportsPage() {
  const [format, setFormat] = useState<"csv" | "json">("csv")
  const [summary, setSummary] = useState({ totalUsers: 0, retailerInterest: 0, activeGoals: 0 })
  const [funnelRate, setFunnelRate] = useState(0)
  const [error, setError] = useState("")
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const [summaryRes, funnelRes] = await Promise.all([getAdminSummary(), getAdminFunnel()])
        setSummary({
          totalUsers: summaryRes.totalUsers,
          retailerInterest: summaryRes.retailerInterest,
          activeGoals: summaryRes.activeGoals,
        })
        setFunnelRate(funnelRes.goalCreationRate)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load report metrics.")
      }
    })()
  }, [])

  function download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  function toCsv(items: Array<Record<string, unknown>>) {
    if (items.length === 0) return ""
    const headers = Object.keys(items[0])
    const lines = [
      headers.join(","),
      ...items.map((row) =>
        headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ]
    return lines.join("\n")
  }

  async function exportType(type: "users" | "retailers" | "goals") {
    setExporting(type)
    setError("")
    try {
      let payload: Array<Record<string, unknown>> = []
      if (type === "users") {
        payload = await getAdminUsers()
      } else if (type === "retailers") {
        payload = await getAdminRetailers()
      } else {
        const funnel = await getAdminFunnel()
        payload = funnel.funnel.map((item) => ({ ...item, goalCreationRate: funnel.goalCreationRate }))
      }
      const fileBase = `${type}-report-${new Date().toISOString().slice(0, 10)}`
      if (format === "json") {
        download(`${fileBase}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8;")
      } else {
        download(`${fileBase}.csv`, toCsv(payload), "text/csv;charset=utf-8;")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.")
    } finally {
      setExporting(null)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Reports & Exports</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Export users, retailers, and goal funnel metrics.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, marginBottom: 12 }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Users</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{summary.totalUsers}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Retailer Interest</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{summary.retailerInterest}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Goal Creation Rate</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{funnelRate}/mo</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <label htmlFor="exportFormat" style={{ fontSize: 12, color: "#475569" }}>Format</label>
        <select id="exportFormat" value={format} onChange={(e) => setFormat(e.target.value as "csv" | "json")}>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => void exportType("users")} disabled={exporting === "users"}>
          {exporting === "users" ? "Exporting..." : "Export Users"}
        </button>
        <button onClick={() => void exportType("retailers")} disabled={exporting === "retailers"}>
          {exporting === "retailers" ? "Exporting..." : "Export Retailers"}
        </button>
        <button onClick={() => void exportType("goals")} disabled={exporting === "goals"}>
          {exporting === "goals" ? "Exporting..." : "Export Goals"}
        </button>
      </div>
    </div>
  )
}
