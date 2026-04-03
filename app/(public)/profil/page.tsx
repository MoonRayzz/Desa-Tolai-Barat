// File: app/(public)/profil/page.tsx

import type { Metadata } from "next";
import { getDesaSettings } from "@/lib/firebase/settings";
import { getAllPerangkat } from "@/lib/firebase/perangkat";
import type { PerangkatDesa } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Profil Desa",
  description: "Profil lengkap Desa Tolai Barat.",
};

export default async function ProfilPage() {
  const [s, perangkatFirestore] = await Promise.all([
    getDesaSettings(),
    getAllPerangkat(),
  ]);

  // Hanya ambil data asli dari Firestore
  const perangkat: PerangkatDesa[] = perangkatFirestore;

  const STATS = [
    { label: "Jumlah Penduduk", value: s.jumlahPenduduk, unit: "jiwa",  icon: "👥" },
    { label: "Kepala Keluarga", value: s.jumlahKK,       unit: "KK",    icon: "🏠" },
    { label: "Luas Wilayah",    value: s.luasWilayah,    unit: "Ha",    icon: "🗺️" },
    { label: "Jumlah Dusun",    value: s.jumlahDusun,    unit: "dusun", icon: "🌿" },
    { label: "RT / RW",         value: s.rtRw,           unit: "",      icon: "📍" },
    { label: "Kode Pos",        value: s.kodePos,        unit: "",      icon: "📮" },
  ];

  return (
    <>
      <div className="page-hero">
        <div className="container-desa" style={{ textAlign: "center" }}>
          <span className="badge" style={{ background: "rgba(245,200,66,0.15)", color: "var(--color-gold-300)", marginBottom: "16px", display: "inline-block" }}>
            Profil Desa
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", lineHeight: 1.2, marginBottom: "16px" }}>
            Desa Tolai Barat
          </h1>
          <p style={{ color: "var(--color-ocean-300)", fontSize: "1.05rem", maxWidth: "560px", margin: "0 auto" }}>
            Kecamatan Torue · Kabupaten Parigi Moutong · Sulawesi Tengah
          </p>
        </div>
      </div>

      {/* Statistik */}
      <section className="section-padding-sm" style={{ background: "var(--color-ocean-50)" }}>
        <div className="container-desa">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px" }}>
            {STATS.map((st) => (
              <div key={st.label} style={{ background: "white", borderRadius: "16px", padding: "20px", textAlign: "center", boxShadow: "var(--shadow-card)" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "8px" }}>{st.icon}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.35rem", color: "var(--color-ocean-700)" }}>
                  {st.value}
                  {st.unit && <span style={{ fontSize: "0.75rem", marginLeft: "4px", fontFamily: "var(--font-sans)", fontWeight: 400 }}>{st.unit}</span>}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-500)", marginTop: "4px" }}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sejarah & Visi Misi */}
      <section className="section-padding" style={{ background: "white" }}>
        <div className="container-desa">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "48px", alignItems: "start" }}>
            <div>
              <span className="badge-ocean" style={{ marginBottom: "16px", display: "inline-block" }}>Sejarah</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.75rem", color: "var(--color-ocean-900)", marginBottom: "20px" }}>
                Asal Usul Desa
              </h2>
              {/* PERBAIKAN: Menggunakan div, white-space pre-wrap, dan dangerouslySetInnerHTML */}
              <div 
                style={{ 
                  fontSize: "0.95rem", 
                  lineHeight: 1.85, 
                  color: "var(--color-ocean-800)",
                  whiteSpace: "pre-wrap", // Ini kunci agar baris baru / enter terbaca
                }}
                dangerouslySetInnerHTML={{ __html: s.sejarah }}
              />
            </div>

            <div>
              <span className="badge-gold" style={{ marginBottom: "16px", display: "inline-block" }}>Arah Pembangunan</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.75rem", color: "var(--color-ocean-900)", marginBottom: "20px" }}>
                Visi & Misi Desa
              </h2>
              <div style={{ background: "var(--color-ocean-700)", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
                <div style={{ color: "var(--color-gold-400)", fontWeight: 600, fontSize: "0.8rem", marginBottom: "10px", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                  Visi
                </div>
                <p style={{ color: "white", fontSize: "1rem", lineHeight: 1.65, fontStyle: "italic" as const }}>
                  "{s.visi}"
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
                {s.misi.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-ocean-100)", color: "var(--color-ocean-700)", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                      {i + 1}
                    </div>
                    {/* PERBAIKAN MISI: Menambahkan pre-wrap agar list dalam misi juga terbaca jika ada */}
                    <div style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "var(--color-ocean-800)", whiteSpace: "pre-wrap" }}>
                      {m}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Batas Wilayah */}
      <section className="section-padding-sm" style={{ background: "var(--color-sand-100)" }}>
        <div className="container-desa">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.5rem", color: "var(--color-ocean-900)", textAlign: "center", marginBottom: "32px" }}>
            Batas Wilayah Desa
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", maxWidth: "800px", margin: "0 auto" }}>
            {[
              { arah: "⬆️ Utara",   batas: "Teluk Tomini"                     },
              { arah: "➡️ Timur",   batas: "Desa Balinggi, Kec. Sausu"        },
              { arah: "⬇️ Selatan", batas: "Kec. Palolo, Kec. Biromaru"       },
              { arah: "⬅️ Barat",   batas: "Desa Tindaki, Kec. Parigi Selatan"},
            ].map((b) => (
              <div key={b.arah} style={{ background: "white", borderRadius: "14px", padding: "20px", textAlign: "center", boxShadow: "var(--shadow-card)" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{b.arah.split(" ")[0]}</div>
                <div style={{ fontWeight: 600, color: "var(--color-ocean-700)", fontSize: "0.85rem", marginBottom: "4px" }}>{b.arah.split(" ")[1]}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-ocean-600)" }}>{b.batas}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perangkat Desa */}
      <section className="section-padding" style={{ background: "white" }}>
        <div className="container-desa">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="badge-forest" style={{ marginBottom: "12px", display: "inline-block" }}>Pemerintahan</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--color-ocean-900)" }}>
              Perangkat Desa
            </h2>
          </div>

          {/* Empty State Jika Data Kosong */}
          {perangkat.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              background: "var(--color-ocean-50)", borderRadius: "16px",
              border: "1px dashed var(--color-ocean-200)",
              maxWidth: "600px", margin: "0 auto"
            }}>
              <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px", opacity: 0.7 }}>👥</span>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.1rem", color: "var(--color-ocean-900)", marginBottom: "6px" }}>
                Data Belum Tersedia
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-ocean-600)" }}>
                Struktur organisasi dan perangkat desa akan segera diperbarui.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" }}>
              {perangkat.map((p) => (
                <div key={p.id} style={{ background: "var(--color-ocean-50)", borderRadius: "16px", padding: "24px", textAlign: "center", border: "1px solid var(--color-ocean-100)" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", margin: "0 auto 14px", background: "var(--color-ocean-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "1.5rem" }}>👤</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-ocean-900)", marginBottom: "4px" }}>
                    {p.name === "—" || !p.name ? "Belum Diisi" : p.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-ocean-600)", background: "var(--color-ocean-100)", borderRadius: "9999px", padding: "3px 12px", display: "inline-block", marginTop: "4px" }}>
                    {p.jabatan}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.82rem", color: "var(--color-ocean-400)" }}>
            * Data dapat diperbarui admin melalui Panel Admin → Kelola Perangkat
          </p>
        </div>
      </section>
    </>
  );
}