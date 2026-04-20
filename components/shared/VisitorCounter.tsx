"use client";

import { useEffect, useState } from "react";

export default function VisitorCounter() {
  const [stats, setStats] = useState({ total: 0, today: 0 });
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

  return (
    <div style={{
      display: "flex", 
      alignItems: "center", 
      gap: "12px", 
      fontSize: "0.8rem", 
      color: "var(--color-ocean-300)",
      background: "rgba(0, 0, 0, 0.15)",
      padding: "8px 14px",
      borderRadius: "99px",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      width: "fit-content"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span>👥</span>
        <span>Total: <strong style={{ color: "white", fontWeight: 600 }}>{stats.total.toLocaleString("id-ID")}</strong></span>
      </div>
      <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.2)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span>📅</span>
        <span>Hari Ini: <strong style={{ color: "white", fontWeight: 600 }}>{stats.today.toLocaleString("id-ID")}</strong></span>
      </div>
    </div>
  );
}
