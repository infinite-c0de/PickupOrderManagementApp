"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getPublicBlogPosts, type BlogPostListItem } from "@/lib/web-api"

export default function BlogPage() {
  const [items, setItems] = useState<BlogPostListItem[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    void getPublicBlogPosts({ page: 1, pageSize: 24 })
      .then((response) => setItems(response.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load blog posts."))
  }, [])

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Blog</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Layver updates, savings guidance, and platform news.</p>
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{post.title}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{post.excerpt || "No excerpt."}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
