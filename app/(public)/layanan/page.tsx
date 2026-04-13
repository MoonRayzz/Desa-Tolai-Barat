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

  // PERBAIKAN: Mapping teks untuk warga
  const KATEGORI_LABEL: Record<string, string> = {
    ocean: "Administrasi Umum",
    gold: "Sosial & Kesejahteraan",
    forest: "Perizinan Usaha"
  };

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
                    <span style={{ fontSize: "2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>{l.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h2 style={{
                        fontFamily: "var(--font-display)", fontWeight: 600,
                        fontSize: "1.05rem", color: "var(--color-ocean-900)", lineHeight: 1.3
                      }}>
                        {l.judul}
                      </h2>
                      <span style={{
                        fontSize: "0.72rem", color: "var(--color-ocean-600)",
                        background: "white", padding: "3px 8px",
                        borderRadius: "6px", marginTop: "6px", display: "inline-block",
                        border: `1px solid ${c.border}`
                      }}>
                        Estimasi: {l.waktu}
                      </span>
                    </div>
                    
                    {/* Tema badge - SEKARANG MENAMPILKAN KATEGORI YANG JELAS */}
                    <div style={{
                      background: "white", color: c.text,
                      fontSize: "0.65rem", fontWeight: 700,
                      padding: "4px 8px", borderRadius: "6px",
                      border: `1px solid ${c.border}`, alignSelf: "flex-start",
                      textAlign: "center", maxWidth: "90px", lineHeight: 1.2
                    }}>
                      {KATEGORI_LABEL[l.tema] || l.tema}
                    </div>

                  </div>

                  <div style={{ padding: "20px 24px" }}>
                    <div style={{
                      fontSize: "0.78rem", color: "var(--color-ocean-500)",
                      fontWeight: 600, marginBottom: "12px",
                      textTransform: "uppercase" as const, letterSpacing: "0.04em",
                    }}>
                      Persyaratan Dokumen
                    </div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0, margin: 0 }}>
                      {l.syarat.map((sy, i) => (
                        <li key={i} style={{
                          display: "flex", gap: "10px", alignItems: "flex-start",
                          fontSize: "0.875rem", color: "var(--color-ocean-800)",
                          lineHeight: 1.4
                        }}>
                          <span style={{ 
                            color: c.text, flexShrink: 0, fontWeight: 700,
                            background: c.bg, width: 20, height: 20,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: "50%", fontSize: "0.7rem", marginTop: "2px"
                          }}>✓</span>
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
            boxShadow: "0 10px 30px rgba(11, 94, 107, 0.2)"
          }}>
            <div>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: "1.35rem", color: "white", marginBottom: "8px",
              }}>
                Ada pertanyaan tentang layanan administrasi?
              </h2>
              <p style={{ color: "var(--color-ocean-300)", fontSize: "0.9rem" }}>
                {s.alamat}
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a 
                href={"tel:" + s.telepon}
                className="btn-primary"
                style={{ padding: "12px 24px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                📞 Telepon Desa
              </a>
              {s.whatsapp && (
                <a 
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-gold"
                  style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
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