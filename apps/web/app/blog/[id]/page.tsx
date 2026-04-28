"use client"

import Link from "next/link"
import { use } from "react"
import { useEffect, useState } from "react"
import { getPublicBlogPostBySlug, type BlogPost } from "@/lib/web-api"

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    void getPublicBlogPostBySlug(id)
      .then((response) => setPost(response))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load blog post."))
  }, [id])

  if (error) return <p style={{ color: "#b91c1c" }}>{error}</p>
  if (!post) return <p style={{ color: "#475569" }}>Loading post...</p>

  return (
    <div>
      <Link href="/blog"><button>Back to Blog</button></Link>
      <h1 style={{ marginBottom: 6 }}>{post.title}</h1>
      <p style={{ marginTop: 0, color: "#64748b" }}>
        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}
      </p>
      <article style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12, whiteSpace: "pre-wrap" }}>
        {post.content}
      </article>
    </div>
  )
}
