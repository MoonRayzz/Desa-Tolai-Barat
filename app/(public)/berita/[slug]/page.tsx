// File: app/(public)/berita/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBeritaBySlug,
  getBeritaPublished,
  incrementViews,
} from "@/lib/firebase/berita";
import { formatTanggal } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Berita } from "@/types";

type Props = { params: Promise<{ slug: string }> };

// FUNGSI SEO DINAMIS: Men-generate metadata unik untuk setiap halaman berita
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const berita   = await getBeritaBySlug(slug);
  
  if (!berita) return { title: "Berita Tidak Ditemukan" };
  
  const title = berita.title;
  // Jika excerpt kosong, ambil dari awal konten html lalu hapus tag HTML-nya
  const description = berita.excerpt || berita.content.substring(0, 160).replace(/<[^>]+>/g, '') + "...";
  const imageUrl = berita.coverImage || "/og-image.jpg";

  return { 
    title: title, 
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "article",
      publishedTime: berita.publishedAt ? new Date(berita.publishedAt).toISOString() : undefined,
      authors: [berita.author || "Admin Desa"],
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
    }
  };
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug }    = await params;
  const berita: Berita | null = await getBeritaBySlug(slug);

  if (!berita) notFound();

  incrementViews(berita.id).catch(() => {});

  let lainnya: Berita[] = await getBeritaPublished(4);
  lainnya = lainnya.filter((b) => b.id !== berita.id).slice(0, 3);

  return (
    <>
      <div style={{ background: "var(--color-ocean-900)", padding: "100px 0 48px" }}>
        <div className="container-desa" style={{ maxWidth: "800px" }}>
          <Link href="/berita" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: "var(--color-ocean-300)", fontSize: "0.85rem",
            textDecoration: "none", marginBottom: "20px",
          }}>
            Kembali ke Berita
          </Link>
          <span style={{
            display: "inline-block", marginBottom: "14px",
            background: "rgba(245,200,66,0.15)", color: "var(--color-gold-300)",
            fontSize: "0.75rem", fontWeight: 600,
            padding: "4px 14px", borderRadius: "9999px",
            textTransform: "capitalize" as const,
          }}>
            {berita.kategori}
          </span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            color: "white", lineHeight: 1.25, marginBottom: "16px",
          }}>
            {berita.title}
          </h1>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "16px",
            fontSize: "0.82rem", color: "var(--color-ocean-300)",
          }}>
            <span>{berita.author}</span>
            <span>{formatTanggal(berita.publishedAt)}</span>
            <span>{berita.views} pembaca</span>
          </div>
        </div>
      </div>

      <section style={{ padding: "48px 0 80px", background: "white" }}>
        <div className="container-desa" style={{ maxWidth: "800px" }}>

          {/* Cover */}
          <div style={{
            height: "340px", borderRadius: "20px",
            overflow: "hidden", marginBottom: "40px",
          }}>
            {berita.coverImage ? (
              <img
                src={berita.coverImage}
                alt={berita.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                background: "linear-gradient(135deg, var(--color-ocean-800), var(--color-ocean-500))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "4rem",
              }}>
                {berita.kategori === "kegiatan"    ? "🏖️"
                : berita.kategori === "pengumuman" ? "📢"
                : berita.kategori === "pembangunan"? "🏗️"
                : "📰"}
              </div>
            )}
          </div>

          {/* Konten — disanitasi DOMPurify untuk cegah XSS */}
          <div
            className="prose-desa"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(berita.content) }}
          />

          <div style={{
            marginTop: "48px", paddingTop: "32px",
            borderTop: "1px solid var(--color-ocean-100)",
            display: "flex", justifyContent: "space-between",
            flexWrap: "wrap", gap: "16px",
          }}>
            <span style={{ fontSize: "0.85rem", color: "var(--color-ocean-500)" }}>
              Dipublikasikan oleh {berita.author}
            </span>
            <Link href="/berita" className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
              Berita Lainnya
            </Link>
          </div>
        </div>
      </section>

      {lainnya.length > 0 && (
        <section className="section-padding-sm" style={{ background: "var(--color-ocean-50)" }}>
          <div className="container-desa">
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 600,
              fontSize: "1.35rem", color: "var(--color-ocean-900)", marginBottom: "24px",
            }}>
              Berita Lainnya
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "20px",
            }}>
              {lainnya.map((b) => (
                <Link
                  key={b.id}
                  href={"/berita/" + b.slug}
                  className="card-base card-hover"
                  style={{ textDecoration: "none", display: "block", padding: "20px" }}
                >
                  <div style={{
                    fontSize: "0.7rem", fontWeight: 600, marginBottom: "8px",
                    color: "var(--color-ocean-600)",
                    textTransform: "capitalize" as const,
                  }}>
                    {b.kategori}
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontWeight: 600,
                    fontSize: "0.95rem", color: "var(--color-ocean-900)",
                    lineHeight: 1.4, marginBottom: "8px",
                  }}>
                    {b.title}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-400)" }}>
                    {formatTanggal(b.publishedAt)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}