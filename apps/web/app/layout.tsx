import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Layver",
  description: "Layver public and auth portal",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <nav
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "12px 16px",
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ fontWeight: 700, textDecoration: "none", marginRight: 8 }}>
              Layver
            </Link>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/contact">Contact</Link>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Link href="/auth/sign-in">Sign in</Link>
              <Link href="/auth/sign-up">Sign up</Link>
            </div>
          </nav>
        </header>
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>{children}</main>
      </body>
    </html>
  )
}
