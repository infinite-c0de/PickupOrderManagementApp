"use client"

import Link from "next/link"
import { useState } from "react"
import { signUp } from "@/lib/api-client"

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setNotice("")
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill all required fields.")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!agreed) {
      setError("You must accept terms and privacy.")
      return
    }

    setLoading(true)
    const [firstName, ...lastNameParts] = form.name.trim().split(" ")
    const lastName = lastNameParts.join(" ") || "User"
    try {
      const response = await signUp({
        email: form.email.trim(),
        firstName: firstName || "Layver",
        lastName,
        password: form.password,
      })
      if (response.requiresEmailVerification) {
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(response.email)}`
        return
      }
      setNotice("Account created successfully. You can sign in now.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "24px auto", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Create account</h1>
      <p style={{ marginTop: 0, color: "#64748b" }}>Start your savings journey.</p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (min 8 chars)" />
        <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm password" />
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>I agree to <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy</Link></span>
        </label>
        {error ? <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p> : null}
        {notice ? <p style={{ color: "#166534", margin: 0 }}>{notice}</p> : null}
        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
      </form>
      <div style={{ marginTop: 10 }}>
        <Link href="/auth/sign-in">Already have an account? Sign in</Link>
      </div>
    </div>
  )
}
