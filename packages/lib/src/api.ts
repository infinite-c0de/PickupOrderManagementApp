import { API_BASE_URL } from "./constants"
import { getAuthToken } from "./auth"

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {})
  const token = getAuthToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  })
  const payload = (await res.json().catch(() => ({}))) as T & { message?: string }
  if (!res.ok) {
    throw new Error(payload?.message || "Request failed")
  }
  return payload
}
