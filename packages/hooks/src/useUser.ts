"use client"

import { useEffect, useState } from "react"
import { apiRequest } from "@repo/lib/api"

type CurrentUser = {
  id: string
  email: string
  role: string
}

export function useUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    void apiRequest<{ data: CurrentUser }>("/api/auth/me")
      .then((res) => {
        if (!mounted) return
        setUser((res as { data?: CurrentUser }).data || null)
      })
      .catch(() => {
        if (!mounted) return
        setUser(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return { user, loading }
}
