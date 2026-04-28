"use client"

import { useEffect, useMemo, useState } from "react"
import {
  createAdminTimelineOption,
  deleteAdminTimelineOption,
  getAdminTimelineOptions,
  updateAdminTimelineOptions,
  type TimelineOption,
} from "@/lib/admin-api"

export default function AdminTimelinesPage() {
  const [options, setOptions] = useState<TimelineOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newCadence, setNewCadence] = useState<"monthly" | "weekly">("monthly")

  useEffect(() => {
    void (async () => {
      try {
        const response = await getAdminTimelineOptions()
        setOptions(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load timeline options.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const monthly = useMemo(
    () => options.filter((item) => item.cadence === "monthly").sort((a, b) => a.months - b.months),
    [options],
  )
  const weekly = useMemo(
    () => options.filter((item) => item.cadence === "weekly").sort((a, b) => a.months - b.months),
    [options],
  )

  function toggleEnabled(id: string) {
    setOptions((prev) => prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)))
  }

  function setDefault(id: string) {
    setOptions((prev) => {
      const selected = prev.find((item) => item.id === id)
      if (!selected) return prev
      return prev.map((item) =>
        item.cadence === selected.cadence
          ? { ...item, isDefault: item.id === id, enabled: item.id === id ? true : item.enabled }
          : item,
      )
    })
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const response = await updateAdminTimelineOptions({
        items: options.map((item) => ({
          id: item.id,
          enabled: item.enabled,
          isDefault: item.isDefault,
        })),
      })
      setOptions(response)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save timeline options.")
    } finally {
      setSaving(false)
    }
  }

  async function handleAdd() {
    const value = Number(newAmount)
    if (!Number.isFinite(value) || value <= 0) return
    setAdding(true)
    setError("")
    try {
      const response = await createAdminTimelineOption({ months: value, cadence: newCadence })
      setOptions(response)
      setNewAmount("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add timeline option.")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this timeline option?")) return
    setError("")
    try {
      const response = await deleteAdminTimelineOption(id)
      setOptions(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete timeline option.")
    }
  }

  function renderRow(item: TimelineOption) {
    return (
      <div
        key={item.id}
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          background: "#fff",
          padding: 10,
          display: "grid",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>
            {item.months} {item.cadence === "weekly" ? "weeks" : "months"}
          </strong>
          {item.isDefault ? <span style={{ fontSize: 12, color: "#0369a1" }}>Default</span> : null}
        </div>
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={item.enabled} onChange={() => toggleEnabled(item.id)} />
          <span>Enabled</span>
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!item.isDefault && item.enabled ? (
            <button onClick={() => setDefault(item.id)}>Set Default</button>
          ) : null}
          <button onClick={() => void handleDelete(item.id)}>Delete</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Timeline Options</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Manage monthly and weekly goal timeline durations.</p>
      {loading ? <p style={{ color: "#475569" }}>Loading...</p> : null}
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {saved ? <p style={{ color: "#166534" }}>Timeline options saved.</p> : null}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <select value={newCadence} onChange={(e) => setNewCadence(e.target.value as "monthly" | "weekly")}>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </select>
        <input
          type="number"
          min={1}
          placeholder={newCadence === "weekly" ? "Weeks" : "Months"}
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
        />
        <button onClick={() => void handleAdd()} disabled={adding || !newAmount}>
          {adding ? "Adding..." : "Add Option"}
        </button>
      </div>

      <h2 style={{ marginBottom: 8 }}>Monthly</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, marginBottom: 14 }}>
        {monthly.map((item) => renderRow(item))}
      </div>

      <h2 style={{ marginBottom: 8 }}>Weekly</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
        {weekly.map((item) => renderRow(item))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => void handleSave()} disabled={saving || loading}>
          {saving ? "Saving..." : "Save Timeline Options"}
        </button>
      </div>
    </div>
  )
}
