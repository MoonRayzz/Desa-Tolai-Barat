// File: app/(public)/wisata/WisataClient.tsx

"use client";

import { useState } from "react";
import type { Wisata } from "@/types";

const KATEGORI = [
  { value: "semua",  label: "Semua"     },
  { value: "bahari", label: "🌊 Bahari" },
  { value: "alam",   label: "🌿 Alam"   },
  { value: "religi", label: "🕌 Religi" },
  { value: "budaya", label: "🎭 Budaya" },
];

const EMOJI: Record<string, string> = { bahari: "🏖️", alam: "🌿", religi: "🕌", budaya: "🎭" };

export default function WisataClient({ initialData }: { initialData: Wisata[] }) {
  const [aktif, setAktif] = useState("semua");

  const filtered = aktif === "semua"
    ? initialData
    : initialData.filter((w) => w.kategori === aktif);

  return (
    <>
      <div className="page-hero">
        <div className="container-desa" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "12px" }}>
            Wisata Desa Tolai Barat
          </h1>
          <p style={{ color: "var(--color-ocean-300)", fontSize: "1rem", maxWidth: "520px", margin: "0 auto" }}>
            Jelajahi keindahan alam dan budaya di pesisir Teluk Tomini
          </p>
        </div>
      </div>

      <section className="section-padding" style={{ background: "var(--color-ocean-50)", minHeight: "60vh" }}>
        <div className="container-desa">
          {/* Tombol Filter */}
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
              <div style={{ fontSize: "3.5rem", marginBottom: "16px", opacity: 0.8 }}>🏝️</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.25rem", color: "var(--color-ocean-900)", marginBottom: "8px" }}>
                Destinasi Belum Tersedia
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--color-ocean-500)" }}>
                {aktif === "semua" 
                  ? "Informasi destinasi wisata Desa Tolai Barat belum ditambahkan oleh Admin." 
                  : `Belum ada destinasi wisata untuk kategori "${KATEGORI.find(k => k.value === aktif)?.label.replace(/[^a-zA-Z\s]/g, '').trim()}".`}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
              {filtered.map((w) => (
                <div key={w.id} className="card-base card-hover">
                  <div style={{ height: "220px", overflow: "hidden" }}>
                    {w.image && !w.image.includes("placeholder") ? (
                      <img src={w.image} alt={w.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--color-ocean-800), var(--color-ocean-500))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem" }}>
                        {EMOJI[w.kategori] ?? "🏝️"}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.1rem", color: "var(--color-ocean-900)" }}>
                        {w.name}
                      </h2>
                      {w.featured && (
                        <span style={{ background: "var(--color-gold-100)", color: "var(--color-gold-700)", fontSize: "0.65rem", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px", flexShrink: 0, marginLeft: "8px" }}>
                          ⭐ Unggulan
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-ocean-600)", lineHeight: 1.7, marginBottom: "16px" }}>
                      {w.description}
                    </p>
                    <div style={{ paddingTop: "14px", borderTop: "1px solid var(--color-ocean-100)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                      <span style={{ background: "var(--color-ocean-100)", color: "var(--color-ocean-700)", padding: "3px 10px", borderRadius: "9999px", textTransform: "capitalize" as const }}>
                        {w.kategori}
                      </span>
                      <span style={{ color: "var(--color-ocean-400)" }}>📍 Tolai Barat</span>
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