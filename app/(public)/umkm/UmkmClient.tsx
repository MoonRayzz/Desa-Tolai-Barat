// File: app/(public)/umkm/UmkmClient.tsx

"use client";

import { useState } from "react";
import type { Umkm } from "@/types";

const KATEGORI = [
  { value: "semua",     label: "Semua"         },
  { value: "kuliner",   label: "🍴 Kuliner"    },
  { value: "kerajinan", label: "🎨 Kerajinan"  },
  { value: "pertanian", label: "🌾 Pertanian"  },
  { value: "perikanan", label: "🐟 Perikanan"  },
  { value: "jasa",      label: "🛎️ Jasa"      },
];

const EMOJI: Record<string, string> = {
  kuliner: "🍴", kerajinan: "🎨", pertanian: "🌾", perikanan: "🐟", jasa: "🛎️",
};

export default function UmkmClient({ initialData }: { initialData: Umkm[] }) {
  const [aktif, setAktif] = useState("semua");

  const filtered = aktif === "semua"
    ? initialData
    : initialData.filter((u) => u.kategori === aktif);

  return (
    <>
      <div className="page-hero">
        <div className="container-desa" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "12px" }}>
            UMKM Desa Tolai Barat
          </h1>
          <p style={{ color: "var(--color-ocean-300)", fontSize: "1rem", maxWidth: "520px", margin: "0 auto" }}>
            Dukung produk dan jasa lokal dari warga Desa Tolai Barat
          </p>
        </div>
      </div>

      <section className="section-padding" style={{ background: "var(--color-sand-50)", minHeight: "60vh" }}>
        <div className="container-desa">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "36px", justifyContent: "center" }}>
            {KATEGORI.map((k) => (
              <button key={k.value} onClick={() => setAktif(k.value)}
                className={`filter-btn ${aktif === k.value ? "active" : ""}`}>
                {k.label}
              </button>
            ))}
          </div>

          {/* Cek apakah data kosong */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "white", borderRadius: "20px",
              boxShadow: "var(--shadow-card)", maxWidth: "600px", margin: "0 auto"
            }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "16px", opacity: 0.8 }}>🏪</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.25rem", color: "var(--color-ocean-900)", marginBottom: "8px" }}>
                UMKM Belum Tersedia
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--color-ocean-500)" }}>
                {aktif === "semua" 
                  ? "Informasi UMKM Desa Tolai Barat belum ditambahkan oleh Admin." 
                  : `Belum ada UMKM untuk kategori "${KATEGORI.find(k => k.value === aktif)?.label.replace(/[^a-zA-Z\s]/g, '').trim()}".`}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "24px" }}>
              {filtered.map((u) => (
                <div key={u.id} className="card-base card-hover">
                  <div style={{ height: "160px", overflow: "hidden" }}>
                    {u.image && !u.image.includes("placeholder") ? (
                      <img src={u.image} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--color-forest-700), var(--color-forest-500))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                        {EMOJI[u.kategori] ?? "🏪"}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "20px" }}>
                    <span style={{ background: "var(--color-forest-100)", color: "var(--color-forest-700)", fontSize: "0.68rem", fontWeight: 600, padding: "3px 10px", borderRadius: "9999px", display: "inline-block", marginBottom: "10px", textTransform: "capitalize" as const }}>
                      {u.kategori}
                    </span>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--color-ocean-900)", marginBottom: "4px" }}>
                      {u.name}
                    </h2>
                    <div style={{ fontSize: "0.78rem", color: "var(--color-ocean-500)", marginBottom: "10px" }}>👤 {u.owner}</div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-ocean-700)", lineHeight: 1.65, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {u.description}
                    </p>
                    {u.whatsapp && (
                      <a href={`https://wa.me/${u.whatsapp}`} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#25D366", color: "white", fontSize: "0.8rem", fontWeight: 600, padding: "8px 16px", borderRadius: "10px", textDecoration: "none" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                        </svg>
                        Hubungi via WhatsApp
                      </a>
                    )}
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