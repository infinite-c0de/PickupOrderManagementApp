"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  createAdminBlogPost,
  getAdminBlogCategoryItems,
  type BlogCategoryItem,
} from "@/lib/admin-api"

export default function BlogCreatePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<BlogCategoryItem[]>([])
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    coverImageUrl: "",
    categoryIds: [] as string[],
    content: "",
    featured: false,
    published: true,
  })

  useEffect(() => {
    void (async () => {
      try {
        setCategories(await getAdminBlogCategoryItems())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load categories.")
      }
    })()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.")
      return
    }
    setSaving(true)
    setError("")
    try {
      await createAdminBlogPost({
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content.trim(),
        coverImageUrl: form.coverImageUrl.trim() || undefined,
        categories: form.categoryIds,
        featured: form.featured,
        published: form.published,
      })
      router.push("/blog")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create blog post.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        <Link href="/blog">← Back to Blog</Link>
      </p>
      <h1 style={{ marginBottom: 6 }}>Create Blog Post</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Baseline migrated create flow.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}

      <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 820 }}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
        />
        <textarea
          placeholder="Excerpt"
          value={form.excerpt}
          onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
          rows={2}
        />
        <input
          placeholder="Cover image URL"
          value={form.coverImageUrl}
          onChange={(e) => setForm((p) => ({ ...p, coverImageUrl: e.target.value }))}
        />
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Categories</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 8 }}>
            {categories.map((c) => (
              <label key={c.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={form.categoryIds.includes(c.id)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryIds: e.target.checked
                        ? [...prev.categoryIds, c.id]
                        : prev.categoryIds.filter((item) => item !== c.id),
                    }))
                  }
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          rows={12}
          required
        />
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
          Featured
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={form.published} onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))} />
          Published
        </label>
        <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Blog"}</button>
      </form>
    </div>
  )
}
