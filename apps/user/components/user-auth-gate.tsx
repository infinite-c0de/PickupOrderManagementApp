"use client"

import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/api-client"
import { getProfile } from "@/lib/user-api"

const ROOT_SIGN_IN = process.env.NEXT_PUBLIC_ROOT_SIGNIN_URL || "http://localhost:3000/auth/sign-in"
const ROOT_ADMIN_URL = process.env.NEXT_PUBLIC_ROOT_ADMIN_URL || "http://localhost:3000/admin"

export function UserAuthGate({ children }: { children: React.ReactNode }) {
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
        if (profile.role === "admin") {
          window.location.href = ROOT_ADMIN_URL
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

  if (!ready) return <div style={{ padding: 24, fontSize: 14 }}>Checking account access...</div>
  return <>{children}</>
}
