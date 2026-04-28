export const AUTH_TOKEN_KEY = "layver.auth.token"

export function getAuthToken() {
  if (typeof window === "undefined") return ""
  return window.sessionStorage.getItem(AUTH_TOKEN_KEY) || ""
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
}
