"use client"

import { useEffect, useState } from "react"
import { setAuthToken } from "@/lib/api-client"

function resolveRoleRedirect(role: string | null) {
  if (role === "admin") return process.env.NEXT_PUBLIC_ROOT_ADMIN_URL || "/admin"
  if (role === "retail_partner") return process.env.NEXT_PUBLIC_ROOT_PARTNER_URL || "/partner"
  return process.env.NEXT_PUBLIC_ROOT_APP_URL || "/app"
}

export default function GoogleCallbackPage() {
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const role = params.get("role")
    const oauthError = params.get("error")

    if (oauthError) {
      setError(oauthError)
      return
    }
    if (!token) {
      setError("Google sign-in failed. Missing token.")
      return
    }
    setAuthToken(token)
    window.location.href = resolveRoleRedirect(role)
  }, [])

  return (
    <div style={{ maxWidth: 520, margin: "24px auto", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Google Sign-In</h1>
      <p style={{ marginTop: 0, color: "#64748b" }}>{error || "Completing sign-in..."}</p>
    </div>
  )
}
