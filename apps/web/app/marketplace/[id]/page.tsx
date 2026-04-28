"use client"

import Link from "next/link"
import { use } from "react"
import { useEffect, useState } from "react"
import { getPublicProductById, type Product } from "@/lib/web-api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value || 0)
}

export default function MarketplaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    void getPublicProductById(id)
      .then((response) => setProduct(response))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load product."))
  }, [id])

  if (error) return <p style={{ color: "#b91c1c" }}>{error}</p>
  if (!product) return <p style={{ color: "#475569" }}>Loading product...</p>

  return (
    <div>
      <Link href="/marketplace"><button>Back to Marketplace</button></Link>
      <h1 style={{ marginBottom: 6 }}>{product.name}</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>{product.category?.name || "Uncategorized"}</p>
      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        <p>{product.description}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Retail Price</div>
            <strong>{formatCurrency(Number(product.retailPrice))}</strong>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Goal Amount</div>
            <strong>{formatCurrency(Number(product.goalAmount))}</strong>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Projected Better Price</div>
            <strong>{formatCurrency(Number(product.projectedPrice))}</strong>
          </div>
        </div>
      </section>
      <div style={{ marginTop: 10 }}>
        <Link href="/auth/sign-up"><button>Start Saving for this Product</button></Link>
      </div>
    </div>
  )
}
