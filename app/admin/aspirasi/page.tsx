"use client";

import { useEffect, useState } from "react";
import {
  getAllAspirasi,
  markAsDibaca,
  deleteAspirasi,
  getStatistikAspirasi,
} from "@/lib/firebase/aspirasi";
import type { Aspirasi } from "@/types";

type FilterType = "semua" | "belum" | "dibaca";

const KATEGORI_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  infrastruktur: { bg: "#EBF5E0", text: "#2D5016", icon: "🏗️" },
  pelayanan:     { bg: "#E0F4F7", text: "#0B5E6B", icon: "🏛️" },
  lingkungan:    { bg: "#EBF5E0", text: "#2D5016", icon: "🌿" },
  ekonomi:       { bg: "#FDF3C8", text: "#854F0B", icon: "💼" },
  pendidikan:    { bg: "#F3EEFF", text: "#5B21B6", icon: "🎓" },
  lainnya:       { bg: "#F1F5F9", text: "#475569", icon: "💬" },
};

export default function AdminAspirasiPage() {
  const [list, setList]           = useState<Aspirasi[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<FilterType>("semua");
  const [stats, setStats]         = useState({ total: 0, belumDibaca: 0, perKategori: {} as Record<string, number> });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    const [data, st] = await Promise.all([
      getAllAspirasi(),
      getStatistikAspirasi(),
    ]);
    setList(data);
    setStats(st);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleMarkDibaca(id: string) {
    await markAsDibaca(id);
    setList((p) => p.map((a) => (a.id === id ? { ...a, dibaca: true } : a)));
    setStats((s) => ({ ...s, belumDibaca: Math.max(0, s.belumDibaca - 1) }));
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus aspirasi ini?")) return;
    await deleteAspirasi(id);
    setList((p) => p.filter((a) => a.id !== id));
    await load();
  }

  const filtered = list.filter((a) => {
    if (filter === "belum")  return !a.dibaca;
    if (filter === "dibaca") return a.dibaca;
    return true;
  });

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "semua",  label: "Semua (" + list.length + ")" },
    { key: "belum",  label: "Belum Dibaca (" + stats.belumDibaca + ")" },
    { key: "dibaca", label: "Sudah Dibaca" },
  ];

  function formatWaktu(isoStr: string): string {
    return new Date(isoStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "1.5rem", color: "var(--color-ocean-900)", marginBottom: "4px",
        }}>
          Aspirasi Warga
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--color-ocean-500)" }}>
          {stats.total} total aspirasi masuk
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "14px",
        marginBottom: "24px",
      }}>
        <div style={{
          background: "white", borderRadius: "14px",
          padding: "18px", boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-ocean-100)",
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-500)", marginBottom: "6px" }}>
            Total Masuk
          </div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1.75rem", color: "var(--color-ocean-700)", lineHeight: 1,
          }}>
            {stats.total}
          </div>
        </div>
        <div style={{
          background: stats.belumDibaca > 0 ? "#FFF7ED" : "white",
          borderRadius: "14px", padding: "18px", boxShadow: "var(--shadow-card)",
          border: stats.belumDibaca > 0
            ? "1px solid #FED7AA"
            : "1px solid var(--color-ocean-100)",
        }}>
          <div style={{
            fontSize: "0.75rem", marginBottom: "6px",
            color: stats.belumDibaca > 0 ? "#C2410C" : "var(--color-ocean-500)",
          }}>
            Belum Dibaca
          </div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1.75rem", lineHeight: 1,
            color: stats.belumDibaca > 0 ? "#EA580C" : "var(--color-ocean-400)",
          }}>
            {stats.belumDibaca}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{
        display: "flex", gap: "4px", marginBottom: "20px",
        background: "white", padding: "4px",
        borderRadius: "12px", boxShadow: "var(--shadow-card)",
        flexWrap: "wrap", width: "fit-content",
      }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "8px 16px", borderRadius: "9px",
              border: "none", cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: filter === f.key ? 600 : 400,
              background: filter === f.key ? "var(--color-ocean-700)" : "transparent",
              color: filter === f.key ? "white" : "var(--color-ocean-600)",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-ocean-400)" }}>
          Memuat aspirasi...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px",
          background: "white", borderRadius: "16px",
          boxShadow: "var(--shadow-card)", color: "var(--color-ocean-400)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>💌</div>
          <p style={{ fontSize: "1rem", color: "var(--color-ocean-600)" }}>
            {filter === "belum" ? "Semua aspirasi sudah dibaca." : "Belum ada aspirasi masuk."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((a) => {
            const ks      = KATEGORI_STYLE[a.kategori] ?? KATEGORI_STYLE.lainnya;
            const expanded = expandedId === a.id;

            return (
              <div key={a.id} style={{
                background: "white",
                borderRadius: "14px",
                boxShadow: "var(--shadow-card)",
                border: a.dibaca
                  ? "1px solid var(--color-ocean-100)"
                  : "1px solid var(--color-ocean-300)",
                overflow: "hidden",
              }}>
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(expanded ? null : a.id)}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: "14px", padding: "14px 20px",
                    cursor: "pointer", flexWrap: "wrap",
                  }}
                >
                  {/* Kategori icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: "10px",
                    background: ks.bg, color: ks.text,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "1.1rem", flexShrink: 0,
                  }}>
                    {ks.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{
                        background: ks.bg, color: ks.text,
                        fontSize: "0.65rem", fontWeight: 600,
                        padding: "2px 8px", borderRadius: "9999px",
                        textTransform: "capitalize" as const,
                      }}>
                        {a.kategori}
                      </span>
                      {!a.dibaca && (
                        <span style={{
                          background: "#FFF7ED", color: "#C2410C",
                          fontSize: "0.65rem", fontWeight: 600,
                          padding: "2px 8px", borderRadius: "9999px",
                        }}>
                          Baru
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-ocean-900)" }}>
                      {a.nama}
                      {a.kontak && (
                        <span style={{ fontWeight: 400, color: "var(--color-ocean-500)", marginLeft: "8px", fontSize: "0.78rem" }}>
                          {a.kontak}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-500)", marginTop: "2px" }}>
                      {formatWaktu(a.submittedAt)}
                    </div>
                  </div>

                  {/* Preview isi */}
                  {!expanded && (
                    <div style={{
                      flex: 2, minWidth: "200px",
                      fontSize: "0.82rem", color: "var(--color-ocean-600)",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                    }}>
                      {a.isi}
                    </div>
                  )}

                  {/* Expand chevron */}
                  <span style={{
                    fontSize: "0.75rem", color: "var(--color-ocean-400)",
                    flexShrink: 0, transition: "transform 0.2s",
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}>
                    v
                  </span>
                </div>

                {/* Expanded content */}
                {expanded && (
                  <div style={{
                    padding: "0 20px 20px",
                    borderTop: "1px solid var(--color-ocean-100)",
                  }}>
                    <div style={{
                      padding: "16px",
                      background: "var(--color-ocean-50)",
                      borderRadius: "12px",
                      margin: "14px 0",
                      fontSize: "0.9rem",
                      color: "var(--color-ocean-900)",
                      lineHeight: 1.75,
                      whiteSpace: "pre-wrap",
                    }}>
                      {a.isi}
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {!a.dibaca && (
                        <button
                          onClick={() => handleMarkDibaca(a.id)}
                          style={{
                            padding: "7px 16px", borderRadius: "9px",
                            background: "var(--color-forest-100)",
                            color: "var(--color-forest-700)",
                            border: "none", cursor: "pointer",
                            fontSize: "0.8rem", fontWeight: 500,
                          }}
                        >
                          Tandai Sudah Dibaca
                        </button>
                      )}
                      {a.kontak && (
                        
                        <a href={"https://wa.me/" + a.kontak.replace(/\D/g, "")}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "7px 16px", borderRadius: "9px",
                            background: "#DCFCE7", color: "#15803D",
                            fontSize: "0.8rem", fontWeight: 500,
                            textDecoration: "none",
                          }}
                        >
                          Balas via WhatsApp
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(a.id)}
                        style={{
                          padding: "7px 16px", borderRadius: "9px",
                          background: "#FEE2E2", color: "#991B1B",
                          border: "none", cursor: "pointer",
                          fontSize: "0.8rem", fontWeight: 500,
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}