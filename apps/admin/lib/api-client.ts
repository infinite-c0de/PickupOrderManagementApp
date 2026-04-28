"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
const AUTH_TOKEN_KEY = "layver.auth.token"
const AUTH_COOKIE_KEY = "layver.auth.token.cookie"

export function getAuthToken() {
  if (typeof window === "undefined") return ""
  const sessionToken = window.sessionStorage.getItem(AUTH_TOKEN_KEY) || ""
  if (sessionToken) return sessionToken

  const cookieToken = readCookie(AUTH_COOKIE_KEY)
  if (cookieToken) {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, cookieToken)
    return cookieToken
  }
  return ""
}

function readCookie(key: string) {
  if (typeof document === "undefined") return ""
  const pair = document.cookie
    .split(";")
    .map((v) => v.trim())
    .find((item) => item.startsWith(`${key}=`))
  if (!pair) return ""
  return decodeURIComponent(pair.slice(key.length + 1))
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {})
  const token = getAuthToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const normalizedPath = path.startsWith("/api/") ? `/${path.slice(5)}` : path
  const res = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
    cache: "no-store",
  })
  const payload = (await res.json().catch(() => ({}))) as T & { message?: string; data?: T }
  if (!res.ok) {
    throw new Error(payload?.message || "Request failed")
  }
  return (payload.data as T) || (payload as T)
}
