"use client"

import { useMemo } from "react"
import { useUser } from "./useUser"

export function usePermissions() {
  const { user, loading } = useUser()
  const permissions = useMemo(
    () => ({
      isAdmin: user?.role === "admin",
      isBuyer: user?.role === "buyer",
      isPartner: user?.role === "retail_partner",
    }),
    [user],
  )
  return { ...permissions, loading }
}
