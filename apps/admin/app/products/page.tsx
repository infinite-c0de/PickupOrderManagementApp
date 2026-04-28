"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  deleteAdminProduct,
  getAdminCategoryItems,
  getAdminProducts,
  type Product,
  type ProductCategoryItem,
} from "@/lib/admin-api"

export default function AdminProductsPage() {
  const pageSize = 20
  const [rows, setRows] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
  const [categories, setCategories] = useState<ProductCategoryItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getAdminProducts({
            page,
            pageSize,
            search,
            categoryId: categoryFilter,
            status: statusFilter,
          }),
          getAdminCategoryItems(),
        ])
        setRows(productsRes.items)
        setTotal(productsRes.total)
        setTotalPages(productsRes.totalPages)
        setCategories(categoriesRes)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load products.")
      }
    })()
  }, [page, pageSize, search, categoryFilter, statusFilter])

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product?")) return
    setDeletingId(id)
    setError("")
    try {
      await deleteAdminProduct(id)
      setRows((prev) => prev.filter((item) => item.id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete product.")
    } finally {
      setDeletingId("")
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Product Management</h1>
          <p style={{ marginTop: 0, color: "#475569" }}>{total} products in catalog</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/products/categories">Manage Categories</Link>
          <Link href="/products/create">Add Product</Link>
        </div>
      </div>
      {error ? (
        <div style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 12, marginBottom: 10 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          placeholder="Search products"
          style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setPage(1)
            setCategoryFilter(e.target.value)
          }}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", minWidth: 200 }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1)
            setStatusFilter(e.target.value as "all" | "published" | "draft")
          }}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", minWidth: 160 }}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 980, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Product", "Category", "Partner", "Retail Price", "Goal Amount", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{p.name}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{p.category?.name || "-"}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{p.retailerName || "-"}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>${Number(p.retailPrice || 0).toFixed(2)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>${Number(p.goalAmount || 0).toFixed(2)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{p.visibility}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  <Link href={`/products/${p.id}/edit`} style={{ marginRight: 8 }}>Edit</Link>
                  <button onClick={() => void handleDelete(p.id)} disabled={deletingId === p.id}>
                    {deletingId === p.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 16, color: "#64748b" }}>No products found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ color: "#64748b", fontSize: 12 }}>Page {page} of {totalPages}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>Next</button>
        </div>
      </div>
    </div>
  )
}
