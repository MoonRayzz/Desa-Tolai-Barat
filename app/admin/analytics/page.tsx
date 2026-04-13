"use client";

import { useEffect, useState } from "react";
import {
  getTotalVisitors,
  getTodayCount,
  getThisMonthCount,
  getLast7Days,
  getTopCities,
  getTopRegions,
  type DailyStat,
} from "@/lib/firebase/analytics";

interface TopItem { city?: string; region?: string; count: number; }

export default function AnalyticsPage() {
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [today, setToday]       = useState(0);
  const [thisMonth, setMonth]   = useState(0);
  const [last7, setLast7]       = useState<DailyStat[]>([]);
  const [cities, setCities]     = useState<{ city: string; count: number }[]>([]);
  const [regions, setRegions]   = useState<{ region: string; count: number }[]>([]);

  useEffect(() => {
    async function load() {
      const [t, td, tm, l7, ct, rg] = await Promise.all([
        getTotalVisitors(),
        getTodayCount(),
        getThisMonthCount(),
        getLast7Days(),
        getTopCities(10),
        getTopRegions(10),
      ]);

      // FOKUS MASALAH: Filter data anomali (Localhost & lokasi Bot/Server Vercel)
      const excludeKeywords = ["localhost", "development", "san jose", "santa clara", "california", "madan"];

      const filteredCities = ct.filter(
        (c) => !excludeKeywords.some((keyword) => (c.city || "").toLowerCase().includes(keyword))
      );

      const filteredRegions = rg.filter(
        (r) => !excludeKeywords.some((keyword) => (r.region || "").toLowerCase().includes(keyword))
      );

      setTotal(t);
      setToday(td);
      setMonth(tm);
      setLast7(l7);
      setCities(filteredCities);
      setRegions(filteredRegions);
      setLoading(false);
    }
    load();
  }, []);

  const maxDay = Math.max(...last7.map((d) => d.count), 1);

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
  }

  const STAT_CARDS = [
    { label: "Total Pengunjung",    value: total,     emoji: "👥", bg: "var(--color-ocean-100)",  color: "var(--color-ocean-700)"  },
    { label: "Pengunjung Hari Ini", value: today,     emoji: "📅", bg: "var(--color-gold-100)",   color: "var(--color-gold-700)"   },
    { label: "Bulan Ini",           value: thisMonth, emoji: "📆", bg: "var(--color-forest-100)", color: "var(--color-forest-700)" },
  ];

  return (
    <div style={{ padding: "32px" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "1.5rem", color: "var(--color-ocean-900)", marginBottom: "4px",
        }}>
          Statistik Pengunjung
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-ocean-500)" }}>
          Data real-time pengunjung website Desa Tolai Barat
        </p>
      </div>

      {loading ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "80px", color: "var(--color-ocean-400)", fontSize: "0.9rem",
        }}>
          Memuat data analitik...
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}>
            {STAT_CARDS.map((c) => (
              <div key={c.label} style={{
                background: "white", borderRadius: "16px",
                padding: "22px", boxShadow: "var(--shadow-card)",
                border: "1px solid var(--color-ocean-100)",
              }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "10px" }}>{c.emoji}</div>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: "2rem", color: c.color, lineHeight: 1,
                }}>
                  {c.value.toLocaleString("id-ID")}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--color-ocean-600)", marginTop: "6px" }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>

          {/* Chart 7 Hari Terakhir */}
          <div style={{
            background: "white", borderRadius: "16px", padding: "24px",
            boxShadow: "var(--shadow-card)", marginBottom: "24px",
          }}>
            <h2 style={{
              fontSize: "1rem", fontWeight: 600,
              color: "var(--color-ocean-900)", marginBottom: "20px",
            }}>
              7 Hari Terakhir
            </h2>

            {last7.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--color-ocean-400)", fontSize: "0.875rem" }}>
                Belum ada data kunjungan
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "180px" }}>
                {last7.map((d) => {
                  const heightPct = maxDay > 0 ? (d.count / maxDay) * 100 : 0;
                  return (
                    <div
                      key={d.date}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        height: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      {/* Angka */}
                      <div style={{
                        fontSize: "0.72rem", fontWeight: 600,
                        color: "var(--color-ocean-700)",
                      }}>
                        {d.count}
                      </div>

                      {/* Bar */}
                      <div
                        style={{
                          width: "100%",
                          height: `${Math.max(heightPct, 4)}%`,
                          background: "var(--color-ocean-600)",
                          borderRadius: "6px 6px 0 0",
                          transition: "height 0.3s ease",
                          minHeight: "4px",
                        }}
                      />

                      {/* Label tanggal */}
                      <div style={{
                        fontSize: "0.65rem",
                        color: "var(--color-ocean-500)",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        maxWidth: "100%",
                      }}>
                        {formatDate(d.date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Cities + Top Regions */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}>

            {/* Kota */}
            <div style={{
              background: "white", borderRadius: "16px", padding: "24px",
              boxShadow: "var(--shadow-card)",
            }}>
              <h2 style={{
                fontSize: "1rem", fontWeight: 600,
                color: "var(--color-ocean-900)", marginBottom: "16px",
              }}>
                📍 Kota Pengunjung Terbanyak
              </h2>

              {cities.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "var(--color-ocean-400)", fontSize: "0.875rem" }}>
                  Belum ada data
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {cities.map((c, i) => {
                    const maxCount = cities[0].count;
                    const pct = maxCount > 0 ? (c.count / maxCount) * 100 : 0;
                    return (
                      <div key={c.city}>
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          fontSize: "0.82rem", marginBottom: "4px",
                        }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: "50%",
                              background: i < 3 ? "var(--color-ocean-600)" : "var(--color-ocean-200)",
                              color: i < 3 ? "white" : "var(--color-ocean-700)",
                              fontSize: "0.65rem", fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}>
                              {i + 1}
                            </span>
                            <span style={{ color: "var(--color-ocean-900)", fontWeight: 500 }}>
                              {c.city}
                            </span>
                          </span>
                          <span style={{ color: "var(--color-ocean-600)", fontWeight: 600 }}>
                            {c.count.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div style={{
                          height: "5px", background: "var(--color-ocean-100)",
                          borderRadius: "9999px", overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            background: i < 3 ? "var(--color-ocean-600)" : "var(--color-ocean-300)",
                            borderRadius: "9999px",
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Provinsi */}
            <div style={{
              background: "white", borderRadius: "16px", padding: "24px",
              boxShadow: "var(--shadow-card)",
            }}>
              <h2 style={{
                fontSize: "1rem", fontWeight: 600,
                color: "var(--color-ocean-900)", marginBottom: "16px",
              }}>
                🗺️ Provinsi / Daerah Asal
              </h2>

              {regions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "var(--color-ocean-400)", fontSize: "0.875rem" }}>
                  Belum ada data
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {regions.map((r, i) => {
                    const maxCount = regions[0].count;
                    const pct = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
                    return (
                      <div key={r.region}>
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          fontSize: "0.82rem", marginBottom: "4px",
                        }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: "50%",
                              background: i < 3 ? "var(--color-forest-600)" : "var(--color-forest-200)",
                              color: i < 3 ? "white" : "var(--color-forest-700)",
                              fontSize: "0.65rem", fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}>
                              {i + 1}
                            </span>
                            <span style={{ color: "var(--color-ocean-900)", fontWeight: 500 }}>
                              {r.region}
                            </span>
                          </span>
                          <span style={{ color: "var(--color-forest-600)", fontWeight: 600 }}>
                            {r.count.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div style={{
                          height: "5px", background: "var(--color-forest-100)",
                          borderRadius: "9999px", overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            background: i < 3 ? "var(--color-forest-600)" : "var(--color-forest-300)",
                            borderRadius: "9999px",
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Info banner */}
          <div style={{
            background: "var(--color-ocean-50)", borderRadius: "12px",
            padding: "14px 16px", border: "1px solid var(--color-ocean-100)",
            fontSize: "0.82rem", color: "var(--color-ocean-600)", lineHeight: 1.7,
          }}>
            Data diperbarui setiap kali ada pengunjung baru.
            Pengunjung dari localhost/development tidak dihitung.
            Geolokasi menggunakan layanan ip-api.com (gratis, akurasi tinggi di Indonesia).
          </div>
        </>
      )}
    </div>
  );
}