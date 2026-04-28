export type ApiEnvelope<T> = {
  data: T
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
const AUTH_TOKEN_KEY = "layver.auth.token"
const AUTH_COOKIE_KEY = "layver.auth.token.cookie"
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || "120000")

export function getGoogleOAuthUrl() {
  return `${API_BASE_URL}/auth/google`
}

export function getAuthToken() {
  if (typeof window === "undefined") return ""
  const sessionToken = window.sessionStorage.getItem(AUTH_TOKEN_KEY) || ""
  if (sessionToken) return sessionToken
  const cookieToken = getAuthCookie()
  if (cookieToken) {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, cookieToken)
    return cookieToken
  }
  return ""
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  setAuthCookie(token)
}

export function clearAuthToken() {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
  clearAuthCookie()
}

function resolveRootDomain(hostname: string) {
  const host = hostname.toLowerCase()
  if (host === "localhost" || host.endsWith(".localhost")) return "localhost"
  if (host === "lvh.me" || host.endsWith(".lvh.me")) return "lvh.me"
  const configured = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.toLowerCase().trim() || ""
  if (!configured) return ""
  if (host === configured || host.endsWith(`.${configured}`)) return configured
  return ""
}

function getAuthCookie() {
  if (typeof document === "undefined") return ""
  const pair = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${AUTH_COOKIE_KEY}=`))
  if (!pair) return ""
  return decodeURIComponent(pair.slice(`${AUTH_COOKIE_KEY}=`.length))
}

function setAuthCookie(token: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  const common = `Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secure}`
  document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(token)}; ${common}`
  const rootDomain = resolveRootDomain(window.location.hostname)
  if (rootDomain) {
    document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(token)}; Domain=${rootDomain}; ${common}`
  }
}

function clearAuthCookie() {
  if (typeof window === "undefined" || typeof document === "undefined") return
  document.cookie = `${AUTH_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
  const rootDomain = resolveRootDomain(window.location.hostname)
  if (rootDomain) {
    document.cookie = `${AUTH_COOKIE_KEY}=; Domain=${rootDomain}; Path=/; Max-Age=0; SameSite=Lax`
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  const normalizedPath = path.startsWith("/api/") ? `/${path.slice(5)}` : path
  const headers = new Headers(options.headers || {})
  const method = (options.method || "GET").toUpperCase()
  const body = options.body

  if (body && typeof body === "string" && !headers.has("Content-Type") && method !== "GET" && method !== "HEAD") {
    headers.set("Content-Type", "application/json")
  }
  if (withAuth) {
    const token = getAuthToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      ...options,
      headers,
      signal: controller.signal,
      cache: options.cache ?? "no-store",
    })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.")
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }

  const payload = (await response.json().catch(() => ({}))) as Partial<ApiEnvelope<T>> & { message?: string }
  if (!response.ok) throw new Error(payload.message || "Request failed")
  return (payload.data as T) || (payload as unknown as T)
}

export type AuthResponse = {
  token: string
  userInfo: {
    userId: string
    email: string
    firstName: string
    lastName: string
    role: "admin" | "buyer" | "retail_partner"
  }
}

export type SignUpResponse = {
  status: boolean
  requiresEmailVerification: boolean
  email: string
}

export function signIn(email: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false)
}

export function signUp(payload: {
  email: string
  firstName: string
  lastName: string
  password: string
  role?: "buyer" | "retail_partner"
}) {
  return apiRequest<SignUpResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }, false)
}

export function verifyEmailToken(token: string) {
  const params = new URLSearchParams({ token }).toString()
  return apiRequest<{ status: boolean }>(`/api/auth/verify-email?${params}`, { method: "GET" }, false)
}

export function resendVerificationEmail(email: string) {
  return apiRequest<{ status: boolean }>("/api/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }, false)
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ status: boolean }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }, false)
}

export function resetPasswordWithToken(token: string, newPassword: string) {
  return apiRequest<{ status: boolean }>("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) }, false)
}
