// File: components/home/PengumumanBanner.tsx

"use client";

import { useEffect, useState } from "react";
import { getAktifPengumuman } from "@/lib/firebase/pengumuman";
import type { Pengumuman } from "@/types";

const STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  darurat: { bg: "#DC2626", text: "#ffffff", icon: "🚨" }, // Merah
  penting: { bg: "#D4A017", text: "#1A0B00", icon: "📢" }, // Kuning Emas
  normal:  { bg: "#0B5E6B", text: "#ffffff", icon: "ℹ️" },  // Biru Laut
};

export default function PengumumanBanner() {
  const [items, setItems]         = useState<Pengumuman[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loaded, setLoaded]       = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pg_dismissed");
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setDismissed(new Set(parsed));
      }
    } catch {}

    getAktifPengumuman().then((data) => {
      setItems(data);
      setLoaded(true);
    });
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        sessionStorage.setItem("pg_dismissed", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  const visible = items
    .filter((i) => !dismissed.has(i.id))
    .slice(0, 3); // Tampilkan maksimal 3 agar layar tidak penuh

  if (!loaded || visible.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed", // Berubah jadi fixed agar tidak mendorong HeroSection
        top: "68px",       // Muncul persis di bawah Navbar
        left: 0,
        right: 0,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // Efek bayangan agar memisah dari background
      }}
    >
      {visible.map((item) => {
        const s = STYLE[item.priority] ?? STYLE.normal;

        const endLabel = item.endDate
          ? new Date(item.endDate + "T00:00:00").toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })
          : null;

        return (
          <div
            key={item.id}
            style={{
              background: s.bg,
              color: s.text,
              display: "flex",
              alignItems: "center",
              gap: "20px",            // Jarak antar elemen diperlebar
              padding: "16px 24px",   // Padding diperbesar agar tidak sesak
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            {/* Ikon diperbesar */}
            <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{s.icon}</span>

            {/* Area Teks Utama */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {/* Judul diperbesar */}
                <span style={{ fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.3 }}>
                  {item.title}
                </span>
                
                {/* Label Kategori */}
                <span
                  style={{
                    background: "rgba(0,0,0,0.15)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    textTransform: "capitalize",
                  }}
                >
                  {item.type}
                </span>
              </div>

              {/* Isi / Keterangan diperbesar */}
              {item.content.trim() !== "" && (
                <span
                  style={{
                    fontSize: "1rem",
                    opacity: 0.95,
                    lineHeight: 1.5,
                  }}
                >
                  {item.content.length > 150
                    ? item.content.slice(0, 150) + "..."
                    : item.content}
                </span>
              )}
            </div>

            {/* Label Tanggal Selesai */}
            {endLabel && (
              <span
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.85,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  display: "none", // Sembunyikan di layar sangat kecil agar tidak merusak layout
                }}
                className="sm:block" // Tampilkan di layar ukuran hp (landscape) ke atas
              >
                s/d {endLabel}
              </span>
            )}

            {/* Tombol Link (Opsional) */}
            {item.link && (
              <a
                href={item.link}
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: s.bg,               // Terbalik: teks warna background
                  backgroundColor: s.text,   // Terbalik: background warna teks
                  borderRadius: "8px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s, opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                onClick={(e) => {
                  // Berikan sedikit efek saat diklik
                  e.currentTarget.style.transform = "scale(0.95)";
                  setTimeout(() => {
                    if (e.target) (e.target as HTMLElement).style.transform = "scale(1)";
                  }, 100);
                }}
              >
                {item.linkText || "Lihat Detail"}
              </a>
            )}

            {/* Tombol Tutup (X) diperbesar */}
            <button
              onClick={() => dismiss(item.id)}
              aria-label="Tutup pengumuman"
              style={{
                background: "rgba(0,0,0,0.1)",
                border: "none",
                color: s.text,
                cursor: "pointer",
                fontSize: "1.5rem",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginLeft: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}