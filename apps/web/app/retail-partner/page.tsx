import Link from "next/link"

export default function RetailPartnerPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Retail Partner Program</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>
        Apply to list products and validate demand through Layver’s savings-first model.
      </p>
      <Link href="/auth/sign-up"><button>Create Partner Account</button></Link>
    </div>
  )
}
