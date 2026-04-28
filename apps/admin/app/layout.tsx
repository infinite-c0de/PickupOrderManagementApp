import "./globals.css"
import type { Metadata } from "next"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminAuthGate } from "@/components/admin-auth-gate"

export const metadata: Metadata = {
  title: "Layver Admin",
  description: "Layver admin portal",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminAuthGate>
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: 20 }}>{children}</main>
          </div>
        </AdminAuthGate>
      </body>
    </html>
  )
}
