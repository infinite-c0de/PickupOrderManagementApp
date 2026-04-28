"use client"

import { useEffect, useState } from "react"
import { getPricingModel, updatePricingModel } from "@/lib/admin-api"

export default function AdminPricingPage() {
  const [model, setModel] = useState({
    incentivePercent: 8,
    projectedDiscountMin: 5,
    projectedDiscountMax: 20,
    verifiedModeEnabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const isInvalid = model.projectedDiscountMin > model.projectedDiscountMax

  useEffect(() => {
    void (async () => {
      try {
        const response = await getPricingModel()
        setModel({
          incentivePercent: Number(response.incentivePercent),
          projectedDiscountMin: Number(response.projectedDiscountMin),
          projectedDiscountMax: Number(response.projectedDiscountMax),
          verifiedModeEnabled: Boolean(response.verifiedModeEnabled),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load pricing model.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function handleSave() {
    setError("")
    if (isInvalid) {
      setError("Min discount cannot be greater than max discount.")
      return
    }
    setSaving(true)
    try {
      const response = await updatePricingModel(model)
      setModel({
        incentivePercent: Number(response.incentivePercent),
        projectedDiscountMin: Number(response.projectedDiscountMin),
        projectedDiscountMax: Number(response.projectedDiscountMax),
        verifiedModeEnabled: Boolean(response.verifiedModeEnabled),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save pricing model.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Pricing Model Controls</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Configure projected pricing and incentives used across the platform.</p>
      {loading ? <p style={{ color: "#475569" }}>Loading pricing model...</p> : null}
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {saved ? <p style={{ color: "#166534" }}>Pricing model saved.</p> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 12 }}>Incentive %</span>
          <input
            type="number"
            min={0}
            max={50}
            value={model.incentivePercent}
            onChange={(e) =>
              setModel((prev) => ({ ...prev, incentivePercent: Number(e.target.value || 0) }))
            }
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 12 }}>Projected Discount Min %</span>
          <input
            type="number"
            min={0}
            max={50}
            value={model.projectedDiscountMin}
            onChange={(e) =>
              setModel((prev) => ({ ...prev, projectedDiscountMin: Number(e.target.value || 0) }))
            }
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 12 }}>Projected Discount Max %</span>
          <input
            type="number"
            min={0}
            max={50}
            value={model.projectedDiscountMax}
            onChange={(e) =>
              setModel((prev) => ({ ...prev, projectedDiscountMax: Number(e.target.value || 0) }))
            }
          />
        </label>
      </div>

      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10 }}>
        <input
          type="checkbox"
          checked={model.verifiedModeEnabled}
          onChange={(e) => setModel((prev) => ({ ...prev, verifiedModeEnabled: e.target.checked }))}
        />
        <span>Enable verified pricing mode</span>
      </label>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => void handleSave()} disabled={saving || loading || isInvalid}>
          {saving ? "Saving..." : "Save Pricing Model"}
        </button>
      </div>
    </div>
  )
}
