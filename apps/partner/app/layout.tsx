import "./globals.css"
import type { Metadata } from "next"
import { PartnerSidebar } from "@/components/partner-sidebar"
import { PartnerAuthGate } from "@/components/partner-auth-gate"

export const metadata: Metadata = {
  title: "Layver Partner",
  description: "Layver partner portal",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PartnerAuthGate>
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <PartnerSidebar />
            <main style={{ flex: 1, padding: 20 }}>{children}</main>
          </div>
        </PartnerAuthGate>
      </body>
    </html>
  )
}
