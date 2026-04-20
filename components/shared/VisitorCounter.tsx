"use client";

import { useEffect, useState } from "react";

export default function VisitorCounter() {
  const [stats, setStats] = useState({ total: 0, today: 0, thisMonth: 0, topCity: "-" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/analytics/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.total !== undefined) {
          setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!mounted || stats.total === 0) return null;

  const ITEMS = [
    { label: "Total", value: stats.total, icon: "👥" },
    { label: "Bulan Ini", value: stats.thisMonth, icon: "📆" },
    { label: "Hari Ini", value: stats.today, icon: "📅" },
  ];

  return (
    <div>
      <h4 style={{ fontWeight: 600, fontSize: "0.85rem", color: "white", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Statistik Portal
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {ITEMS.map((item, idx) => (
          <div key={idx} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingBottom: "8px", borderBottom: idx < ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
          }}>
            <span style={{ fontSize: "0.82rem", color: "var(--color-ocean-300)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{item.icon}</span> {item.label}
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}>
              {item.value.toLocaleString("id-ID")}
            </span>
          </div>
        ))}

        {stats.topCity !== "-" && (
          <div style={{
            marginTop: "6px", background: "rgba(255,255,255,0.05)",
            padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{ fontSize: "0.65rem", color: "var(--color-ocean-400)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>🔥 Top Lokasi Hari Ini</div>
            <div style={{ fontSize: "0.82rem", color: "white", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📍</span> {stats.topCity}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
