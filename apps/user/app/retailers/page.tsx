"use client"

import { useEffect, useState, type FormEvent } from "react"
import {
  createAuthenticatedRetailerLead,
  getMyRetailerLeads,
  getProfile,
  type RetailerLead,
} from "@/lib/user-api"

export default function RetailersPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [brand, setBrand] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [sellingRegions, setSellingRegions] = useState("")
  const [brandBio, setBrandBio] = useState("")
  const [logoImage, setLogoImage] = useState("")
  const [brandPrimaryColor, setBrandPrimaryColor] = useState("")
  const [brandSecondaryColor, setBrandSecondaryColor] = useState("")
  const [contentRightsConfirmed, setContentRightsConfirmed] = useState(false)
  const [displayPermissionConfirmed, setDisplayPermissionConfirmed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [leads, setLeads] = useState<RetailerLead[]>([])

  const isSubmitDisabled =
    !brand.trim() || !name.trim() || !sellingRegions.trim() || !contentRightsConfirmed || !displayPermissionConfirmed

  async function loadData() {
    try {
      const [profile, myLeads] = await Promise.all([getProfile(), getMyRetailerLeads()])
      setName(`${profile.firstName || ""} ${profile.lastName || ""}`.trim())
      setEmail(profile.email)
      setLeads(myLeads)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load retailer partner data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitDisabled) return
    setSubmitting(true)
    setError("")
    setSuccess("")
    try {
      await createAuthenticatedRetailerLead({
        brandName: brand.trim(),
        contactName: name.trim(),
        contactPhone: contactPhone.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        sellingRegions: sellingRegions.trim(),
        brandBio: brandBio.trim() || undefined,
        logoImage: logoImage.trim() || undefined,
        brandPrimaryColor: brandPrimaryColor.trim() || undefined,
        brandSecondaryColor: brandSecondaryColor.trim() || undefined,
        contentRightsConfirmed,
        displayPermissionConfirmed,
      })
      setSuccess("Retailer partner interest submitted.")
      setBrand("")
      setContactPhone("")
      setWebsiteUrl("")
      setSellingRegions("")
      setBrandBio("")
      setLogoImage("")
      setBrandPrimaryColor("")
      setBrandSecondaryColor("")
      setContentRightsConfirmed(false)
      setDisplayPermissionConfirmed(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit retailer interest.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Retailer Partners</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Submit and track retailer partner interest.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {success ? <p style={{ color: "#166534" }}>{success}</p> : null}
      {loading ? <p style={{ color: "#475569" }}>Loading...</p> : null}

      <form onSubmit={handleSubmit} style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12, marginBottom: 12, display: "grid", gap: 8 }}>
        <h2 style={{ marginTop: 0 }}>Submit Retailer Interest</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contact name" />
          <input value={email} readOnly disabled />
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand name" />
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Contact phone (optional)" />
          <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="Website URL (optional)" />
          <input value={sellingRegions} onChange={(e) => setSellingRegions(e.target.value)} placeholder="Selling regions (comma-separated)" />
          <input value={logoImage} onChange={(e) => setLogoImage(e.target.value)} placeholder="Logo image URL (optional)" />
          <input value={brandPrimaryColor} onChange={(e) => setBrandPrimaryColor(e.target.value)} placeholder="Primary color (optional)" />
          <input value={brandSecondaryColor} onChange={(e) => setBrandSecondaryColor(e.target.value)} placeholder="Secondary color (optional)" />
        </div>
        <textarea
          rows={3}
          value={brandBio}
          onChange={(e) => setBrandBio(e.target.value)}
          placeholder="Brand bio (optional)"
        />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={contentRightsConfirmed}
            onChange={(e) => setContentRightsConfirmed(e.target.checked)}
          />
          I confirm rights to submitted content.
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={displayPermissionConfirmed}
            onChange={(e) => setDisplayPermissionConfirmed(e.target.checked)}
          />
          I approve Layver displaying this brand information.
        </label>
        <button type="submit" disabled={isSubmitDisabled || submitting}>
          {submitting ? "Submitting..." : "Submit Retailer Interest"}
        </button>
      </form>

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>My Retailer Leads</h2>
        {leads.length === 0 ? (
          <p style={{ color: "#64748b" }}>No submissions yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {leads.map((lead) => (
              <div key={lead.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
                <strong>{lead.brandName || "Unnamed brand"}</strong>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {lead.sellingRegions || "No region"} · {new Date(lead.createdAt).toLocaleDateString()}
                </div>
                <div style={{ fontSize: 12, color: "#0369a1" }}>{lead.user?.status || "pending"}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
