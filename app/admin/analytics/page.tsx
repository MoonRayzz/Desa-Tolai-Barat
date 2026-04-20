"use client";

import { useEffect, useState } from "react";
import { getAnalyticsData, type AnalyticsData, type DailyStat } from "@/lib/firebase/analytics";

interface TopItem { city?: string; region?: string; count: number; }

export default function AnalyticsPage() {
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [today, setToday]       = useState(0);
  const [thisMonth, setMonth]   = useState(0);
  const [last7, setLast7]       = useState<DailyStat[]>([]);
  const [cities, setCities]     = useState<{ city: string; count: number }[]>([]);
  const [regions, setRegions]   = useState<{ region: string; count: number }[]>([]);
  const [osData, setOsData]     = useState<{ os: string; count: number }[]>([]);
  const [browsers, setBrowsers] = useState<{ browser: string; count: number }[]>([]);
  const [devices, setDevices]   = useState<{ device: string; count: number }[]>([]);
  const [pages, setPages]       = useState<{ page: string; count: number }[]>([]);
  const [todayCities, setTodayCities] = useState<{ city: string; count: number }[]>([]);
  const [monthCities, setMonthCities] = useState<{ city: string; count: number }[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getAnalyticsData();

      // FOKUS MASALAH: Filter data anomali (Localhost & lokasi Bot/Server Vercel)
      const excludeKeywords = ["localhost", "development", "san jose", "santa clara", "california", "madan"];

      const filteredCities = data.topCities.filter(
        (c) => !excludeKeywords.some((keyword) => (c.city || "").toLowerCase().includes(keyword))
      );

      const filteredRegions = data.topRegions.filter(
        (r) => !excludeKeywords.some((keyword) => (r.region || "").toLowerCase().includes(keyword))
      );

      setTotal(data.total);
      setToday(data.today);
      setMonth(data.thisMonth);
      setLast7(data.last7);
      setCities(filteredCities);
      setRegions(filteredRegions);
      setOsData(data.topOS);
      setBrowsers(data.topBrowsers);
      setDevices(data.topDevices);
      setTodayCities(data.todayCities.filter(c => !excludeKeywords.some(k => (c.city || "").toLowerCase().includes(k))).slice(0, 3));
      setMonthCities(data.thisMonthCities.filter(c => !excludeKeywords.some(k => (c.city || "").toLowerCase().includes(k))).slice(0, 3));
      
      // Filter the pages somewhat carefully
      const filteredPages = data.topPages.filter(p => !p.page.startsWith("/api"));
      setPages(filteredPages.slice(0, 5));
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
    { label: "Total Pengunjung",    value: total,     emoji: "👥", bg: "var(--color-ocean-100)",  color: "var(--color-ocean-700)", list: null  },
    { label: "Pengunjung Hari Ini", value: today,     emoji: "📅", bg: "var(--color-gold-100)",   color: "var(--color-gold-700)",  list: todayCities   },
    { label: "Bulan Ini",           value: thisMonth, emoji: "📆", bg: "var(--color-forest-100)", color: "var(--color-forest-700)", list: monthCities },
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
                {c.list && c.list.length > 0 && (
                  <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px dashed var(--color-ocean-100)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-ocean-400)", marginBottom: "2px" }}>Dari mana?</div>
                    {c.list.map(l => (
                      <div key={l.city} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                        <span style={{ color: "var(--color-ocean-800)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: "8px" }}>{l.city}</span>
                        <span style={{ fontWeight: 600, color: c.color }}>{l.count}</span>
                      </div>
                    ))}
                  </div>
                )}
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

          {/* Detailed Info: Devices, OS, Browsers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}>

            {/* Device */}
            <div style={{
              background: "white", borderRadius: "16px", padding: "24px",
              boxShadow: "var(--shadow-card)",
            }}>
              <h2 style={{
                fontSize: "1rem", fontWeight: 600,
                color: "var(--color-ocean-900)", marginBottom: "16px",
              }}>
                📱 Tipe Perangkat
              </h2>
              {devices.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "var(--color-ocean-400)", fontSize: "0.875rem" }}>Belum ada data</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {devices.map((d, i) => {
                    const maxCount = devices[0].count;
                    const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                    return (
                      <div key={d.device}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                          <span style={{ color: "var(--color-ocean-900)", fontWeight: i === 0 ? 600 : 500 }}>{d.device}</span>
                          <span style={{ color: "var(--color-ocean-600)", fontWeight: 600 }}>{d.count.toLocaleString("id-ID")}</span>
                        </div>
                        <div style={{ height: "5px", background: "var(--color-ocean-100)", borderRadius: "9999px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-ocean-500)", borderRadius: "9999px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* OS */}
            <div style={{
              background: "white", borderRadius: "16px", padding: "24px",
              boxShadow: "var(--shadow-card)",
            }}>
              <h2 style={{
                fontSize: "1rem", fontWeight: 600,
                color: "var(--color-ocean-900)", marginBottom: "16px",
              }}>
                💻 Sistem Operasi
              </h2>
              {osData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "var(--color-ocean-400)", fontSize: "0.875rem" }}>Belum ada data</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {osData.map((o, i) => {
                    const maxCount = osData[0].count;
                    const pct = maxCount > 0 ? (o.count / maxCount) * 100 : 0;
                    return (
                      <div key={o.os}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                          <span style={{ color: "var(--color-ocean-900)", fontWeight: i === 0 ? 600 : 500 }}>{o.os}</span>
                          <span style={{ color: "var(--color-ocean-600)", fontWeight: 600 }}>{o.count.toLocaleString("id-ID")}</span>
                        </div>
                        <div style={{ height: "5px", background: "var(--color-gold-100)", borderRadius: "9999px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-gold-500)", borderRadius: "9999px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Browsers */}
            <div style={{
              background: "white", borderRadius: "16px", padding: "24px",
              boxShadow: "var(--shadow-card)",
            }}>
              <h2 style={{
                fontSize: "1rem", fontWeight: 600,
                color: "var(--color-ocean-900)", marginBottom: "16px",
              }}>
                🌐 Browser
              </h2>
              {browsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "var(--color-ocean-400)", fontSize: "0.875rem" }}>Belum ada data</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {browsers.map((b, i) => {
                    const maxCount = browsers[0].count;
                    const pct = maxCount > 0 ? (b.count / maxCount) * 100 : 0;
                    return (
                      <div key={b.browser}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                          <span style={{ color: "var(--color-ocean-900)", fontWeight: i === 0 ? 600 : 500 }}>{b.browser}</span>
                          <span style={{ color: "var(--color-ocean-600)", fontWeight: 600 }}>{b.count.toLocaleString("id-ID")}</span>
                        </div>
                        <div style={{ height: "5px", background: "var(--color-forest-100)", borderRadius: "9999px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-forest-500)", borderRadius: "9999px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Top Pages List */}
          <div style={{
            background: "white", borderRadius: "16px", padding: "24px",
            boxShadow: "var(--shadow-card)", marginBottom: "24px",
          }}>
            <h2 style={{
              fontSize: "1rem", fontWeight: 600,
              color: "var(--color-ocean-900)", marginBottom: "16px",
            }}>
              📄 Halaman Paling Sering Dikunjungi
            </h2>
            {pages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--color-ocean-400)", fontSize: "0.875rem" }}>Belum ada data</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pages.map((p, i) => (
                  <div key={p.page} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: "var(--color-ocean-50)",
                    borderRadius: "8px", border: "1px solid var(--color-ocean-100)"
                  }}>
                     <span style={{ 
                       color: "var(--color-ocean-800)", fontSize: "0.875rem", 
                       fontFamily: "var(--font-mono)", wordBreak: "break-all"
                     }}>
                       {p.page}
                     </span>
                     <span style={{
                       fontSize: "0.85rem", fontWeight: 600, color: "var(--color-ocean-700)",
                       background: "white", padding: "4px 10px", borderRadius: "99px",
                       boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                     }}>
                       {p.count.toLocaleString("id-ID")} x
                     </span>
                  </div>
                ))}
              </div>
            )}
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