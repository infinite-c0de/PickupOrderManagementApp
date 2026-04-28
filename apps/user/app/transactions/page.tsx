"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { getContributions } from "@/lib/user-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

type ContributionRow = {
  id: string
  dueDate: string
  plannedAmount: string
  actualAmount: string
  status: "completed" | "upcoming" | "missed"
  goal: { id?: string; product: { name: string } }
}

export default function TransactionsPage() {
  const [rows, setRows] = useState<ContributionRow[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const response = await getContributions()
        setRows(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load transactions.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const nextPayment = useMemo(() => rows.find((item) => item.status === "upcoming"), [rows])

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Transactions & Progress</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Simple view of upcoming and recent contribution payments.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

      {nextPayment ? (
        <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12, marginBottom: 12 }}>
          <h2 style={{ marginTop: 0 }}>Next Payment</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{nextPayment.goal.product.name}</strong>
              <div style={{ fontSize: 12, color: "#64748b" }}>Due {nextPayment.dueDate}</div>
            </div>
            <strong>{formatCurrency(Number(nextPayment.plannedAmount))}</strong>
          </div>
        </section>
      ) : null}

      {loading ? <p style={{ color: "#475569" }}>Loading transactions...</p> : null}
      {!loading && rows.length === 0 ? <p style={{ color: "#64748b" }}>No transactions yet.</p> : null}
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((item) => (
          <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div>
                <strong>{item.goal.product.name}</strong>
                <div style={{ fontSize: 12, color: "#64748b" }}>Payment on {item.dueDate}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>
                  {formatCurrency(Number(item.status === "upcoming" ? item.plannedAmount : item.actualAmount))}
                </span>
                <span style={{ fontSize: 12, color: "#0369a1" }}>{item.status}</span>
                <Link href="/goals"><button>Manage</button></Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
