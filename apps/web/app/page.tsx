import Link from "next/link"

export default function HomePage() {
  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Layver</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>
        Save first, then buy smarter with projected better pricing opportunities.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Link href="/marketplace"><button>Explore Marketplace</button></Link>
        <Link href="/how-it-works"><button>How It Works</button></Link>
        <Link href="/auth/sign-up"><button>Get Started</button></Link>
      </div>
      <section style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Quick Links</h2>
        <div style={{ display: "grid", gap: 6 }}>
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/transparency">Transparency</Link>
          <Link href="/retail-partner">Become a Retail Partner</Link>
        </div>
      </section>
    </div>
  )
}
