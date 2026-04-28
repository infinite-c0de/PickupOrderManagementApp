"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { resendVerificationEmail, verifyEmailToken } from "@/lib/api-client"

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("")
  const [verified, setVerified] = useState(false)
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const queryEmail = params.get("email")
    if (queryEmail) setEmail(queryEmail)
    if (!token) return
    setLoading(true)
    void verifyEmailToken(token)
      .then(() => {
        setVerified(true)
        setError("")
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to verify email."))
      .finally(() => setLoading(false))
  }, [])

  function handleResend() {
    if (!email.trim()) {
      setError("Email is required to resend verification.")
      return
    }
    setLoading(true)
    setError("")
    void resendVerificationEmail(email.trim())
      .then(() => setResent(true))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to resend verification."))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ maxWidth: 520, margin: "24px auto", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Verify Email</h1>
      <p style={{ marginTop: 0, color: "#64748b" }}>
        {verified ? "Your email has been verified. You can sign in now." : "Check your inbox for verification link."}
      </p>
      {email ? <p style={{ color: "#64748b" }}>Email: {email}</p> : null}
      {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
      {resent ? <p style={{ color: "#166534" }}>Verification email resent successfully.</p> : null}
      {!verified && !resent ? (
        <button onClick={handleResend} disabled={loading}>{loading ? "Sending..." : "Resend Verification Email"}</button>
      ) : null}
      <div style={{ marginTop: 10 }}>
        <Link href="/auth/sign-in">Back to sign in</Link>
      </div>
    </div>
  )
}
