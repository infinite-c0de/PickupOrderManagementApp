"use client"

import { useEffect, useMemo, useState } from "react"
import {
  getAdminRetailers,
  updateAdminRetailerLeadStatus,
  validateAdminRetailerStripeReadiness,
  type RetailerLead,
  type StripeAccountReadiness,
} from "@/lib/admin-api"

type RetailerAccessStatus = "active" | "blocked" | "rejected"

function leadStatus(lead: RetailerLead): RetailerAccessStatus {
  const status = lead.user?.status
  if (status === "active" || status === "blocked" || status === "rejected") return status
  return "blocked"
}

export default function AdminRetailersPage() {
  const [rows, setRows] = useState<RetailerLead[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState("")
  const [validatingId, setValidatingId] = useState("")
  const [readinessMap, setReadinessMap] = useState<Record<string, StripeAccountReadiness>>({})

  useEffect(() => {
    void (async () => {
      try {
        setRows(await getAdminRetailers())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load retailers.")
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return rows
      .filter((r) => {
        if (!q) return true
        return (
          (r.brandName || "").toLowerCase().includes(q) ||
          (r.contactName || "").toLowerCase().includes(q) ||
          (r.user?.email || "").toLowerCase().includes(q)
        )
      })
      .filter((r) => statusFilter === "all" || leadStatus(r) === statusFilter)
  }, [rows, search, statusFilter])

  async function updateStatus(id: string, status: RetailerAccessStatus) {
    setUpdatingId(id)
    setError("")
    try {
      const updated = await updateAdminRetailerLeadStatus(id, { status })
      setRows((prev) => prev.map((item) => (item.id === id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update retailer.")
    } finally {
      setUpdatingId("")
    }
  }

  async function checkStripe(id: string) {
    setValidatingId(id)
    setError("")
    try {
      const readiness = await validateAdminRetailerStripeReadiness(id)
      setReadinessMap((prev) => ({ ...prev, [id]: readiness }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to validate Stripe readiness.")
    } finally {
      setValidatingId("")
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Retailer Leads</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Manage access permissions and Stripe readiness.</p>
      {error ? (
        <div style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 12 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brand/contact/email"
          style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", minWidth: 170 }}
        >
          {["all", "active", "blocked", "rejected"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 1100, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Contact", "Brand", "Role", "Location", "Status", "Stripe Ready", "Access", "Submitted"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  {(r.contactName || "-")}<br />
                  <span style={{ color: "#64748b", fontSize: 12 }}>{r.user?.email || "-"}</span>
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.brandName || "-"}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.contactRole || "-"}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.sellingRegions || "-"}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{leadStatus(r)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span>{readinessMap[r.id]?.ready ? "Ready" : "Not checked"}</span>
                    <button onClick={() => void checkStripe(r.id)} disabled={validatingId === r.id}>
                      {validatingId === r.id ? "Checking..." : "Check"}
                    </button>
                  </div>
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  <select
                    value={leadStatus(r)}
                    onChange={(e) => void updateStatus(r.id, e.target.value as RetailerAccessStatus)}
                    disabled={updatingId === r.id}
                    style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 8px" }}
                  >
                    <option value="active">Allow</option>
                    <option value="blocked">Block</option>
                    <option value="rejected">Reject</option>
                  </select>
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 16, color: "#64748b" }}>No retailer leads found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
