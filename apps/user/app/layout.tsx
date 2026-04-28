import "./globals.css"
import type { Metadata } from "next"
import { UserSidebar } from "@/components/user-sidebar"
import { UserAuthGate } from "@/components/user-auth-gate"

export const metadata: Metadata = {
  title: "Layver User App",
  description: "Layver customer app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserAuthGate>
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <UserSidebar />
            <main style={{ flex: 1, padding: 20 }}>{children}</main>
          </div>
        </UserAuthGate>
      </body>
    </html>
  )
}
