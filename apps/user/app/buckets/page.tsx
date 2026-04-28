"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  confirmBucketCheckoutSession,
  createBucketCheckoutSession,
  createSavingsBucket,
  getMySavingsBucketInsights,
  getMySavingsBuckets,
  getSavingsBucketOptions,
  runSavingsBucketAutoSave,
  updateSavingsBucket,
  type SavingsBucket,
  type SavingsBucketCadence,
  type SavingsBucketType,
} from "@/lib/user-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export default function BucketsPage() {
  const [items, setItems] = useState<SavingsBucket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [saving, setSaving] = useState(false)
  const [runningAutoSave, setRunningAutoSave] = useState(false)
  const [contributingId, setContributingId] = useState("")
  const confirmedSessionRef = useRef<string | null>(null)

  const [options, setOptions] = useState<{
    industries: Array<{ id: string; name: string }>
    retailers: Array<{ id: string; name: string }>
  }>({ industries: [], retailers: [] })
  const [contributionInput, setContributionInput] = useState<Record<string, string>>({})
  const [insights, setInsights] = useState<{
    industry: { bucketCount: number; monthlyCommitted: number; savedAmount: number }
    retailer: { bucketCount: number; monthlyCommitted: number; savedAmount: number }
  } | null>(null)
  const [form, setForm] = useState({
    type: "industry" as SavingsBucketType,
    name: "",
    retailerId: "",
    categoryId: "",
    monthlyContribution: "",
    targetAmount: "",
    notes: "",
    autoSaveEnabled: true,
    autoSaveCadence: "monthly" as SavingsBucketCadence,
  })

  async function loadData() {
    try {
      setLoading(true)
      const autoSaveResult = await runSavingsBucketAutoSave()
      const [bucketItems, bucketInsights, bucketOptions] = await Promise.all([
        getMySavingsBuckets(),
        getMySavingsBucketInsights(),
        getSavingsBucketOptions(),
      ])
      setItems(bucketItems)
      setInsights(bucketInsights)
      setOptions(bucketOptions)
      if (autoSaveResult.processedBuckets > 0) {
        setSuccess(`Auto-save processed ${autoSaveResult.processedBuckets} bucket(s).`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load savings buckets.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const paymentState = params.get("payment")
    const sessionId = params.get("session_id")
    if (paymentState !== "bucket_success" || !sessionId) return
    if (confirmedSessionRef.current === sessionId) return
    confirmedSessionRef.current = sessionId

    void (async () => {
      try {
        const response = await confirmBucketCheckoutSession({ sessionId })
        setSuccess(response.alreadyRecorded ? "Bucket payment already processed." : "Bucket contribution payment completed.")
        await loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment completed but confirmation failed.")
      } finally {
        window.history.replaceState({}, "", window.location.pathname)
      }
    })()
  }, [])

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type))),
    [items],
  )

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError("Bucket name is required.")
      return
    }
    if (form.type === "retailer" && !form.retailerId) {
      setError("Select a retailer.")
      return
    }
    if (form.type === "industry" && !form.categoryId) {
      setError("Select an industry.")
      return
    }
    const monthly = Number(form.monthlyContribution || 0)
    if (!Number.isFinite(monthly) || monthly < 0) {
      setError("Monthly contribution must be a valid number.")
      return
    }
    setSaving(true)
    setError("")
    try {
      await createSavingsBucket({
        type: form.type,
        name: form.name.trim(),
        retailerId: form.type === "retailer" ? form.retailerId : undefined,
        categoryId: form.type === "industry" ? form.categoryId : undefined,
        monthlyContribution: monthly,
        targetAmount: form.targetAmount ? Number(form.targetAmount) : undefined,
        notes: form.notes || undefined,
        autoSaveEnabled: form.autoSaveEnabled,
        autoSaveCadence: form.autoSaveCadence,
      })
      setForm({
        type: "industry",
        name: "",
        retailerId: "",
        categoryId: "",
        monthlyContribution: "",
        targetAmount: "",
        notes: "",
        autoSaveEnabled: true,
        autoSaveCadence: "monthly",
      })
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create bucket.")
    } finally {
      setSaving(false)
    }
  }

  async function handleAddContribution(item: SavingsBucket) {
    const raw = contributionInput[item.id] || ""
    const amount = Number(raw)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Contribution amount must be greater than 0.")
      return
    }
    setContributingId(item.id)
    setError("")
    try {
      const checkout = await createBucketCheckoutSession({ bucketId: item.id, amount })
      window.location.href = checkout.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create bucket checkout session.")
    } finally {
      setContributingId("")
    }
  }

  async function handleToggleStatus(item: SavingsBucket) {
    setError("")
    try {
      await updateSavingsBucket(item.id, { status: item.status === "active" ? "paused" : "active" })
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update bucket status.")
    }
  }

  async function handleRunAutoSave() {
    setRunningAutoSave(true)
    setError("")
    setSuccess("")
    try {
      const result = await runSavingsBucketAutoSave()
      setSuccess(result.processedBuckets > 0 ? `Auto-save processed ${result.processedBuckets} bucket(s).` : "No buckets due for auto-save.")
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to run auto-save.")
    } finally {
      setRunningAutoSave(false)
    }
  }

  async function handleUpdateAutoSave(id: string, payload: { autoSaveEnabled?: boolean; autoSaveCadence?: SavingsBucketCadence }) {
    setError("")
    try {
      await updateSavingsBucket(id, payload)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update auto-save settings.")
    }
  }

  const nameOptions = form.type === "retailer" ? options.retailers : options.industries
  const selectedNameOptionId = form.type === "retailer" ? form.retailerId : form.categoryId

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Savings Buckets</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Save by retailer or industry before final purchase.</p>
      <button onClick={() => void handleRunAutoSave()} disabled={runningAutoSave}>
        {runningAutoSave ? "Running auto-save..." : "Run Auto-save Now"}
      </button>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {success ? <p style={{ color: "#166534" }}>{success}</p> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, margin: "12px 0" }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Industry Buckets</div>
          <div>Buckets: {insights?.industry.bucketCount ?? 0}</div>
          <div>Saved: {formatCurrency(insights?.industry.savedAmount ?? 0)}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Retailer Buckets</div>
          <div>Buckets: {insights?.retailer.bucketCount ?? 0}</div>
          <div>Saved: {formatCurrency(insights?.retailer.savedAmount ?? 0)}</div>
        </div>
      </div>

      <form onSubmit={handleCreate} style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12, marginBottom: 12, display: "grid", gap: 8 }}>
        <h2 style={{ marginTop: 0 }}>Create Bucket</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                type: e.target.value as SavingsBucketType,
                name: "",
                retailerId: "",
                categoryId: "",
              }))
            }
          >
            <option value="industry">Industry</option>
            <option value="retailer">Retailer</option>
          </select>
          <select
            value={selectedNameOptionId}
            onChange={(e) => {
              const value = e.target.value
              const selected = nameOptions.find((item) => item.id === value)
              setForm((prev) => ({
                ...prev,
                name: selected?.name || "",
                retailerId: prev.type === "retailer" ? selected?.id || "" : "",
                categoryId: prev.type === "industry" ? selected?.id || "" : "",
              }))
            }}
          >
            <option value="">Select {form.type === "retailer" ? "retailer" : "industry"}</option>
            {nameOptions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min={0}
            placeholder="Monthly contribution"
            value={form.monthlyContribution}
            onChange={(e) => setForm((prev) => ({ ...prev, monthlyContribution: e.target.value }))}
          />
          <input
            type="number"
            step="0.01"
            min={0}
            placeholder="Target amount (optional)"
            value={form.targetAmount}
            onChange={(e) => setForm((prev) => ({ ...prev, targetAmount: e.target.value }))}
          />
        </div>
        <input
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={form.autoSaveEnabled}
              onChange={(e) => setForm((prev) => ({ ...prev, autoSaveEnabled: e.target.checked }))}
            />
            <span>Auto-save enabled</span>
          </label>
          <select
            value={form.autoSaveCadence}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, autoSaveCadence: e.target.value as SavingsBucketCadence }))
            }
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Bucket"}</button>
        </div>
      </form>

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Your Buckets</h2>
        {loading ? <p style={{ color: "#475569" }}>Loading buckets...</p> : null}
        {!loading && sortedItems.length === 0 ? <p style={{ color: "#64748b" }}>No buckets yet.</p> : null}
        <div style={{ display: "grid", gap: 8 }}>
          {sortedItems.map((item) => (
            <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {item.type} · {item.status} · Saved {formatCurrency(Number(item.savedAmount))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => void handleToggleStatus(item)}>
                    {item.status === "active" ? "Pause" : "Resume"}
                  </button>
                  <button onClick={() => void handleUpdateAutoSave(item.id, { autoSaveEnabled: !item.autoSaveEnabled })}>
                    Auto-save {item.autoSaveEnabled ? "On" : "Off"}
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                <select
                  value={item.autoSaveCadence}
                  onChange={(e) =>
                    void handleUpdateAutoSave(item.id, { autoSaveCadence: e.target.value as SavingsBucketCadence })
                  }
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder="Add contribution"
                  value={contributionInput[item.id] || ""}
                  onChange={(e) =>
                    setContributionInput((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                />
                <button onClick={() => void handleAddContribution(item)} disabled={contributingId === item.id}>
                  {contributingId === item.id ? "Adding..." : "Add Contribution"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
