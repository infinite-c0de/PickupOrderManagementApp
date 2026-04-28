"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  createProductCategory,
  deleteProductCategory,
  getAdminCategoryItems,
  updateProductCategory,
  type ProductCategoryItem,
} from "@/lib/admin-api"

export default function ProductCategoriesPage() {
  const [rows, setRows] = useState<ProductCategoryItem[]>([])
  const [newName, setNewName] = useState("")
  const [newParentId, setNewParentId] = useState("none")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        setRows(await getAdminCategoryItems())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load categories.")
      }
    })()
  }, [])

  async function addCategory() {
    if (!newName.trim()) return
    setSaving(true)
    setError("")
    try {
      const updated = await createProductCategory({
        name: newName.trim(),
        parentId: newParentId === "none" ? undefined : newParentId,
      })
      setRows(updated)
      setNewName("")
      setNewParentId("none")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add category.")
    } finally {
      setSaving(false)
    }
  }

  async function renameCategory(item: ProductCategoryItem) {
    const next = window.prompt("Rename category:", item.name)
    if (!next || !next.trim()) return
    setError("")
    try {
      setRows(await updateProductCategory(item.id, { name: next.trim(), parentId: item.parentId || undefined }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update category.")
    }
  }

  async function removeCategory(id: string) {
    if (!window.confirm("Delete this category?")) return
    setError("")
    try {
      setRows(await deleteProductCategory(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete category.")
    }
  }

  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        <Link href="/products">← Back to Products</Link>
      </p>
      <h1 style={{ marginBottom: 6 }}>Manage Product Categories</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Add, update, and delete categories.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 220px auto", marginBottom: 14 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Category name"
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
        <select
          value={newParentId}
          onChange={(e) => setNewParentId(e.target.value)}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        >
          <option value="none">No parent</option>
          {rows.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button onClick={() => void addCategory()} disabled={saving}>
          {saving ? "Adding..." : "Add"}
        </button>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Name", "Depth", "Children", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{`${"— ".repeat(r.depth)}${r.name}`}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.depth}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{r.childCount}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  <button onClick={() => void renameCategory(r)} style={{ marginRight: 8 }}>Rename</button>
                  <button onClick={() => void removeCategory(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 16, color: "#64748b" }}>No categories found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
