"use client"

import Link from "next/link"
import { useState } from "react"
import { getGoogleOAuthUrl, setAuthToken, signIn } from "@/lib/api-client"

function resolvePostLoginUrl(role: "admin" | "buyer" | "retail_partner") {
  if (role === "admin") return process.env.NEXT_PUBLIC_ROOT_ADMIN_URL || "/admin"
  if (role === "retail_partner") return process.env.NEXT_PUBLIC_ROOT_PARTNER_URL || "/partner"
  return process.env.NEXT_PUBLIC_ROOT_APP_URL || "/app"
}

function isAllowedNextUrl(raw: string) {
  try {
    const nextUrl = new URL(raw)
    const current = window.location
    const nextHost = nextUrl.hostname.toLowerCase()
    const currentHost = current.hostname.toLowerCase()
    const sameHost = nextHost === currentHost
    const localhostFamily =
      (currentHost === "localhost" || currentHost.endsWith(".localhost")) &&
      (nextHost === "localhost" || nextHost.endsWith(".localhost"))
    const lvhFamily =
      (currentHost === "lvh.me" || currentHost.endsWith(".lvh.me")) &&
      (nextHost === "lvh.me" || nextHost.endsWith(".lvh.me"))
    return nextUrl.protocol === current.protocol && (sameHost || localhostFamily || lvhFamily)
  } catch {
    return false
  }
}

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }
    setLoading(true)
    try {
      const response = await signIn(email, password)
      setAuthToken(response.token)

      const nextRaw = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") || "" : ""
      if (nextRaw && isAllowedNextUrl(nextRaw)) {
        const nextUrl = new URL(nextRaw)
        const isLocalTransfer =
          (window.location.hostname === "localhost" || window.location.hostname.endsWith(".localhost") || window.location.hostname === "lvh.me" || window.location.hostname.endsWith(".lvh.me")) &&
          (nextUrl.hostname.endsWith(".localhost") || nextUrl.hostname.endsWith(".lvh.me"))
        if (isLocalTransfer && !nextUrl.searchParams.get("__layverToken")) {
          nextUrl.searchParams.set("__layverToken", response.token)
        }
        window.location.href = nextUrl.toString()
        return
      }

      window.location.href = resolvePostLoginUrl(response.userInfo.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "24px auto", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Sign in</h1>
      <p style={{ marginTop: 0, color: "#64748b" }}>Access your Layver account.</p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {error ? <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
        <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        <button type="button" onClick={() => { window.location.href = getGoogleOAuthUrl() }}>
          Continue with Google
        </button>
      </form>
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/auth/forgot-password">Forgot password?</Link>
        <Link href="/auth/sign-up">Create account</Link>
      </div>
    </div>
  )
}
