"use client"

import Link from "next/link"
import { use, useEffect, useRef, useState } from "react"
import {
  cancelGoal,
  confirmContributionCheckoutSession,
  createContributionCheckoutSession,
  getGoalById,
  unlockGoal,
  type Goal,
} from "@/lib/user-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [error, setError] = useState("")
  const [contributionAmount, setContributionAmount] = useState("")
  const [contributing, setContributing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [success, setSuccess] = useState("")
  const confirmedSessionRef = useRef<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const response = await getGoalById(id)
        setGoal(response)
        setContributionAmount(String(Number(response.contributionSchedule)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load goal.")
      }
    })()
  }, [id])

  useEffect(() => {
    if (!goal || typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const paymentState = params.get("payment")
    const sessionId = params.get("session_id")
    if (paymentState !== "success" || !sessionId) return
    if (confirmedSessionRef.current === sessionId) return
    confirmedSessionRef.current = sessionId

    void (async () => {
      try {
        setContributing(true)
        const response = await confirmContributionCheckoutSession({ sessionId })
        setGoal(response.goal)
        setSuccess("Contribution recorded successfully.")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Contribution confirmation failed.")
      } finally {
        setContributing(false)
        window.history.replaceState({}, "", window.location.pathname)
      }
    })()
  }, [goal])

  async function handleContribute() {
    if (!goal) return
    const amount = Number(contributionAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid contribution amount.")
      return
    }
    setContributing(true)
    setError("")
    try {
      const checkout = await createContributionCheckoutSession({ goalId: goal.id, amount })
      window.location.href = checkout.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create checkout session.")
      setContributing(false)
    }
  }

  async function handleCancelGoal() {
    if (!goal) return
    if (!window.confirm("Cancel this goal and request refund?")) return
    setCancelling(true)
    setError("")
    try {
      const response = await cancelGoal(goal.id)
      setGoal(response.goal)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel goal.")
    } finally {
      setCancelling(false)
    }
  }

  async function handleUnlock() {
    if (!goal) return
    setError("")
    try {
      const updatedGoal = await unlockGoal(goal.id)
      setGoal(updatedGoal)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unlock goal.")
    }
  }

  if (!goal) return <p style={{ color: "#475569" }}>{error || "Loading goal..."}</p>

  const progress = (Number(goal.contributed) / Number(goal.goalAmount)) * 100
  const isCompleted =
    goal.status === "completed" ||
    goal.status === "unlocked" ||
    goal.status === "cancelled" ||
    goal.status === "refunded"

  return (
    <div>
      <Link href="/goals" style={{ textDecoration: "none" }}>
        <button>Back to Goals</button>
      </Link>

      <h1 style={{ marginBottom: 6 }}>{goal.product.name}</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Status: {goal.status}</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {success ? <p style={{ color: "#166534" }}>{success}</p> : null}

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12, marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Saved</div>
            <strong>{formatCurrency(Number(goal.contributed))}</strong>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Goal Amount</div>
            <strong>{formatCurrency(Number(goal.goalAmount))}</strong>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Projected Better Price</div>
            <strong>{formatCurrency(Number(goal.projectedPrice))}</strong>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Progress</div>
            <strong>{progress.toFixed(1)}%</strong>
          </div>
        </div>
      </section>

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12, marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Contribution History</h2>
        {goal.contributions.length === 0 ? (
          <p style={{ color: "#64748b" }}>No contribution history yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {goal.contributions.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8 }}>
                <span>{item.dueDate}</span>
                <span>{formatCurrency(Number(item.plannedAmount))}</span>
                <span>{item.status === "upcoming" ? "--" : formatCurrency(Number(item.actualAmount))}</span>
                <span style={{ fontSize: 12, color: "#0369a1" }}>{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {!isCompleted ? (
        <section style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="number"
            min={1}
            step="0.01"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            placeholder="Contribution amount"
          />
          <button onClick={() => void handleContribute()} disabled={contributing}>
            {contributing ? "Processing..." : "Pay Contribution"}
          </button>
          <button onClick={() => void handleCancelGoal()} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel Goal"}
          </button>
        </section>
      ) : null}

      {goal.status === "completed" ? (
        <div style={{ marginTop: 8 }}>
          <button onClick={() => void handleUnlock()}>Pay Retailer & Unlock</button>
        </div>
      ) : null}
    </div>
  )
}
