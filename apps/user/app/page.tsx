"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { getDashboard, getProfile, type Goal } from "@/lib/user-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export default function UserHomePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [goals, setGoals] = useState<Goal[]>([])
  const [stats, setStats] = useState({
    activeGoals: 0,
    completedGoals: 0,
    unlockRate: 0,
    reservationCount: 0,
    consistencyScore: 0,
    bucketConsistency: 0,
    layverScore: 0,
    bucketCount: 0,
    totalSaved: 0,
  })
  const [displayName, setDisplayName] = useState("there")

  useEffect(() => {
    void (async () => {
      try {
        const [dashboard, profile] = await Promise.all([getDashboard(), getProfile()])
        setGoals(dashboard.goals)
        setStats(dashboard.stats)
        setDisplayName((profile.firstName || "").trim() || profile.email || "there")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard.")
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

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Welcome back, {displayName}</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Your savings journey overview.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {loading ? <p style={{ color: "#475569" }}>Loading dashboard...</p> : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Active Goals</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.activeGoals}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Completed Goals</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.completedGoals}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Layver Score (v1)</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.layverScore}%</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Saved</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(stats.totalSaved)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Link href="/goals"><button>View Goals</button></Link>
        <Link href="/buckets"><button>Savings Buckets</button></Link>
        <Link href="/reservations"><button>Reservations</button></Link>
        <Link href="/transactions"><button>Transactions</button></Link>
      </div>

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Active Goals</h2>
        {activeGoals.length === 0 ? (
          <p style={{ color: "#64748b" }}>No active goals yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {activeGoals.map((goal) => (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{goal.product.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {formatCurrency(Number(goal.contributed))} / {formatCurrency(Number(goal.goalAmount))}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#0369a1" }}>{goal.status}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {completedGoals.length > 0 ? (
        <section style={{ marginTop: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Completed</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {completedGoals.map((goal) => (
              <div key={goal.id} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{goal.product.name}</span>
                <span style={{ color: "#166534", fontSize: 12 }}>{goal.status}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
