// File: app/(public)/layanan/page.tsx

import type { Metadata } from "next";
import { getAktifLayanan, LAYANAN_DEFAULT, TEMA_COLORS } from "@/lib/firebase/layanan";
import { getDesaSettings } from "@/lib/firebase/settings";
import type { LayananDesa } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Layanan Desa",
  description: "Informasi layanan administrasi Desa Tolai Barat.",
};

export default async function LayananPage() {
  const [layananFirestore, s] = await Promise.all([
    getAktifLayanan(),
    getDesaSettings(),
  ]);

  const layanan: LayananDesa[] =
    layananFirestore.length > 0
      ? layananFirestore
      : LAYANAN_DEFAULT.map((l, i) => ({ ...l, id: String(i + 1) }));

  const waUrl = "https://wa.me/" + s.whatsapp;

  return (
    <>
      <div className="page-hero">
        <div className="container-desa" style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "12px",
          }}>
            Layanan Administrasi Desa
          </h1>
          <p style={{ color: "var(--color-ocean-300)", fontSize: "1rem", maxWidth: "520px", margin: "0 auto" }}>
            Informasi persyaratan dan prosedur layanan Desa Tolai Barat
          </p>
        </div>
      </div>

      {/* Info jam dari settings */}
      <div style={{ background: "var(--color-gold-500)", padding: "14px 0" }}>
        <div className="container-desa" style={{
          display: "flex", flexWrap: "wrap", gap: "24px",
          justifyContent: "center", fontSize: "0.875rem",
          color: "var(--color-gold-900)", fontWeight: 500,
        }}>
          <span>Jam Pelayanan: {s.jamLayanan}</span>
          <span>{s.alamat}</span>
          <span>{s.telepon}</span>
        </div>
      </div>

      <section className="section-padding" style={{ background: "var(--color-ocean-50)" }}>
        <div className="container-desa">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}>
            {layanan.map((l) => {
              const c = TEMA_COLORS[l.tema] ?? TEMA_COLORS.ocean;
              return (
                <div key={l.id} style={{
                  background: "white",
                  borderRadius: "20px",
                  border: "1px solid " + c.border,
                  overflow: "hidden",
                  boxShadow: "var(--shadow-card)",
                }}>
                  <div style={{
                    background: c.bg,
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    borderBottom: "1px solid " + c.border,
                  }}>
                    <span style={{ fontSize: "2rem" }}>{l.icon}</span>
                    <div>
                      <h2 style={{
                        fontFamily: "var(--font-display)", fontWeight: 600,
                        fontSize: "1rem", color: "var(--color-ocean-900)",
                      }}>
                        {l.judul}
                      </h2>
                      <span style={{
                        fontSize: "0.72rem", color: "var(--color-ocean-600)",
                        background: "white", padding: "2px 8px",
                        borderRadius: "9999px", marginTop: "4px", display: "inline-block",
                      }}>
                        Estimasi: {l.waktu}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: "20px 24px" }}>
                    <div style={{
                      fontSize: "0.78rem", color: "var(--color-ocean-500)",
                      fontWeight: 600, marginBottom: "10px",
                      textTransform: "uppercase" as const, letterSpacing: "0.04em",
                    }}>
                      Persyaratan
                    </div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {l.syarat.map((sy, i) => (
                        <li key={i} style={{
                          display: "flex", gap: "10px", alignItems: "flex-start",
                          fontSize: "0.875rem", color: "var(--color-ocean-800)",
                        }}>
                          <span style={{ color: c.text, flexShrink: 0, fontWeight: 600 }}>v</span>
                          {sy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: "48px",
            background: "var(--color-ocean-900)",
            borderRadius: "24px",
            padding: "40px",
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: "1.35rem", color: "white", marginBottom: "8px",
              }}>
                Ada pertanyaan tentang layanan?
              </h2>
              <p style={{ color: "var(--color-ocean-300)", fontSize: "0.9rem" }}>
                {s.alamat}
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a 
                href={"tel:" + s.telepon}
                className="btn-primary"
                style={{ padding: "12px 24px" }}
              >
                Telepon Desa
              </a>
              {s.whatsapp && (
                <a 
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-gold"
                  style={{ padding: "12px 24px" }}
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}