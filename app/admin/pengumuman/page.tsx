"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllPengumuman,
  deletePengumuman,
  updatePengumuman,
  isExpired,
  isUpcoming,
} from "@/lib/firebase/pengumuman";
import type { Pengumuman } from "@/types";

type Filter = "aktif" | "agenda" | "semua" | "arsip";

const PRIORITY_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  darurat: { label: "Darurat", bg: "#FEE2E2", text: "#991B1B" },
  penting: { label: "Penting", bg: "#FDF3C8", text: "#854F0B" },
  normal:  { label: "Normal",  bg: "#E0F4F7", text: "#0B5E6B" },
};

export default function AdminPengumumanPage() {
  const [list, setList]       = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<Filter>("aktif");
  const [broadcasting, setBroadcasting] = useState<string | null>(null);

  async function handleBroadcast(p: Pengumuman) {
    if (!confirm(`Kirim Push Notification ke semua warga berlangganan untuk "${p.title}"?`)) return;
    setBroadcasting(p.id);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Informasi Baru: " + p.title,
          content: p.content.slice(0, 150) + (p.content.length > 150 ? "..." : ""),
          link: p.link || "/",
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Berhasil mengirim ke ${data.successCount} perangkat.`);
      } else {
        alert("Gagal mengirim: " + data.error);
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem saat menghubungi backend.");
    }
    setBroadcasting(null);
  }

  async function load() {
    const data = await getAllPengumuman();
    setList(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm("Hapus \"" + title + "\"?")) return;
    await deletePengumuman(id);
    setList((p) => p.filter((x) => x.id !== id));
  }

  async function toggleAktif(item: Pengumuman) {
    await updatePengumuman(item.id, { aktif: !item.aktif });
    setList((p) =>
      p.map((x) => (x.id === item.id ? { ...x, aktif: !x.aktif } : x))
    );
  }

  const filtered = list.filter((p) => {
    if (filter === "aktif")  return p.aktif && !isExpired(p.endDate);
    if (filter === "agenda") return p.type === "agenda";
    if (filter === "arsip")  return !p.aktif || isExpired(p.endDate);
    return true;
  });

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "aktif",  label: "Aktif"  },
    { key: "agenda", label: "Agenda" },
    { key: "semua",  label: "Semua"  },
    { key: "arsip",  label: "Arsip"  },
  ];

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
            Pengumuman dan Agenda
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--color-ocean-500)", marginTop: "2px" }}>
            {list.length} total item
          </p>
        </div>
        <Link href="/admin/pengumuman/tambah" className="btn-primary" style={{ padding: "10px 22px" }}>
          + Tambah Baru
        </Link>
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
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-ocean-400)" }}>
          Memuat data...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: "60px", textAlign: "center",
          background: "white", borderRadius: "16px",
          boxShadow: "var(--shadow-card)", color: "var(--color-ocean-400)",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📋</div>
          <p>Tidak ada item di kategori ini.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((p) => {
            const pr      = PRIORITY_STYLE[p.priority] ?? PRIORITY_STYLE.normal;
            const expired = isExpired(p.endDate);
            const upcoming = isUpcoming(p.startDate);

            const startLabel = new Date(p.startDate + "T00:00:00").toLocaleDateString("id-ID", {
              day: "numeric", month: "short", year: "numeric",
            });
            const endLabel = p.endDate
              ? new Date(p.endDate + "T00:00:00").toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : null;

            const barColor =
              p.priority === "darurat" ? "#DC2626"
              : p.priority === "penting" ? "#D4A017"
              : "#0B5E6B";

            return (
              <div key={p.id} style={{
                background: "white",
                borderRadius: "14px",
                padding: "16px 20px",
                boxShadow: "var(--shadow-card)",
                border: "1px solid var(--color-ocean-100)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                opacity: expired ? 0.65 : 1,
              }}>
                {/* Priority bar */}
                <div style={{
                  width: 4, height: 50, borderRadius: "2px",
                  background: barColor, flexShrink: 0,
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "5px" }}>
                    <span style={{
                      background: p.type === "agenda" ? "var(--color-forest-100)" : "var(--color-ocean-100)",
                      color:      p.type === "agenda" ? "var(--color-forest-700)" : "var(--color-ocean-700)",
                      fontSize: "0.65rem", fontWeight: 600,
                      padding: "2px 8px", borderRadius: "9999px",
                    }}>
                      {p.type === "agenda" ? "Agenda" : "Pengumuman"}
                    </span>
                    <span style={{
                      background: pr.bg, color: pr.text,
                      fontSize: "0.65rem", fontWeight: 600,
                      padding: "2px 8px", borderRadius: "9999px",
                    }}>
                      {pr.label}
                    </span>
                    {expired && (
                      <span style={{ background: "#F1F5F9", color: "#64748B", fontSize: "0.65rem", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px" }}>
                        Selesai
                      </span>
                    )}
                    {upcoming && !expired && (
                      <span style={{ background: "#F3EEFF", color: "#5B21B6", fontSize: "0.65rem", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px" }}>
                        Segera
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-ocean-900)" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-500)", marginTop: "3px" }}>
                    {startLabel}
                    {endLabel && (" - " + endLabel)}
                  </div>
                </div>

                {/* Toggle aktif */}
                <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-ocean-500)" }}>
                    {p.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                  <button
                    onClick={() => toggleAktif(p)}
                    style={{
                      width: 38, height: 22,
                      borderRadius: "9999px",
                      background: p.aktif ? "var(--color-ocean-600)" : "var(--color-ocean-200)",
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      top: 3,
                      left: p.aktif ? 19 : 3,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                    }} />
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleBroadcast(p)}
                    disabled={broadcasting === p.id}
                    style={{
                      padding: "6px 14px", borderRadius: "8px",
                      background: "var(--color-gold-100)",
                      color: "var(--color-gold-700)",
                      fontSize: "0.78rem", fontWeight: 700,
                      border: "none", cursor: broadcasting === p.id ? "wait" : "pointer",
                      opacity: broadcasting === p.id ? 0.6 : 1,
                    }}
                  >
                    {broadcasting === p.id ? "Mengirim..." : "📢 Broadcast"}
                  </button>
                  <Link
                    href={"/admin/pengumuman/" + p.id + "/edit"}
                    style={{
                      padding: "6px 14px", borderRadius: "8px",
                      background: "var(--color-ocean-100)",
                      color: "var(--color-ocean-700)",
                      fontSize: "0.78rem", fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    style={{
                      padding: "6px 14px", borderRadius: "8px",
                      background: "#FEE2E2", color: "#991B1B",
                      fontSize: "0.78rem", fontWeight: 500,
                      border: "none", cursor: "pointer",
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}