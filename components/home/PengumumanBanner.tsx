// File: components/home/PengumumanBanner.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAktifPengumuman } from "@/lib/firebase/pengumuman";
import type { Pengumuman } from "@/types";

const STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  darurat: { bg: "#DC2626", text: "#ffffff", icon: "🚨" }, // Merah
  penting: { bg: "#D4A017", text: "#1A0B00", icon: "📢" }, // Kuning Emas
  normal:  { bg: "#0B5E6B", text: "#ffffff", icon: "ℹ️" },  // Biru Laut
};

export default function PengumumanBanner() {
  const pathname                  = usePathname();
  const [items, setItems]         = useState<Pengumuman[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [filledSurveys, setFilledSurveys] = useState<string[]>([]);
  const [loaded, setLoaded]       = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pg_dismissed");
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setDismissed(new Set(parsed));
      }
    } catch {}

    try {
      const rawSurvei = localStorage.getItem("tolai_sudah_isi_survei");
      if (rawSurvei) {
        setFilledSurveys(JSON.parse(rawSurvei) as string[]);
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
    // Opsional UX: Sembunyikan banner ini secara otomatis jika user sedang berada di halaman yang dituju banner
    .filter((i) => !i.link || i.link !== pathname) 
    // Sembunyikan banner otomatis jika user sudah mengisi survei tsb
    .filter((i) => {
      if (i.link && i.link.startsWith("/survei/")) {
        const sId = i.link.replace("/survei/", "");
        if (filledSurveys.includes(sId)) return false;
      }
      return true;
    })
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
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
            // Responsif: di HP bertumpuk (flex-col) dan lebih rapat, di layar besar berjejer kiri-kanan
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 p-4 sm:py-4 sm:px-6 relative"
          >
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0 pr-8 sm:pr-0">
              {/* Ikon */}
              <span className="text-2xl sm:text-3xl shrink-0 leading-none">{s.icon}</span>

              {/* Area Teks Utama */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Judul */}
                  <span className="font-bold text-base sm:text-lg leading-snug">
                    {item.title}
                  </span>
                  
                  {/* Label Kategori */}
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: "rgba(0,0,0,0.15)" }}
                  >
                    {item.type}
                  </span>
                </div>

                {/* Isi / Keterangan */}
                {item.content.trim() !== "" && (
                  <span className="text-sm sm:text-base opacity-95 leading-relaxed">
                    {item.content.length > 150
                      ? item.content.slice(0, 150) + "..."
                      : item.content}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto pl-10 sm:pl-0">
                {/* Label Tanggal Selesai */}
                {endLabel && (
                  <span className="text-xs sm:text-sm opacity-85 shrink-0 hidden lg:block">
                    s/d {endLabel}
                  </span>
                )}

                {/* Tombol Link (Opsional) */}
                {item.link && (
                  <a
                    href={item.link}
                    style={{
                      color: s.bg,               // Terbalik: teks warna background
                      backgroundColor: s.text,   // Terbalik: background warna teks
                    }}
                    className="inline-block px-4 py-2 text-xs sm:text-sm font-bold rounded-lg no-underline whitespace-nowrap shrink-0 shadow-sm transition hover:opacity-90 active:scale-95"
                  >
                    {item.linkText || "Lihat Detail"}
                  </a>
                )}
            </div>

            {/* Tombol Tutup (X) */}
            <button
              onClick={() => dismiss(item.id)}
              aria-label="Tutup pengumuman"
              className="absolute top-3 right-3 sm:relative sm:top-0 sm:right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer transition"
              style={{
                background: "rgba(0,0,0,0.1)",
                color: s.text,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
            >
              <span className="text-lg sm:text-xl leading-none">&times;</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}