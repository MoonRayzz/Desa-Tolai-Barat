import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { getAktifLayanan, TEMA_COLORS } from "@/lib/firebase/layanan";
import { getDesaSettings } from "@/lib/firebase/settings";

export default async function LayananSection() {
  const [layanan, s] = await Promise.all([
    getAktifLayanan(),
    getDesaSettings(),
  ]);

  const waUrl = "https://wa.me/" + s.whatsapp;

  const ICONS = ["📄", "🏠", "🏪", "💼", "🗺️", "🖼️"];

  return (
    <section className="section-padding bg-ocean-gradient">
      <div className="container-desa">
        <SectionHeader
          badge="Layanan Desa"
          title="Apa yang Bisa Kami Bantu?"
          subtitle="Akses layanan administrasi dan informasi desa secara online."
          center
        />

        {layanan.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "16px",
            marginTop: "48px",
          }}>
            {layanan.map((l, i) => {
              const c = TEMA_COLORS[l.tema] ?? TEMA_COLORS.ocean;
              return (
                <Link
                  key={l.id}
                  href="/layanan"
                  style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", textAlign: "center",
                    padding: "28px 16px",
                    background: "white",
                    border: "1px solid " + c.border,
                    borderRadius: "16px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    animation: "fadeUp 0.5s ease-out forwards",
                    animationDelay: i * 80 + "ms",
                    opacity: 0,
                  }}
                >
                  <div style={{
                    width: "52px", height: "52px",
                    background: c.bg,
                    borderRadius: "14px",
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem", marginBottom: "14px",
                  }}>
                    {l.icon || ICONS[i % ICONS.length]}
                  </div>
                  <span style={{
                    fontSize: "0.85rem", fontWeight: 500,
                    color: c.text, lineHeight: 1.4,
                  }}>
                    {l.judul}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: "48px", color: "var(--color-ocean-400)", fontSize: "0.875rem" }}>
            Belum ada layanan yang ditambahkan.
          </div>
        )}

        {/* CTA banner */}
        <div style={{
          marginTop: "40px",
          background: "var(--color-ocean-700)",
          borderRadius: "20px",
          padding: "32px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}>
          <div>
            <h3 style={{
              fontFamily: "var(--font-display)", fontWeight: 600,
              fontSize: "1.25rem", color: "white", marginBottom: "8px",
            }}>
              Butuh bantuan layanan desa?
            </h3>
            <p style={{ color: "#94DFE9", fontSize: "0.9rem" }}>
              {s.jamLayanan || "Hubungi kantor desa pada jam kerja."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
            {s.telepon && (
              
              <a href={"tel:" + s.telepon}
                className="btn-primary"
                style={{ padding: "12px 20px", fontSize: "0.875rem" }}
              >
                Telepon Desa
              </a>
            )}
            {s.whatsapp && (
              
              <a href={waUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  background: "#25D366", color: "white",
                  fontWeight: 600, fontSize: "0.875rem",
                  padding: "12px 20px", borderRadius: "12px",
                  textDecoration: "none",
                }}
              >
                WhatsApp
              </a>
            )}
            {!s.telepon && !s.whatsapp && (
              <Link href="/layanan" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#F5C842", color: "#412402",
                fontWeight: 600, fontSize: "0.875rem",
                padding: "12px 24px", borderRadius: "12px",
                textDecoration: "none",
              }}>
                Lihat Layanan
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}