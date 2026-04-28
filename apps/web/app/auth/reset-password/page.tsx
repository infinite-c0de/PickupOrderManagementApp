"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { resetPasswordWithToken } from "@/lib/api-client"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setToken(params.get("token") || "")
    }
  }, [])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    if (!token) {
      setError("Reset token is missing or invalid.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    void resetPasswordWithToken(token, password)
      .then(() => setDone(true))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to reset password."))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ maxWidth: 480, margin: "24px auto", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Reset Password</h1>
      {done ? (
        <>
          <p style={{ color: "#166534" }}>Password updated successfully.</p>
          <Link href="/auth/sign-in">Go to sign in</Link>
        </>
      ) : (
        <>
          <p style={{ marginTop: 0, color: "#64748b" }}>Set your new password.</p>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            {error ? <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
            <button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
          </form>
        </>
      )}
    </div>
  )
}
