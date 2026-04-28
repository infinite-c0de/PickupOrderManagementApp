"use client"

import { useEffect, useMemo, useState } from "react"
import { getAdminUsers, type AdminUser } from "@/lib/admin-api"

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUser[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const users = await getAdminUsers()
        setRows(users.filter((u) => u.role === "buyer"))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load users.")
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return rows
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .filter((u) => statusFilter === "all" || u.status === statusFilter)
  }, [rows, search, statusFilter])

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Users</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>
        Buyer users migrated to dedicated admin app.
      </p>
      {error ? (
        <div style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 12 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", minWidth: 170 }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="blocked">Blocked</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Name", "Email", "Status", "Active Goals", "Completion", "Created"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{u.name}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{u.email}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9", textTransform: "capitalize" }}>{u.status}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{u.activeGoals}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{u.completionScore}%</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 16, color: "#64748b" }}>No users found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
