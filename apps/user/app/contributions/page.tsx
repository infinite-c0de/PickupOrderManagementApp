"use client"

import { useEffect, useMemo, useState } from "react"
import { getContributions } from "@/lib/user-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

type FilterType = "all" | "completed" | "upcoming"

export default function ContributionsPage() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [rows, setRows] = useState<
    Array<{
      id: string
      dueDate: string
      plannedAmount: string
      actualAmount: string
      status: "completed" | "upcoming" | "missed"
      goal: { product: { name: string } }
    }>
  >([])
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const response = await getContributions()
        setRows(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load contributions.")
      }
    })()
  }, [])

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((item) => item.status === filter)),
    [rows, filter],
  )

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Contributions</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Track planned and completed contribution activity.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {(["all", "completed", "upcoming"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              background: filter === value ? "#0f172a" : "#fff",
              color: filter === value ? "#fff" : "#0f172a",
              border: "1px solid #cbd5e1",
            }}
          >
            {value[0].toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#64748b" }}>No contributions found for this filter.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map((item) => (
            <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong>{item.goal.product.name}</strong>
                <span style={{ fontSize: 12, color: "#0369a1" }}>{item.status}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Due: {item.dueDate} · Planned: {formatCurrency(Number(item.plannedAmount))} · Actual:{" "}
                {item.status === "upcoming" ? "--" : formatCurrency(Number(item.actualAmount))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
