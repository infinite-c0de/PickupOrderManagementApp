"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getProductCategories, getPublicProducts, type Product, type ProductCategoryItem } from "@/lib/web-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value || 0)
}

export default function MarketplacePage() {
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")
    void Promise.all([
      getPublicProducts({ page: 1, pageSize: 24, search, categoryId: categoryId || undefined }),
      getProductCategories(),
    ])
      .then(([productsRes, categoriesRes]) => {
        setItems(productsRes.items)
        setCategories(categoriesRes)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load marketplace."))
      .finally(() => setLoading(false))
  }, [search, categoryId])

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Marketplace</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Browse products and create savings goals.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      {loading ? <p style={{ color: "#475569" }}>Loading products...</p> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
        {items.map((product) => (
          <Link key={product.id} href={`/marketplace/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{product.name}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{product.category?.name || "-"}</div>
              <div style={{ marginTop: 6 }}>{formatCurrency(Number(product.retailPrice))}</div>
              <div style={{ fontSize: 12, color: "#0369a1" }}>
                Goal: {formatCurrency(Number(product.goalAmount))} · Projected: {formatCurrency(Number(product.projectedPrice))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
