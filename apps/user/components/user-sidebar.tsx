"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Goals", href: "/goals" },
  { label: "Buckets", href: "/buckets" },
  { label: "Reservations", href: "/reservations" },
  { label: "Transactions", href: "/transactions" },
  { label: "Contributions", href: "/contributions" },
  { label: "Retailers", href: "/retailers" },
  { label: "Profile", href: "/profile" },
]

export function UserSidebar() {
  const pathname = usePathname()
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
      <div style={{ fontWeight: 700, marginBottom: 16 }}>Layver User</div>
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
      </nav>
    </aside>
  )
}
