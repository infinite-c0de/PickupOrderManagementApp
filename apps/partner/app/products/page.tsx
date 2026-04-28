"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { getPartnerProducts, type Product } from "@/lib/partner-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export default function PartnerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const response = await getPartnerProducts()
        setProducts(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load products.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(
    () =>
      products.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.category?.name || "").toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  )

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>My Products</h1>
          <p style={{ marginTop: 0, color: "#475569" }}>{products.length} products</p>
        </div>
        <Link href="/products/create"><button>Add Product</button></Link>
      </div>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products..."
        style={{ marginBottom: 10 }}
      />
      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        {loading ? <p style={{ color: "#475569" }}>Loading products...</p> : null}
        {!loading && filtered.length === 0 ? <p style={{ color: "#64748b" }}>No products found.</p> : null}
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map((product) => (
            <div key={product.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <strong>{product.name}</strong>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{product.category?.name || "-"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>{formatCurrency(Number(product.retailPrice))}</div>
                  <div style={{ fontSize: 12, color: "#0369a1" }}>{product.visibility}</div>
                </div>
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                <Link href={`/products/${product.id}/edit`}><button>Edit</button></Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
