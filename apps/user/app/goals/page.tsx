"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { getGoals, type Goal } from "@/lib/user-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

function timelineLabel(goal: Goal) {
  if (goal.paymentMode === "pay_in_full") return "Pay in Full"
  return goal.cadence === "weekly" ? `${goal.timelineMonths}-week plan` : `${goal.timelineMonths}-month plan`
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const response = await getGoals()
        setGoals(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load goals.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const activeGoals = useMemo(() => goals.filter((item) => item.status === "active"), [goals])
  const completedGoals = useMemo(
    () => goals.filter((item) => item.status === "completed" || item.status === "unlocked"),
    [goals],
  )
  const closedGoals = useMemo(
    () => goals.filter((item) => item.status === "cancelled" || item.status === "refunded"),
    [goals],
  )

  function renderGoals(items: Goal[]) {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((goal) => {
          const progress = (Number(goal.contributed) / Number(goal.goalAmount)) * 100
          return (
            <Link key={goal.id} href={`/goals/${goal.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <strong>{goal.product.name}</strong>
                  <span style={{ fontSize: 12, color: "#0369a1" }}>{goal.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {formatCurrency(Number(goal.contributed))} / {formatCurrency(Number(goal.goalAmount))} ({progress.toFixed(1)}%)
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{timelineLabel(goal)}</div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>My Goals</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Track active, completed, and closed goals.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {loading ? <p style={{ color: "#475569" }}>Loading goals...</p> : null}

      {!loading && goals.length === 0 ? <p style={{ color: "#64748b" }}>No goals yet.</p> : null}

      {activeGoals.length > 0 ? (
        <section style={{ marginBottom: 14 }}>
          <h2>Active ({activeGoals.length})</h2>
          {renderGoals(activeGoals)}
        </section>
      ) : null}
      {completedGoals.length > 0 ? (
        <section style={{ marginBottom: 14 }}>
          <h2>Completed ({completedGoals.length})</h2>
          {renderGoals(completedGoals)}
        </section>
      ) : null}
      {closedGoals.length > 0 ? (
        <section>
          <h2>Closed / Refunded ({closedGoals.length})</h2>
          {renderGoals(closedGoals)}
        </section>
      ) : null}
    </div>
  )
}
