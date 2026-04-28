"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  getAdminCategoryItems,
  getAdminProductById,
  getAdminRetailers,
  updateAdminProduct,
  type ProductCategoryItem,
  type RetailerLead,
} from "@/lib/admin-api"

export default function ProductEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const productId = params?.id
  const [categories, setCategories] = useState<ProductCategoryItem[]>([])
  const [retailers, setRetailers] = useState<RetailerLead[]>([])
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    userId: "",
    description: "",
    imageUrl: "",
    retailPrice: "",
    goalAmount: "",
    projectedPrice: "",
    partnerPayout: "",
    visibility: "published" as "published" | "draft",
  })

  useEffect(() => {
    if (!productId) return
    void (async () => {
      try {
        const [cats, leads, product] = await Promise.all([
          getAdminCategoryItems(),
          getAdminRetailers(),
          getAdminProductById(productId),
        ])
        setCategories(cats)
        setRetailers(leads)
        if (!product) {
          setError("Product not found.")
          return
        }
        setForm({
          name: product.name,
          categoryId: product.category?.id || product.categoryId || cats[0]?.id || "",
          userId: product.userId || "",
          description: product.description || "",
          imageUrl: product.imageUrl || "",
          retailPrice: String(product.retailPrice || ""),
          goalAmount: String(product.goalAmount || ""),
          projectedPrice: String(product.projectedPrice || ""),
          partnerPayout: String(product.partnerPayout || ""),
          visibility: product.visibility || "published",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load product.")
      } finally {
        setLoading(false)
      }
    })()
  }, [productId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId) return
    setSaving(true)
    setError("")
    try {
      await updateAdminProduct(productId, {
        name: form.name,
        categoryId: form.categoryId,
        userId: form.userId || null,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        retailPrice: Number(form.retailPrice || 0),
        goalAmount: Number(form.goalAmount || 0),
        projectedPrice: Number(form.projectedPrice || form.goalAmount || 0),
        partnerPayout: Number(form.partnerPayout || form.goalAmount || 0),
        visibility: form.visibility,
      })
      router.push("/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update product.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        <Link href="/products">← Back to Products</Link>
      </p>
      <h1 style={{ marginBottom: 6 }}>Edit Product</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Baseline migrated edit flow.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

      <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 760 }}>
        <input placeholder="Product name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} required>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={form.userId || "unassigned"} onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value === "unassigned" ? "" : e.target.value }))}>
          <option value="unassigned">Unassigned Retailer</option>
          {retailers.filter((r) => r.user?.id).map((r) => (
            <option key={r.user!.id} value={r.user!.id}>{(r.brandName || "Unnamed")} ({r.user?.email || "-"})</option>
          ))}
        </select>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={5} />
        <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
        <input type="number" step="0.01" placeholder="Retail price" value={form.retailPrice} onChange={(e) => setForm((p) => ({ ...p, retailPrice: e.target.value }))} required />
        <input type="number" step="0.01" placeholder="Goal amount" value={form.goalAmount} onChange={(e) => setForm((p) => ({ ...p, goalAmount: e.target.value }))} required />
        <input type="number" step="0.01" placeholder="Projected price" value={form.projectedPrice} onChange={(e) => setForm((p) => ({ ...p, projectedPrice: e.target.value }))} />
        <input type="number" step="0.01" placeholder="Partner payout" value={form.partnerPayout} onChange={(e) => setForm((p) => ({ ...p, partnerPayout: e.target.value }))} />
        <select value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value as "published" | "draft" }))}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
      </form>
    </div>
  )
}
