"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { clearAuthToken } from "@/lib/api-client"

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Partner Profile", href: "/profile" },
]

export function PartnerSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside
      style={{
        width: 220,
        borderRight: "1px solid #e2e8f0",
        background: "#fff",
        padding: 16,
        minHeight: "100vh",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 16 }}>Layver Partner</div>
      <nav style={{ display: "grid", gap: 8 }}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                color: active ? "#fff" : "#0f172a",
                background: active ? "#0f172a" : "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              {item.label}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => {
            clearAuthToken()
            const next = encodeURIComponent(window.location.href)
            router.push(`${process.env.NEXT_PUBLIC_ROOT_SIGNIN_URL || "http://localhost:3000/auth/sign-in"}?next=${next}`)
          }}
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "#fff",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </nav>
    </aside>
  )
}
