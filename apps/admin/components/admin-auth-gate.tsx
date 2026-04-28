"use client"

import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/api-client"
import { getProfile } from "@/lib/admin-api"

const ROOT_SIGN_IN =
  process.env.NEXT_PUBLIC_ROOT_SIGNIN_URL || "http://localhost:3000/auth/sign-in"

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

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
        if (profile.role !== "admin") {
          window.location.href = process.env.NEXT_PUBLIC_ROOT_APP_URL || "http://localhost:3000/app"
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

  if (!ready) return <div style={{ padding: 24, fontSize: 14 }}>Checking admin access...</div>
  return <>{children}</>
}
