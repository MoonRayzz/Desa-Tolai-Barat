import Link from "next/link";
import Image from "next/image";
import { getWisataFeatured } from "@/lib/firebase/wisata";
import type { Wisata } from "@/types";

const WARNA: Record<string, string> = { bahari: "#E0F4F7", alam: "#EBF5E0", religi: "#FDF3C8", budaya: "#F3EEFF" };
const LABEL: Record<string, string> = { bahari: "🌊 Bahari", alam: "🌿 Alam", religi: "🕌 Religi", budaya: "🎭 Budaya" };
const EMOJI: Record<string, string> = { bahari: "🏖️", alam: "🌿", religi: "🕌", budaya: "🎭" };

export default async function WisataSection() {
  // Hanya ambil data dari Firestore
  const list: Wisata[] = await getWisataFeatured();

  return (
    <section className="section-padding" style={{ background: "var(--color-ocean-900)" }}>
      <div className="container-desa">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="badge" style={{ background: "rgba(245,200,66,0.15)", color: "var(--color-gold-300)", marginBottom: "12px", display: "inline-block" }}>
              Wisata Unggulan
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white", lineHeight: 1.2 }}>
              Jelajahi Keindahan<br />Desa Tolai Barat
            </h2>
          </div>
          <Link href="/wisata" style={{ color: "var(--color-ocean-300)", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            Lihat semua
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Cek apakah data wisata kosong */}
        {list.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px dashed rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
          }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px", opacity: 0.8 }}>🏝️</span>
            <h3 style={{ color: "white", fontSize: "1.2rem", marginBottom: "8px", fontFamily: "var(--font-display)", fontWeight: 600 }}>
              Destinasi Belum Tersedia
            </h3>
            <p style={{ color: "var(--color-ocean-300)", fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto" }}>
              Informasi wisata unggulan Desa Tolai Barat sedang dalam tahap pembaruan. Silakan cek kembali nanti.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {list.map((w, i) => (
              <Link key={w.id} href="/wisata" className="card-hover"
                style={{ borderRadius: "20px", overflow: "hidden", background: "white", textDecoration: "none", display: "block", animation: "fadeUp 0.5s ease-out forwards", animationDelay: `${i * 100}ms`, opacity: 0 }}>
                <div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
                  {w.image && !w.image.includes("placeholder") ? (
                    <Image src={w.image} alt={w.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--color-ocean-800), var(--color-ocean-600))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                      {EMOJI[w.kategori] ?? "🏝️"}
                    </div>
                  )}
                  <span style={{ position: "absolute", top: "12px", left: "12px", background: WARNA[w.kategori] ?? "#E0F4F7", color: "var(--color-ocean-800)", fontSize: "0.7rem", fontWeight: 600, padding: "4px 10px", borderRadius: "9999px" }}>
                    {LABEL[w.kategori] ?? w.kategori}
                  </span>
                </div>
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem", color: "var(--color-ocean-900)", marginBottom: "8px" }}>
                    {w.name}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-ocean-600)", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                    {w.description}
                  </p>
                  <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--color-ocean-100)", display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--color-ocean-500)" }}>
                    <span>📍 Desa Tolai Barat</span>
                    <span style={{ color: "var(--color-ocean-700)", fontWeight: 500 }}>Lihat detail →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}