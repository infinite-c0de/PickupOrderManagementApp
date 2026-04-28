"use client"

import Link from "next/link"
import { useState } from "react"
import { requestPasswordReset } from "@/lib/api-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    if (!email.trim()) {
      setError("Please enter your email.")
      return
    }
    setLoading(true)
    void requestPasswordReset(email.trim())
      .then(() => setSent(true))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to request password reset."))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ maxWidth: 480, margin: "24px auto", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Forgot Password</h1>
      <p style={{ marginTop: 0, color: "#64748b" }}>We will send a reset link if this email is registered.</p>
      {sent ? <p style={{ color: "#166534" }}>Reset email sent.</p> : null}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        {error ? <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
        <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
      </form>
      <div style={{ marginTop: 10 }}>
        <Link href="/auth/sign-in">Back to sign in</Link>
      </div>
    </div>
  )
}
