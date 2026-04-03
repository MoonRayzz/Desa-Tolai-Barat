"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllSurvei, deleteSurvei, updateSurvei } from "@/lib/firebase/survei";
import type { Survei } from "@/types";

export default function AdminSurveiPage() {
  const [list, setList]       = useState<Survei[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await getAllSurvei();
    setList(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, judul: string) {
    if (!confirm("Hapus survei \"" + judul + "\"? Semua jawaban juga akan terhapus dari tampilan.")) return;
    await deleteSurvei(id);
    setList((p) => p.filter((s) => s.id !== id));
  }

  async function toggleAktif(s: Survei) {
    await updateSurvei(s.id, { aktif: !s.aktif });
    setList((p) =>
      p.map((x) => (x.id === s.id ? { ...x, aktif: !x.aktif } : x))
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "24px",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1.5rem", color: "var(--color-ocean-900)",
          }}>
            Kelola Survei
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--color-ocean-500)", marginTop: "2px" }}>
            {list.length} survei dibuat
          </p>
        </div>
        <Link href="/admin/survei/tambah" className="btn-primary" style={{ padding: "10px 22px" }}>
          + Buat Survei Baru
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-ocean-400)" }}>
          Memuat data survei...
        </div>
      ) : list.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px",
          background: "white", borderRadius: "16px",
          boxShadow: "var(--shadow-card)", color: "var(--color-ocean-400)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📊</div>
          <p style={{ marginBottom: "8px", fontSize: "1rem", color: "var(--color-ocean-600)" }}>
            Belum ada survei.
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Klik "+ Buat Survei Baru" untuk membuat survei pertama.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {list.map((s) => {
            const endLabel = s.endDate
              ? new Date(s.endDate + "T00:00:00").toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : null;

            const today   = new Date().toISOString().split("T")[0];
            const expired = s.endDate && s.endDate < today;

            return (
              <div key={s.id} style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px 24px",
                boxShadow: "var(--shadow-card)",
                border: "1px solid var(--color-ocean-100)",
                opacity: (!s.aktif || expired) ? 0.65 : 1,
              }}>
                <div style={{
                  display: "flex", alignItems: "flex-start",
                  gap: "16px", flexWrap: "wrap",
                }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <span style={{
                        background: s.aktif && !expired
                          ? "var(--color-ocean-100)"
                          : "#F1F5F9",
                        color: s.aktif && !expired
                          ? "var(--color-ocean-700)"
                          : "#64748B",
                        fontSize: "0.68rem", fontWeight: 600,
                        padding: "3px 9px", borderRadius: "9999px",
                      }}>
                        {s.aktif && !expired ? "Aktif" : expired ? "Kadaluarsa" : "Nonaktif"}
                      </span>
                      <span style={{
                        background: "var(--color-gold-100)",
                        color: "var(--color-gold-700)",
                        fontSize: "0.68rem", fontWeight: 600,
                        padding: "3px 9px", borderRadius: "9999px",
                      }}>
                        {s.pertanyaan.length} pertanyaan
                      </span>
                    </div>

                    <h2 style={{
                      fontFamily: "var(--font-display)", fontWeight: 600,
                      fontSize: "1rem", color: "var(--color-ocean-900)",
                      marginBottom: "4px",
                    }}>
                      {s.judul}
                    </h2>

                    {s.deskripsi.trim() !== "" && (
                      <p style={{
                        fontSize: "0.82rem", color: "var(--color-ocean-600)",
                        lineHeight: 1.5, marginBottom: "8px",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                      }}>
                        {s.deskripsi}
                      </p>
                    )}

                    <div style={{
                      display: "flex", gap: "16px", flexWrap: "wrap",
                      fontSize: "0.78rem", color: "var(--color-ocean-500)",
                    }}>
                      <span>{s.totalResponden} responden</span>
                      {endLabel && <span>Berakhir: {endLabel}</span>}
                    </div>
                  </div>

                  {/* Toggle aktif */}
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-ocean-500)" }}>
                      {s.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                    <button
                      onClick={() => toggleAktif(s)}
                      style={{
                        width: 38, height: 22, borderRadius: "9999px",
                        background: s.aktif
                          ? "var(--color-ocean-600)"
                          : "var(--color-ocean-200)",
                        border: "none", cursor: "pointer",
                        position: "relative", transition: "background 0.2s",
                      }}
                    >
                      <span style={{
                        position: "absolute", top: 3,
                        left: s.aktif ? 19 : 3,
                        width: 16, height: 16,
                        borderRadius: "50%", background: "white",
                        transition: "left 0.2s",
                      }} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <Link
                      href={"/admin/survei/" + s.id + "/hasil"}
                      style={{
                        padding: "7px 14px", borderRadius: "8px",
                        background: "var(--color-forest-100)",
                        color: "var(--color-forest-700)",
                        fontSize: "0.78rem", fontWeight: 500,
                        textDecoration: "none",
                      }}
                    >
                      Lihat Hasil
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id, s.judul)}
                      style={{
                        padding: "7px 14px", borderRadius: "8px",
                        background: "#FEE2E2", color: "#991B1B",
                        fontSize: "0.78rem", fontWeight: 500,
                        border: "none", cursor: "pointer",
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}