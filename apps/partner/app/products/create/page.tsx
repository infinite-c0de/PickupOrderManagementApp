"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  createPartnerProduct,
  getMyRetailerLeads,
  getProductCategories,
  getPublicTimelineOptions,
  uploadProductImage,
  type ProductCategoryItem,
} from "@/lib/partner-api"

function categoryOptionLabel(item: ProductCategoryItem) {
  const prefix = item.depth > 0 ? `${"— ".repeat(item.depth)}` : ""
  return `${prefix}${item.name}`
}

export default function PartnerProductCreatePage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ProductCategoryItem[]>([])
  const [hasPartnerProfile, setHasPartnerProfile] = useState(false)
  const [availableMonthlyTimelines, setAvailableMonthlyTimelines] = useState<number[]>([])
  const [availableWeeklyTimelines, setAvailableWeeklyTimelines] = useState<number[]>([])
  const [monthlyTimelines, setMonthlyTimelines] = useState<number[]>([])
  const [weeklyTimelines, setWeeklyTimelines] = useState<number[]>([])
  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    imageUrl: "/placeholder-product.jpg",
    imageGallery: [] as string[],
    retailPrice: "",
    goalAmount: "",
    projectedPrice: "",
    fulfillmentType: "partner_ships",
    orderFulfillmentContactEmail: "",
    supportContactEmail: "",
    shippingRegions: "",
    shippingPolicyUrl: "",
    returnsPolicyUrl: "",
    warrantySummary: "",
    refundResponsibility: "partner",
    partnerPayout: "",
    fullPayEnabled: true,
    fullPayDiscountPercent: "0",
    visibility: "draft" as "published" | "draft",
  })

  useEffect(() => {
    void (async () => {
      try {
        const [leadItems, categoryItems, timelineItems] = await Promise.all([
          getMyRetailerLeads(),
          getProductCategories(),
          getPublicTimelineOptions(),
        ])
        setCategories(categoryItems)
        setHasPartnerProfile(Boolean(leadItems[0]))
        if (categoryItems[0]) setForm((prev) => ({ ...prev, categoryId: categoryItems[0].id }))
        setAvailableMonthlyTimelines(
          timelineItems
            .filter((item) => item.enabled && item.cadence === "monthly")
            .map((item) => item.months)
            .sort((a, b) => a - b),
        )
        setAvailableWeeklyTimelines(
          timelineItems
            .filter((item) => item.enabled && item.cadence === "weekly")
            .map((item) => item.months)
            .sort((a, b) => a - b),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load product form.")
      }
    })()
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    if (!hasPartnerProfile) {
      setError("Partner profile is required.")
      return
    }
    if (!form.categoryId) {
      setError("Category is required.")
      return
    }
    if (monthlyTimelines.length === 0 && weeklyTimelines.length === 0) {
      setError("Select at least one timeline.")
      return
    }
    setLoading(true)
    try {
      await createPartnerProduct({
        name: form.name,
        categoryId: form.categoryId,
        description: form.description,
        imageUrl: form.imageUrl,
        imageGallery: form.imageGallery,
        retailPrice: Number(form.retailPrice),
        goalAmount: Number(form.goalAmount),
        projectedPrice: Number(form.projectedPrice || form.goalAmount),
        fulfillmentType: form.fulfillmentType,
        orderFulfillmentContactEmail: form.orderFulfillmentContactEmail || undefined,
        supportContactEmail: form.supportContactEmail || undefined,
        shippingRegions: form.shippingRegions || undefined,
        shippingPolicyUrl: form.shippingPolicyUrl || undefined,
        returnsPolicyUrl: form.returnsPolicyUrl || undefined,
        warrantySummary: form.warrantySummary || undefined,
        refundResponsibility: form.refundResponsibility,
        partnerPayout: Number(form.partnerPayout || form.goalAmount),
        fullPayEnabled: form.fullPayEnabled,
        fullPayDiscountPercent: Number(form.fullPayDiscountPercent || 0),
        timelineMonthlyOptions: monthlyTimelines,
        timelineWeeklyOptions: weeklyTimelines,
        visibility: form.visibility,
      })
      router.push("/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create product.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href="/products"><button>Back to Products</button></Link>
      <h1 style={{ marginBottom: 6 }}>Add Product</h1>
      {!hasPartnerProfile ? (
        <p style={{ color: "#b45309" }}>No partner profile found yet. Complete your partner profile first.</p>
      ) : null}
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Product Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{categoryOptionLabel(category)}</option>
              ))}
            </select>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Primary image URL" />
            <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as "published" | "draft" })}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const fileList = event.target.files
              if (!fileList?.length) return
              void (async () => {
                try {
                  const uploaded = await Promise.all(Array.from(fileList).map((item) => uploadProductImage(item)))
                  const urls = uploaded.map((item) => item.url)
                  setForm((prev) => ({
                    ...prev,
                    imageGallery: [...prev.imageGallery, ...urls],
                    imageUrl: prev.imageGallery[0] || urls[0] || prev.imageUrl,
                  }))
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to upload selected images.")
                }
              })()
            }}
          />
        </section>

        <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Pricing & Timelines</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
            <input type="number" step="0.01" value={form.retailPrice} onChange={(e) => setForm({ ...form, retailPrice: e.target.value })} placeholder="Retail price" />
            <input type="number" step="0.01" value={form.goalAmount} onChange={(e) => setForm({ ...form, goalAmount: e.target.value })} placeholder="Goal amount" />
            <input type="number" step="0.01" value={form.projectedPrice} onChange={(e) => setForm({ ...form, projectedPrice: e.target.value })} placeholder="Projected price" />
            <input type="number" step="0.01" value={form.partnerPayout} onChange={(e) => setForm({ ...form, partnerPayout: e.target.value })} placeholder="Partner payout / wholesale" />
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={form.fullPayEnabled} onChange={(e) => setForm({ ...form, fullPayEnabled: e.target.checked })} />
            Enable Pay in Full option
          </label>
          <input type="number" step="0.01" min="0" max="100" value={form.fullPayDiscountPercent} onChange={(e) => setForm({ ...form, fullPayDiscountPercent: e.target.value })} placeholder="Pay in Full discount (%)" />
          <div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Monthly Timelines</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {availableMonthlyTimelines.map((timeline) => (
                <label key={timeline} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={monthlyTimelines.includes(timeline)}
                    onChange={(e) =>
                      setMonthlyTimelines((prev) =>
                        e.target.checked ? [...prev, timeline].sort((a, b) => a - b) : prev.filter((value) => value !== timeline),
                      )
                    }
                  />
                  {timeline}m
                </label>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Weekly Timelines</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {availableWeeklyTimelines.map((timeline) => (
                <label key={`w-${timeline}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={weeklyTimelines.includes(timeline)}
                    onChange={(e) =>
                      setWeeklyTimelines((prev) =>
                        e.target.checked ? [...prev, timeline].sort((a, b) => a - b) : prev.filter((value) => value !== timeline),
                      )
                    }
                  />
                  {timeline}w
                </label>
              ))}
            </div>
          </div>
        </section>

        <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Fulfillment & Policies</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
            <select value={form.fulfillmentType} onChange={(e) => setForm({ ...form, fulfillmentType: e.target.value })}>
              <option value="partner_ships">Partner ships</option>
              <option value="layver_ships">Layver ships</option>
            </select>
            <select value={form.refundResponsibility} onChange={(e) => setForm({ ...form, refundResponsibility: e.target.value })}>
              <option value="partner">Partner</option>
              <option value="layver">Layver</option>
              <option value="shared">Shared</option>
            </select>
            <input value={form.orderFulfillmentContactEmail} onChange={(e) => setForm({ ...form, orderFulfillmentContactEmail: e.target.value })} placeholder="Order/Fulfillment contact email" />
            <input value={form.supportContactEmail} onChange={(e) => setForm({ ...form, supportContactEmail: e.target.value })} placeholder="Support contact email" />
            <input value={form.shippingRegions} onChange={(e) => setForm({ ...form, shippingRegions: e.target.value })} placeholder="Shipping regions" />
            <input value={form.shippingPolicyUrl} onChange={(e) => setForm({ ...form, shippingPolicyUrl: e.target.value })} placeholder="Shipping policy URL" />
            <input value={form.returnsPolicyUrl} onChange={(e) => setForm({ ...form, returnsPolicyUrl: e.target.value })} placeholder="Returns policy URL" />
          </div>
          <textarea rows={3} value={form.warrantySummary} onChange={(e) => setForm({ ...form, warrantySummary: e.target.value })} placeholder="Warranty summary" />
        </section>

        <div>
          <button type="submit" disabled={loading || !hasPartnerProfile}>
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  )
}
