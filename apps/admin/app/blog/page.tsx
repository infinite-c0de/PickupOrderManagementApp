"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  deleteAdminBlogPost,
  getAdminBlogTableRows,
  type BlogAdminTableRow,
  type BlogCategoryItem,
} from "@/lib/admin-api"

export default function AdminBlogPage() {
  const pageSize = 20
  const [rows, setRows] = useState<BlogAdminTableRow[]>([])
  const [categories, setCategories] = useState<BlogCategoryItem[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const res = await getAdminBlogTableRows({
          page,
          pageSize,
          search,
          categoryId: categoryFilter,
          status: statusFilter,
        })
        setRows(res.items)
        setCategories(res.categories)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load blog posts.")
      }
    })()
  }, [page, pageSize, search, categoryFilter, statusFilter])

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this blog post?")) return
    setDeletingId(id)
    setError("")
    try {
      await deleteAdminBlogPost(id)
      setRows((prev) => prev.filter((item) => item.id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete blog post.")
    } finally {
      setDeletingId("")
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Blog Management</h1>
          <p style={{ marginTop: 0, color: "#475569" }}>{total} posts in blog</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/blog/categories">Manage Categories</Link>
          <Link href="/blog/create">Add Blog</Link>
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
          placeholder="Search posts"
          style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setPage(1)
            setCategoryFilter(e.target.value)
          }}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", minWidth: 220 }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1)
            setStatusFilter(e.target.value as "all" | "published" | "draft")
          }}
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", minWidth: 180 }}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Title", "Category", "Published", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((post) => (
              <tr key={post.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  {post.title}
                  <div style={{ color: "#64748b", fontSize: 12 }}>/ {post.slug}</div>
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{post.category || "-"}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  {post.publishedDate ? new Date(post.publishedDate).toLocaleDateString() : "-"}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{post.status}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                  <Link href={`/blog/${post.id}/edit`} style={{ marginRight: 8 }}>Edit</Link>
                  <button onClick={() => void handleDelete(post.id)} disabled={deletingId === post.id}>
                    {deletingId === post.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 16, color: "#64748b" }}>No blog posts found.</td></tr>
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
