"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  getSurveiById,
  getHasilSurvei,
} from "@/lib/firebase/survei";
import type { Survei, HasilPertanyaan } from "@/types";

export default function HasilSurveiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = use(params);
  const router  = useRouter();

  const [survei, setSurvei]   = useState<Survei | null>(null);
  const [hasil, setHasil]     = useState<HasilPertanyaan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, h] = await Promise.all([
        getSurveiById(id),
        getHasilSurvei(id),
      ]);
      setSurvei(s);
      setHasil(h);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <div style={{ padding: "32px", color: "var(--color-ocean-500)" }}>
      Memuat hasil survei...
    </div>
  );

  if (!survei) return (
    <div style={{ padding: "32px" }}>
      <button onClick={() => router.back()} className="btn-ghost">
        back Kembali
      </button>
      <p style={{ color: "var(--color-ocean-500)", marginTop: "16px" }}>
        Survei tidak ditemukan.
      </p>
    </div>
  );

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <button
          onClick={() => router.push("/admin/survei")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-ocean-500)", fontSize: "1.1rem",
          }}
        >
          back
        </button>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1.5rem", color: "var(--color-ocean-900)",
          }}>
            Hasil Survei
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--color-ocean-500)", marginTop: "2px" }}>
            {survei.judul}
          </p>
        </div>
      </div>

      {/* Stat total responden */}
      <div style={{
        display: "flex", gap: "16px", marginBottom: "28px",
        flexWrap: "wrap",
      }}>
        <div style={{
          background: "white", borderRadius: "14px",
          padding: "18px 24px", boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-ocean-100)",
          minWidth: "160px",
        }}>
          <div style={{ fontSize: "0.78rem", color: "var(--color-ocean-500)", marginBottom: "6px" }}>
            Total Responden
          </div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "2rem", color: "var(--color-ocean-700)", lineHeight: 1,
          }}>
            {survei.totalResponden}
          </div>
        </div>
        <div style={{
          background: "white", borderRadius: "14px",
          padding: "18px 24px", boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-ocean-100)",
          minWidth: "160px",
        }}>
          <div style={{ fontSize: "0.78rem", color: "var(--color-ocean-500)", marginBottom: "6px" }}>
            Jumlah Pertanyaan
          </div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "2rem", color: "var(--color-gold-600)", lineHeight: 1,
          }}>
            {survei.pertanyaan.length}
          </div>
        </div>
        <div style={{
          background: "white", borderRadius: "14px",
          padding: "18px 24px", boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-ocean-100)",
          minWidth: "160px",
        }}>
          <div style={{ fontSize: "0.78rem", color: "var(--color-ocean-500)", marginBottom: "6px" }}>
            Status
          </div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1.1rem",
            color: survei.aktif ? "var(--color-forest-600)" : "var(--color-ocean-400)",
            lineHeight: 1,
          }}>
            {survei.aktif ? "Aktif" : "Nonaktif"}
          </div>
        </div>
      </div>

      {/* Tidak ada responden */}
      {survei.totalResponden === 0 && (
        <div style={{
          textAlign: "center", padding: "80px",
          background: "white", borderRadius: "20px",
          boxShadow: "var(--shadow-card)", color: "var(--color-ocean-400)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📊</div>
          <p style={{ fontSize: "1rem", color: "var(--color-ocean-600)" }}>
            Belum ada warga yang mengisi survei ini.
          </p>
        </div>
      )}

      {/* Hasil per pertanyaan */}
      {survei.totalResponden > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {hasil.map((h, idx) => {
            const maxCount = Math.max(...h.opsi.map((o) => o.count), 1);

            return (
              <div key={h.pertanyaanId} style={{
                background: "white", borderRadius: "16px",
                padding: "24px", boxShadow: "var(--shadow-card)",
                border: "1px solid var(--color-ocean-100)",
              }}>
                {/* Pertanyaan */}
                <div style={{
                  display: "flex", gap: "12px", alignItems: "flex-start",
                  marginBottom: "20px", paddingBottom: "16px",
                  borderBottom: "1px solid var(--color-ocean-100)",
                }}>
                  <span style={{
                    background: "var(--color-ocean-100)",
                    color: "var(--color-ocean-700)",
                    fontSize: "0.78rem", fontWeight: 700,
                    padding: "4px 10px", borderRadius: "9999px",
                    flexShrink: 0,
                  }}>
                    P{idx + 1}
                  </span>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontWeight: 600,
                    fontSize: "1rem", color: "var(--color-ocean-900)",
                    lineHeight: 1.4, flex: 1,
                  }}>
                    {h.teks}
                  </h3>
                  <span style={{
                    fontSize: "0.75rem", color: "var(--color-ocean-500)",
                    flexShrink: 0,
                  }}>
                    {h.totalJawaban} jawaban
                  </span>
                </div>

                {/* Bar chart per opsi */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {h.opsi
                    .sort((a, b) => b.count - a.count)
                    .map((opsi) => {
                      const widthPct = maxCount > 0
                        ? (opsi.count / maxCount) * 100
                        : 0;
                      const isTop = opsi.count === maxCount && opsi.count > 0;

                      return (
                        <div key={opsi.teks}>
                          <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", marginBottom: "5px",
                            fontSize: "0.85rem",
                          }}>
                            <span style={{
                              color: "var(--color-ocean-900)",
                              fontWeight: isTop ? 600 : 400,
                              display: "flex", alignItems: "center", gap: "6px",
                            }}>
                              {isTop && opsi.count > 0 && (
                                <span style={{ fontSize: "0.75rem" }}>top</span>
                              )}
                              {opsi.teks}
                            </span>
                            <span style={{
                              color: isTop
                                ? "var(--color-ocean-700)"
                                : "var(--color-ocean-500)",
                              fontWeight: isTop ? 600 : 400,
                              fontSize: "0.82rem",
                            }}>
                              {opsi.count} ({opsi.persen}%)
                            </span>
                          </div>
                          <div style={{
                            height: "10px",
                            background: "var(--color-ocean-100)",
                            borderRadius: "9999px",
                            overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%",
                              width: widthPct + "%",
                              background: isTop
                                ? "var(--color-ocean-600)"
                                : "var(--color-ocean-300)",
                              borderRadius: "9999px",
                              transition: "width 0.6s ease",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}