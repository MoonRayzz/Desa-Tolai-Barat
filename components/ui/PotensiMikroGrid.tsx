// File: components/ui/PotensiMikroGrid.tsx
"use client";

import { useState, useMemo } from "react";
import type { PotensiDesa } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SEKTOR_ICON: Record<string, string> = {
  pertanian:   "🌾",
  perkebunan:  "🍫",
  perikanan:   "🐟",
  pariwisata:  "🏖️",
  perdagangan: "🛒",
  jasa:        "⚙️",
};

const getSektorIcon = (s: string) => SEKTOR_ICON[s?.toLowerCase()] ?? "🌟";

const SEKTOR_COLOR: Record<string, { bg: string; text: string }> = {
  pertanian:   { bg: "#dcfce7", text: "#166534" },
  perkebunan:  { bg: "#fef3c7", text: "#92400e" },
  perikanan:   { bg: "#e0f2fe", text: "#075985" },
  pariwisata:  { bg: "#fce7f3", text: "#9d174d" },
  perdagangan: { bg: "#ede9fe", text: "#5b21b6" },
  jasa:        { bg: "#f0fdf4", text: "#14532d" },
};

const getSektorStyle = (s: string) =>
  SEKTOR_COLOR[s?.toLowerCase()] ?? { bg: "#f3f4f6", text: "#374151" };

// ─── Component ────────────────────────────────────────────────────────────────
export default function PotensiMikroGrid({ items }: { items: PotensiDesa[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("semua");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Build unique sektor list from actual data
  const sektorList = useMemo(() => {
    const set = new Set(items.map((i) => i.sektor?.toLowerCase()).filter(Boolean));
    return Array.from(set) as string[];
  }, [items]);

  const filtered = useMemo(
    () => activeFilter === "semua" ? items : items.filter((i) => i.sektor?.toLowerCase() === activeFilter),
    [items, activeFilter]
  );

  if (items.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 1rem",
          border: "1.5px dashed rgba(0,0,0,0.12)",
          borderRadius: 16,
          color: "#9ca3af",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
        <p style={{ fontSize: 14, fontWeight: 500 }}>Belum ada data UMKM</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Tambahkan data usaha warga melalui panel admin.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Filter Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          flexDirection: "column",
          gap: 12,
          marginBottom: "1.5rem",
        }}
      >
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          Menampilkan{" "}
          <strong style={{ color: "#0d2b40" }}>{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "usaha" : "usaha"}
          {activeFilter !== "semua" ? ` di sektor ${activeFilter}` : ""}
        </p>

        {/* Scroll horizontal di mobile */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["semua", ...sektorList].map((f) => {
            const isActive = activeFilter === f;
            const style = f !== "semua" ? getSektorStyle(f) : null;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  border: isActive ? "none" : "1px solid rgba(0,0,0,0.12)",
                  background: isActive
                    ? (f === "semua" ? "#0d3349" : style?.bg ?? "#0d3349")
                    : "white",
                  color: isActive
                    ? (f === "semua" ? "white" : style?.text ?? "white")
                    : "#4b5563",
                  cursor: "pointer",
                  transition: "all .18s ease",
                  textTransform: "capitalize",
                }}
              >
                {f === "semua" ? "Semua" : `${getSektorIcon(f)} ${f}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
          gap: 14,
        }}
      >
        {filtered.map((item) => {
          const sektorStyle = getSektorStyle(item.sektor);
          const isHovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: "white",
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: isHovered
                  ? "0 8px 32px rgba(0,0,0,0.12)"
                  : "0 2px 10px rgba(0,0,0,0.05)",
                transform: isHovered ? "translateY(-3px)" : "none",
                transition: "all .22s ease",
              }}
            >
              {/* Thumbnail */}
              <div style={{ height: 160, position: "relative", overflow: "hidden", background: "#0d2b40" }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.nama}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: isHovered ? "scale(1.07)" : "scale(1)",
                      transition: "transform .5s ease",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 52, opacity: .18,
                    }}
                  >
                    {getSektorIcon(item.sektor)}
                  </div>
                )}
                {/* Sektor badge */}
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(4px)",
                    color: sektorStyle.text,
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    padding: "3px 8px",
                    borderRadius: 5,
                  }}
                >
                  {item.sektor}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0d2b40",
                    lineHeight: 1.35,
                    marginBottom: 4,
                  }}
                >
                  {item.nama}
                </h4>

                {item.metrik && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    {item.metrik}
                  </span>
                )}

                {item.deskripsi && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      lineHeight: 1.6,
                      marginBottom: 12,
                      flex: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.deskripsi}
                  </p>
                )}

                {/* Footer */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 10,
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {item.kontakName && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        marginBottom: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span>👤</span>
                      <span>{item.kontakName}</span>
                    </div>
                  )}

                  {item.whatsapp ? (
                    <a
                      href={`https://wa.me/${item.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        background: "#22c55e",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "background .15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#16a34a")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#22c55e")}
                    >
                      <span>💬</span>
                      <span>Hubungi via WhatsApp</span>
                    </a>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        background: "#f3f4f6",
                        color: "#9ca3af",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Kontak tidak tersedia
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Slot kosong — ajakan daftar usaha */}
        <div
          style={{
            border: "1.5px dashed rgba(0,0,0,0.13)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            minHeight: 280,
            opacity: 0.6,
            cursor: "default",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: "#9ca3af",
              marginBottom: 12,
            }}
          >
            +
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
            Punya usaha di desa?
          </p>
          <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5 }}>
            Hubungi admin desa untuk mendaftarkan usaha Anda.
          </p>
        </div>
      </div>

      {/* Empty state after filter */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "#9ca3af",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <p style={{ fontSize: 14 }}>
            Tidak ada UMKM di sektor{" "}
            <strong style={{ color: "#4b5563" }}>{activeFilter}</strong> saat ini.
          </p>
        </div>
      )}
    </div>
  );
}