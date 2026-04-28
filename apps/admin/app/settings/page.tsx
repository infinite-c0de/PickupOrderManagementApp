"use client"

import { useEffect, useState } from "react"
import {
  changePassword,
  getAdminFeatureToggles,
  getPricingModel,
  updateAdminFeatureToggles,
  updatePricingModel,
  type AdminFeatureToggle,
  type PricingModel,
} from "@/lib/admin-api"

export default function AdminSettingsPage() {
  const [model, setModel] = useState<PricingModel | null>(null)
  const [toggles, setToggles] = useState<AdminFeatureToggle[]>([])
  const [verifiedModeEnabled, setVerifiedModeEnabled] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSaved, setPasswordSaved] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const [pricing, featureToggles] = await Promise.all([getPricingModel(), getAdminFeatureToggles()])
        setModel(pricing)
        setVerifiedModeEnabled(Boolean(pricing.verifiedModeEnabled))
        setToggles(featureToggles)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load settings.")
      }
    })()
  }, [])

  async function handleSave() {
    if (!model) return
    setSaving(true)
    setError("")
    try {
      const [pricing, featureToggles] = await Promise.all([
        updatePricingModel({
          incentivePercent: Number(model.incentivePercent),
          projectedDiscountMin: Number(model.projectedDiscountMin),
          projectedDiscountMax: Number(model.projectedDiscountMax),
          verifiedModeEnabled,
        }),
        updateAdminFeatureToggles({
          items: toggles.filter((t) => !t.locked).map((t) => ({ key: t.key, enabled: t.enabled })),
        }),
      ])
      setModel(pricing)
      setVerifiedModeEnabled(Boolean(pricing.verifiedModeEnabled))
      setToggles(featureToggles)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.")
    } finally {
      setSaving(false)
    }
  }

  function flipToggle(id: string) {
    setToggles((prev) =>
      prev.map((toggle) =>
        toggle.id === id && !toggle.locked ? { ...toggle, enabled: !toggle.enabled } : toggle,
      ),
    )
  }

  async function handlePasswordChange() {
    setPasswordError("")
    setPasswordSaved(false)
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all password fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Confirm password does not match.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.")
      return
    }

    setPasswordSaving(true)
    try {
      await changePassword({ oldPassword, newPassword })
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 2500)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Unable to change password.")
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Platform Settings</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Manage feature switches and core pricing controls.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {saved ? <p style={{ color: "#166534" }}>Settings saved.</p> : null}

      <section style={{ marginTop: 10 }}>
        <h2 style={{ marginBottom: 8 }}>Pricing Controls</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12 }}>Incentive %</span>
            <input
              type="number"
              value={model?.incentivePercent ?? ""}
              onChange={(e) =>
                setModel((prev) => (prev ? { ...prev, incentivePercent: e.target.value } : prev))
              }
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12 }}>Projected Discount Min %</span>
            <input
              type="number"
              value={model?.projectedDiscountMin ?? ""}
              onChange={(e) =>
                setModel((prev) => (prev ? { ...prev, projectedDiscountMin: e.target.value } : prev))
              }
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12 }}>Projected Discount Max %</span>
            <input
              type="number"
              value={model?.projectedDiscountMax ?? ""}
              onChange={(e) =>
                setModel((prev) => (prev ? { ...prev, projectedDiscountMax: e.target.value } : prev))
              }
            />
          </label>
        </div>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <input
            type="checkbox"
            checked={verifiedModeEnabled}
            onChange={(e) => setVerifiedModeEnabled(e.target.checked)}
          />
          <span>Enable verified mode</span>
        </label>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Feature Toggles</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {toggles.map((toggle) => (
            <label
              key={toggle.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #e2e8f0",
                padding: 10,
                borderRadius: 10,
                background: toggle.locked ? "#f8fafc" : "#fff",
              }}
            >
              <span>
                <strong>{toggle.name}</strong>
                <span style={{ marginLeft: 6, color: "#64748b", fontSize: 12 }}>{toggle.category}</span>
              </span>
              <input
                type="checkbox"
                checked={toggle.enabled}
                disabled={toggle.locked}
                onChange={() => flipToggle(toggle.id)}
              />
            </label>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Admin Password</h2>
        {passwordError ? <p style={{ color: "#b91c1c" }}>{passwordError}</p> : null}
        {passwordSaved ? <p style={{ color: "#166534" }}>Password changed.</p> : null}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
          <input
            type="password"
            placeholder="Current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button
          style={{ marginTop: 8 }}
          onClick={() => void handlePasswordChange()}
          disabled={passwordSaving}
        >
          {passwordSaving ? "Updating..." : "Update Password"}
        </button>
      </section>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => void handleSave()} disabled={saving || !model}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  )
}
