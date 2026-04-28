"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  createAdminBlogCategory,
  deleteAdminBlogCategory,
  getAdminBlogCategoryTable,
  updateAdminBlogCategory,
  type BlogCategoryItem,
} from "@/lib/admin-api"

export default function BlogCategoriesPage() {
  const pageSize = 20
  const [rows, setRows] = useState<BlogCategoryItem[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState("")
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await getAdminBlogCategoryTable({ page, pageSize, search })
        setRows(res.items)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load categories.")
      }
    })()
  }, [page, pageSize, search])

  async function addCategory() {
    if (!newName.trim()) return
    setSaving(true)
    setError("")
    try {
      await createAdminBlogCategory({ name: newName.trim() })
      setNewName("")
      const res = await getAdminBlogCategoryTable({ page, pageSize, search })
      setRows(res.items)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add category.")
    } finally {
      setSaving(false)
    }
  }

  async function renameCategory(item: BlogCategoryItem) {
    const next = window.prompt("Rename category:", item.name)
    if (!next || !next.trim()) return
    setError("")
    try {
      await updateAdminBlogCategory(item.id, { name: next.trim() })
      const res = await getAdminBlogCategoryTable({ page, pageSize, search })
      setRows(res.items)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update category.")
    }
  }

  async function removeCategory(id: string) {
    if (!window.confirm("Delete this category?")) return
    setError("")
    try {
      await deleteAdminBlogCategory(id)
      const res = await getAdminBlogCategoryTable({ page, pageSize, search })
      setRows(res.items)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete category.")
    }
  }

  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        <Link href="/blog">← Back to Blog</Link>
      </p>
      <h1 style={{ marginBottom: 6 }}>Manage Blog Categories</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Create, update, and delete blog categories.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr auto", marginBottom: 12 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
        <button onClick={() => void addCategory()} disabled={saving}>
          {saving ? "Adding..." : "Add"}
        </button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          placeholder="Search categories"
          style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Category", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.name}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  <button onClick={() => void renameCategory(r)} style={{ marginRight: 8 }}>Rename</button>
                  <button onClick={() => void removeCategory(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: 16, color: "#64748b" }}>No categories found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ color: "#64748b", fontSize: 12 }}>Showing {rows.length} of {total} (Page {page}/{totalPages})</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>Next</button>
        </div>
      </div>
    </div>
  )
}
