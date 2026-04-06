// File: app/(public)/bumdes/BumdesClient.tsx

"use client";

import type { BumdesProfile, BumdesUnit } from "@/types";

interface Props {
  profile: BumdesProfile;
  units: BumdesUnit[];
}

export default function BumdesClient({ profile, units }: Props) {
  // Hanya tampilkan unit usaha yang aktif
  const activeUnits = units.filter(u => u.aktif);

  return (
    <>
      {/* 1. Hero Section (Bagian Atas) */}
      <div className="page-hero">
        <div className="container-desa" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", marginBottom: "12px" }}>
            {profile.nama || "BUMDes Tolai Barat"}
          </h1>
          <p style={{ color: "var(--color-ocean-300)", fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto" }}>
            Membangun kemandirian ekonomi desa dan mengelola aset untuk kesejahteraan warga.
          </p>
        </div>
      </div>

      <section className="section-padding" style={{ background: "var(--color-sand-50)", minHeight: "60vh" }}>
        <div className="container-desa">
          
          {/* 2. Profil Singkat BUMDes */}
          <div style={{
            background: "white", borderRadius: "20px", padding: "32px",
            boxShadow: "var(--shadow-card)", marginBottom: "56px",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px"
          }}>
            <div>
              <span className="badge-ocean" style={{ marginBottom: "12px", display: "inline-block" }}>Tentang Kami</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "var(--color-ocean-900)", marginBottom: "16px", fontWeight: 600 }}>
                Profil BUMDes
              </h2>
              <p style={{ color: "var(--color-ocean-700)", lineHeight: 1.8, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                {profile.deskripsi}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--color-ocean-50)", padding: "20px", borderRadius: "16px", border: "1px solid var(--color-ocean-100)" }}>
                <div style={{ color: "var(--color-ocean-500)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Visi BUMDes</div>
                <p style={{ color: "var(--color-ocean-900)", fontStyle: "italic", fontSize: "1rem", lineHeight: 1.6 }}>"{profile.visi}"</p>
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, background: "white", padding: "16px", borderRadius: "16px", border: "1px solid var(--color-ocean-100)" }}>
                  <div style={{ color: "var(--color-ocean-500)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Direktur BUMDes</div>
                  <div style={{ color: "var(--color-ocean-900)", fontWeight: 600 }}>{profile.direktur || "-"}</div>
                </div>
                {profile.telepon && (
                  <div style={{ flex: 1, background: "white", padding: "16px", borderRadius: "16px", border: "1px solid var(--color-ocean-100)" }}>
                    <div style={{ color: "var(--color-ocean-500)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Nomor Kontak</div>
                    <div style={{ color: "var(--color-ocean-900)", fontWeight: 600 }}>{profile.telepon}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Header Unit Usaha */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span className="badge" style={{ background: "rgba(245,200,66,0.15)", color: "var(--color-gold-700)", marginBottom: "12px", display: "inline-block" }}>
              Layanan & Bisnis
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "var(--color-ocean-900)" }}>
              Unit Usaha BUMDes
            </h2>
          </div>

          {/* 4. Daftar Unit Usaha */}
          {activeUnits.length === 0 ? (
             <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "white", borderRadius: "20px",
              boxShadow: "var(--shadow-card)", maxWidth: "600px", margin: "0 auto"
            }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "16px", opacity: 0.8 }}>🏢</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.25rem", color: "var(--color-ocean-900)", marginBottom: "8px" }}>
                Belum Ada Unit Usaha
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--color-ocean-500)" }}>
                Informasi unit usaha dan layanan BUMDes sedang dipersiapkan oleh pihak pengelola.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "24px" }}>
              {activeUnits.map((u, i) => (
                 <div key={u.id} className="card-base card-hover" style={{ animation: "fadeUp 0.5s ease-out forwards", animationDelay: `${i * 100}ms`, opacity: 0, display: "flex", flexDirection: "column" }}>
                  
                  {/* Foto Unit */}
                  <div style={{ height: "180px", overflow: "hidden", position: "relative" }}>
                    {u.image && !u.image.includes("placeholder") ? (
                      <img src={u.image} alt={u.namaUnit} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--color-ocean-800), var(--color-ocean-500))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem" }}>
                        🏢
                      </div>
                    )}
                  </div>
                  
                  {/* Detail Info */}
                  <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.1rem", color: "var(--color-ocean-900)", marginBottom: "6px" }}>
                      {u.namaUnit}
                    </h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-ocean-500)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>👤 Pengelola:</span>
                      <span style={{ color: "var(--color-ocean-700)", fontWeight: 500 }}>{u.pengelola}</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-ocean-600)", lineHeight: 1.65, marginBottom: "24px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {u.description}
                    </p>
                    
                    {/* Tombol WhatsApp yang Mendorong (Push) ke bawah */}
                    <div style={{ marginTop: "auto" }}>
                      {u.whatsapp ? (
                        <a href={`https://wa.me/${u.whatsapp}`} target="_blank" rel="noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#25D366", color: "white", fontSize: "0.85rem", fontWeight: 600, padding: "10px 16px", borderRadius: "10px", textDecoration: "none", width: "100%", justifyContent: "center", transition: "opacity 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                          </svg>
                          Hubungi Pengelola
                        </a>
                      ) : (
                        <div style={{ fontSize: "0.8rem", color: "var(--color-ocean-400)", textAlign: "center", padding: "10px", background: "var(--color-ocean-50)", borderRadius: "10px" }}>
                          Belum ada kontak
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}