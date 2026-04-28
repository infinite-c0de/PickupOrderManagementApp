"use client"

import { useEffect, useMemo, useState } from "react"
import {
  getMyRetailerLeads,
  type RetailerLead,
  type StripeAccountReadiness,
  updateMyRetailerLead,
  uploadRetailerLogoImage,
  validateMyRetailerStripeReadiness,
} from "@/lib/partner-api"

type ProfileForm = {
  brandName: string
  sellingRegions: string
  websiteUrl: string
  stripeConnectedAccountId: string
  brandBio: string
  logoImage: string
  brandPrimaryColor: string
  brandSecondaryColor: string
  contactName: string
  contactRole: string
  contactEmail: string
  contactPhone: string
}

function mapLeadToForm(lead: RetailerLead): ProfileForm {
  return {
    brandName: lead.brandName || "",
    sellingRegions: lead.sellingRegions || "",
    websiteUrl: lead.websiteUrl || "",
    stripeConnectedAccountId: lead.stripeConnectedAccountId || "",
    brandBio: lead.brandBio || "",
    logoImage: lead.logoImage || lead.logoUrl || "",
    brandPrimaryColor: lead.brandPrimaryColor || "",
    brandSecondaryColor: lead.brandSecondaryColor || "",
    contactName: lead.contactName || "",
    contactRole: lead.contactRole || "",
    contactEmail: lead.user?.email || "",
    contactPhone: lead.contactPhone || "",
  }
}

export default function PartnerProfilePage() {
  const [leads, setLeads] = useState<RetailerLead[]>([])
  const [activeLeadId, setActiveLeadId] = useState("")
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [validatingStripe, setValidatingStripe] = useState(false)
  const [stripeReadiness, setStripeReadiness] = useState<StripeAccountReadiness | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const activeLead = useMemo(
    () => leads.find((item) => item.id === activeLeadId) || null,
    [leads, activeLeadId],
  )

  useEffect(() => {
    void (async () => {
      try {
        const items = await getMyRetailerLeads()
        setLeads(items)
        if (items.length > 0) {
          setActiveLeadId(items[0].id)
          setForm(mapLeadToForm(items[0]))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load partner profile.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!activeLead) return
    setForm(mapLeadToForm(activeLead))
  }, [activeLead])

  async function handleSave() {
    if (!activeLeadId || !form) return
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const updated = await updateMyRetailerLead(activeLeadId, {
        brandName: form.brandName,
        sellingRegions: form.sellingRegions,
        websiteUrl: form.websiteUrl || undefined,
        stripeConnectedAccountId: form.stripeConnectedAccountId || undefined,
        brandBio: form.brandBio || undefined,
        logoImage: form.logoImage || undefined,
        brandPrimaryColor: form.brandPrimaryColor || undefined,
        brandSecondaryColor: form.brandSecondaryColor || undefined,
        contactName: form.contactName,
        contactRole: form.contactRole || undefined,
        contactPhone: form.contactPhone || undefined,
      })
      setLeads((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      setSuccess("Partner profile updated.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save partner profile.")
    } finally {
      setSaving(false)
    }
  }

  async function handleValidateStripeReadiness() {
    if (!activeLeadId) return
    setValidatingStripe(true)
    setError("")
    try {
      const result = await validateMyRetailerStripeReadiness(activeLeadId)
      setStripeReadiness(result)
      setSuccess(result.ready ? "Stripe account is ready for payouts." : "Stripe readiness checked.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to validate Stripe readiness.")
    } finally {
      setValidatingStripe(false)
    }
  }

  if (loading) return <p style={{ color: "#475569" }}>Loading partner profile...</p>

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Partner Profile</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Update partner information used across the marketplace.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {success ? <p style={{ color: "#166534" }}>{success}</p> : null}

      {leads.length === 0 || !form ? (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          No partner profile found for this account yet.
        </div>
      ) : (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12, display: "grid", gap: 10 }}>
          {leads.length > 1 ? (
            <select value={activeLeadId} onChange={(e) => setActiveLeadId(e.target.value)}>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>{lead.brandName || "Unnamed brand"}</option>
              ))}
            </select>
          ) : null}

          <h2 style={{ marginBottom: 0 }}>Brand Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
            <input value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} placeholder="Brand name" />
            <input value={form.sellingRegions} onChange={(e) => setForm({ ...form, sellingRegions: e.target.value })} placeholder="Selling regions" />
            <input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="Website URL" />
            <input value={form.stripeConnectedAccountId} onChange={(e) => setForm({ ...form, stripeConnectedAccountId: e.target.value })} placeholder="Stripe account ID (acct_...)" />
            <input value={form.brandPrimaryColor} onChange={(e) => setForm({ ...form, brandPrimaryColor: e.target.value })} placeholder="Brand primary color" />
            <input value={form.brandSecondaryColor} onChange={(e) => setForm({ ...form, brandSecondaryColor: e.target.value })} placeholder="Brand secondary color" />
          </div>
          <textarea rows={4} value={form.brandBio} onChange={(e) => setForm({ ...form, brandBio: e.target.value })} placeholder="Brand bio" />
          <div style={{ display: "grid", gap: 6 }}>
            <input value={form.logoImage} onChange={(e) => setForm({ ...form, logoImage: e.target.value })} placeholder="Logo URL" />
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploadingLogo(true)
                void (async () => {
                  try {
                    const uploaded = await uploadRetailerLogoImage(file)
                    setForm((prev) => (prev ? { ...prev, logoImage: uploaded.url } : prev))
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Unable to upload logo image.")
                  } finally {
                    setUploadingLogo(false)
                  }
                })()
              }}
            />
            {uploadingLogo ? <span style={{ fontSize: 12, color: "#475569" }}>Uploading logo...</span> : null}
          </div>

          <h2 style={{ marginBottom: 0 }}>Contact Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
            <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Contact name" />
            <input value={form.contactRole} onChange={(e) => setForm({ ...form, contactRole: e.target.value })} placeholder="Contact role" />
            <input type="email" value={form.contactEmail} readOnly disabled placeholder="Contact email" />
            <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="Contact phone" />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => void handleValidateStripeReadiness()} disabled={validatingStripe}>
              {validatingStripe ? "Checking Stripe..." : "Validate Stripe Readiness"}
            </button>
            <button type="button" onClick={() => void handleSave()} disabled={saving || uploadingLogo}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          {stripeReadiness ? (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, fontSize: 12, color: "#475569" }}>
              <div>Ready: {stripeReadiness.ready ? "Yes" : "No"}</div>
              <div>Charges Enabled: {stripeReadiness.chargesEnabled ? "Yes" : "No"}</div>
              <div>Payouts Enabled: {stripeReadiness.payoutsEnabled ? "Yes" : "No"}</div>
              <div>Details Submitted: {stripeReadiness.detailsSubmitted ? "Yes" : "No"}</div>
              {stripeReadiness.disabledReason ? <div>Disabled Reason: {stripeReadiness.disabledReason}</div> : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
