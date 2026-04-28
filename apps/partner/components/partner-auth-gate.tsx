"use client"

import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/api-client"
import { getProfile } from "@/lib/partner-api"

const ROOT_SIGN_IN = process.env.NEXT_PUBLIC_ROOT_SIGNIN_URL || "http://localhost:3000/auth/sign-in"
const ROOT_ADMIN_URL = process.env.NEXT_PUBLIC_ROOT_ADMIN_URL || "http://localhost:3000/admin"
const ROOT_APP_URL = process.env.NEXT_PUBLIC_ROOT_APP_URL || "http://localhost:3000/app"

export function PartnerAuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    async function validate() {
      const token = getAuthToken()
      if (!token) {
        const next = encodeURIComponent(window.location.href)
        window.location.href = `${ROOT_SIGN_IN}?next=${next}`
        return
      }
      try {
        const profile = await getProfile()
        if (profile.role !== "retail_partner") {
          if (profile.role === "admin") {
            window.location.href = ROOT_ADMIN_URL
            return
          }
          setBlocked(true)
          setReady(true)
          return
        }
        setReady(true)
      } catch {
        const next = encodeURIComponent(window.location.href)
        window.location.href = `${ROOT_SIGN_IN}?next=${next}`
      }
    }
    void validate()
  }, [])

  if (!ready) return <div style={{ padding: 24, fontSize: 14 }}>Checking partner access...</div>
  if (blocked) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Partner access pending approval</h2>
          <p style={{ color: "#475569" }}>
            Your account is signed in, but partner access is not approved yet.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => (window.location.href = ROOT_APP_URL)}>Go to User App</button>
            <button onClick={() => (window.location.href = "http://localhost:3000/retail-partner")}>
              View Partner Registration
            </button>
          </div>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
