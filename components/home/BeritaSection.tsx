import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import { getBeritaTerbaru } from "@/lib/firebase/berita";
import { formatTanggal } from "@/lib/utils";
import type { Berita } from "@/types";

const WARNA: Record<string, { bg: string; text: string }> = {
  pengumuman:  { bg: "#E0F4F7", text: "#0B5E6B" },
  berita:      { bg: "#EBF5E0", text: "#2D5016" },
  kegiatan:    { bg: "#FDF3C8", text: "#854F0B" },
  pembangunan: { bg: "#F3EEFF", text: "#5B21B6" },
};

const EMOJI: Record<string, string> = {
  kegiatan: "🏖️", pengumuman: "📢", pembangunan: "🏗️", berita: "📰",
};

export default async function BeritaSection() {
  // Hanya ambil dari Firestore
  const list: Berita[] = await getBeritaTerbaru();

  return (
    <section className="section-padding" style={{ background: "white" }}>
      <div className="container-desa">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "12px" }}>
          <SectionHeader badge="Terkini" title="Berita & Informasi" subtitle="Kabar terbaru dari Desa Tolai Barat." />
          <Link href="/berita" className="btn-ghost">
            Lihat semua
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {list.map((b, i) => {
            const w = WARNA[b.kategori] ?? WARNA.berita;
            return (
              <Link key={b.id} href={`/berita/${b.slug}`} className="card-base"
                style={{ textDecoration: "none", display: "block", animation: "fadeUp 0.5s ease-out forwards", animationDelay: `${Math.min(i * 100, 400)}ms`, opacity: 0 }}>
                {/* Cover image atau placeholder */}
                <div style={{
                  height: "180px", overflow: "hidden", position: "relative",
                  background: "linear-gradient(135deg, var(--color-ocean-800), var(--color-ocean-600))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {b.coverImage && !b.coverImage.includes("placeholder") ? (
                    <Image src={b.coverImage} alt={b.title} fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "3rem" }}>{EMOJI[b.kategori] ?? "📰"}</span>
                  )}
                </div>
                <div style={{ padding: "20px" }}>
                  <span style={{ ...w, fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px", borderRadius: "9999px", display: "inline-block", marginBottom: "10px", textTransform: "capitalize" as const }}>
                    {b.kategori}
                  </span>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--color-ocean-900)", lineHeight: 1.45, marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                    {b.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-ocean-600)", lineHeight: 1.65, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                    {b.excerpt}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-ocean-400)", borderTop: "1px solid var(--color-ocean-100)", paddingTop: "12px" }}>
                    <span>{formatTanggal(b.publishedAt)}</span>
                    <span>{b.views} pembaca</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}