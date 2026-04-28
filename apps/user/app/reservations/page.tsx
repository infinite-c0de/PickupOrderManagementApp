"use client"

import { useEffect, useMemo, useState } from "react"
import {
  createReservationIntent,
  getGoals,
  getReservationIntents,
  type Goal,
  type ReservationIntent,
} from "@/lib/user-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export default function ReservationsPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState("")
  const [timing, setTiming] = useState("1-2-weeks")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [history, setHistory] = useState<ReservationIntent[]>([])

  useEffect(() => {
    void (async () => {
      try {
        const response = await getGoals()
        const eligible = response.filter((goal) => goal.status === "unlocked")
        setGoals(eligible)
        setSelectedGoalId(eligible[0]?.id || "")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load goals.")
      }
    })()
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const response = await getReservationIntents()
        setHistory(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load reservation history.")
      }
    })()
  }, [])

  const availableGoals = useMemo(() => {
    const reservedGoalIds = new Set(history.map((item) => item.goal?.id).filter((value): value is string => Boolean(value)))
    return goals.filter((goal) => !reservedGoalIds.has(goal.id))
  }, [goals, history])

  useEffect(() => {
    if (availableGoals.length === 0) {
      setSelectedGoalId("")
      return
    }
    if (!availableGoals.some((goal) => goal.id === selectedGoalId)) {
      setSelectedGoalId(availableGoals[0].id)
    }
  }, [availableGoals, selectedGoalId])

  const selectedGoal = availableGoals.find((goal) => goal.id === selectedGoalId)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedGoal) return
    setLoading(true)
    setError("")
    try {
      await createReservationIntent({
        goalId: selectedGoal.id,
        purchaseInterest: true,
        preferredTiming: timing,
        budgetConfirmation: Number(selectedGoal.projectedPrice),
        notes: notes.trim() || undefined,
      })
      const refreshed = await getReservationIntents()
      setHistory(refreshed)
      setSubmitted(true)
      setNotes("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit reservation intent.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Reservation Intent</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Submit purchase intent for unlocked goals.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {submitted ? <p style={{ color: "#166534" }}>Reservation intent submitted.</p> : null}

      <form onSubmit={handleSubmit} style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12, marginBottom: 12, display: "grid", gap: 8 }}>
        <h2 style={{ marginTop: 0 }}>Submit Reservation Intent</h2>
        <select value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)}>
          <option value="">Select unlocked goal</option>
          {availableGoals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.product.name} - {formatCurrency(Number(goal.projectedPrice))}
            </option>
          ))}
        </select>
        <select value={timing} onChange={(e) => setTiming(e.target.value)}>
          <option value="immediate">As soon as possible</option>
          <option value="1-2-weeks">Within 1-2 weeks</option>
          <option value="1-month">Within 1 month</option>
          <option value="flexible">Flexible timing</option>
        </select>
        <input value={selectedGoal ? formatCurrency(Number(selectedGoal.projectedPrice)) : ""} readOnly />
        <textarea
          rows={3}
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button type="submit" disabled={loading || availableGoals.length === 0}>
          {loading ? "Submitting..." : "Submit Reservation Intent"}
        </button>
      </form>

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Your Reservation Status</h2>
        {history.length === 0 ? (
          <p style={{ color: "#64748b" }}>No reservation intent submitted yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {history.map((item) => (
              <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <strong>{item.goal?.product?.name || "Product"}</strong>
                  <span style={{ fontSize: 12, color: "#0369a1" }}>{item.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Goal status: {item.goal?.status || "unknown"} · Timing: {item.preferredTiming} · Budget:{" "}
                  {formatCurrency(Number(item.budgetConfirmation || 0))}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Admin note: {item.adminNotes || "-"} · Submitted: {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
