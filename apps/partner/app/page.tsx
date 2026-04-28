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

export default function PartnerHomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const response = await getPartnerProducts()
        setProducts(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load partner dashboard.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const stats = useMemo(() => {
    const totalRevenue = products.reduce((sum, item) => sum + Number(item.partnerPayout || 0), 0)
    const publishedCount = products.filter((item) => item.visibility === "published").length
    const draftCount = products.filter((item) => item.visibility === "draft").length
    return { totalRevenue, publishedCount, draftCount }
  }, [products])

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Partner Overview</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Manage product listings and partner profile details.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {loading ? <p style={{ color: "#475569" }}>Loading dashboard...</p> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10, marginBottom: 14 }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Products</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{products.length}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Published</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.publishedCount}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Draft</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.draftCount}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Potential Payout Sum</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(stats.totalRevenue)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Link href="/products"><button>Manage Products</button></Link>
        <Link href="/products/create"><button>Add Product</button></Link>
        <Link href="/profile"><button>Partner Profile</button></Link>
      </div>

      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Recent Products</h2>
        {products.length === 0 ? (
          <p style={{ color: "#64748b" }}>No products yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {products.slice(0, 5).map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{item.category?.name || "No category"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>{formatCurrency(Number(item.retailPrice))}</div>
                  <div style={{ fontSize: 12, color: "#0369a1" }}>{item.visibility}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
