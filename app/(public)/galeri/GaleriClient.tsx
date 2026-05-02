"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GaleriItem } from "@/lib/firebase/galeri";
import { getGaleriImages, getGaleriCover } from "@/lib/firebase/galeri";

/* ── Constants ───────────────────────────────────────────────── */
const KATEGORI = [
  { value: "semua", label: "Semua", emoji: "✨" },
  { value: "wisata", label: "Wisata", emoji: "🏖️" },
  { value: "kegiatan", label: "Kegiatan", emoji: "🎉" },
  { value: "infrastruktur", label: "Infrastruktur", emoji: "🏗️" },
  { value: "budaya", label: "Budaya", emoji: "🎭" },
];

const WARNA: Record<string, string> = {
  wisata: "linear-gradient(135deg,#0ea5e9,#0369a1)",
  kegiatan: "linear-gradient(135deg,#f59e0b,#b45309)",
  infrastruktur: "linear-gradient(135deg,#22c55e,#15803d)",
  budaya: "linear-gradient(135deg,#a855f7,#7e22ce)",
};

/* ── Mosaic layout: spans for visual variety ─────────────────── */
function getSpan(i: number): { col: string; row: string } {
  const patterns = [
    { col: "span 2", row: "span 2" }, // big
    { col: "span 1", row: "span 1" },
    { col: "span 1", row: "span 1" },
    { col: "span 1", row: "span 2" }, // tall
    { col: "span 1", row: "span 1" },
    { col: "span 1", row: "span 1" },
  ];
  return patterns[i % patterns.length];
}

/* ── Lightbox ────────────────────────────────────────────────── */
interface LightboxState {
  item: GaleriItem;
  photoIndex: number;
}

function Lightbox({
  state, onClose,
}: { state: LightboxState; onClose: () => void }) {
  const { item, photoIndex: initIdx } = state;
  const images = getGaleriImages(item);
  const [idx, setIdx] = useState(initIdx);
  const touchStartX = useRef<number>(0);

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  /* Keyboard navigation */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  /* Prevent body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const currentUrl = images[idx];

  return (
    <div
      style={lb.overlay}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        style={lb.modal}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        }}
      >
        {/* Close button */}
        <button style={lb.closeBtn} onClick={onClose} aria-label="Tutup">×</button>

        {/* Image area */}
        <div style={lb.imgWrap}>
          {currentUrl ? (
            <img
              key={currentUrl}
              src={currentUrl}
              alt={item.caption}
              style={lb.img}
            />
          ) : (
            <div style={lb.placeholder}>
              <span style={{ fontSize: "4rem" }}>📷</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button style={{ ...lb.navBtn, left: "12px" }} onClick={prev} aria-label="Sebelumnya">‹</button>
            <button style={{ ...lb.navBtn, right: "12px" }} onClick={next} aria-label="Berikutnya">›</button>
          </>
        )}

        {/* Info footer */}
        <div style={lb.footer}>
          <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "white", marginBottom: "6px" }}>
            {item.caption}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={lb.tag}>{item.kategori}</span>
            {images.length > 1 && (
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
                {idx + 1} / {images.length}
              </span>
            )}
          </div>
          {/* Dot indicators */}
          {images.length > 1 && (
            <div style={lb.dots}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  style={{
                    ...lb.dot,
                    background: i === idx ? "white" : "rgba(255,255,255,0.35)",
                    transform: i === idx ? "scale(1.3)" : "scale(1)",
                  }}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function GaleriClient({ initialData }: { initialData: GaleriItem[] }) {
  const [aktif, setAktif] = useState("semua");
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = aktif === "semua"
    ? initialData
    : initialData.filter((g) => g.kategori === aktif);

  function openLightbox(item: GaleriItem, photoIndex = 0) {
    setLightbox({ item, photoIndex });
  }

  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <div className="container-desa" style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(2rem,5vw,3.2rem)", color: "white",
            letterSpacing: "-0.02em", marginBottom: "12px",
          }}>
            Galeri Desa
          </h1>
          <p style={{ color: "var(--color-ocean-200)", fontSize: "1rem", maxWidth: "480px", margin: "0 auto" }}>
            Momen dan dokumentasi kegiatan Desa Tolai Barat
          </p>
        </div>
      </div>

      <section style={{ background: "var(--color-ocean-50)", padding: "48px 0 72px" }}>
        <div className="container-desa">

          {/* Filter pills */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "10px",
            marginBottom: "40px", justifyContent: "center",
          }}>
            {KATEGORI.map((k) => {
              const active = aktif === k.value;
              return (
                <button
                  key={k.value}
                  onClick={() => setAktif(k.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "9px 20px", borderRadius: "9999px",
                    border: "2px solid " + (active ? "var(--color-ocean-600)" : "var(--color-ocean-200)"),
                    background: active ? "var(--color-ocean-600)" : "white",
                    color: active ? "white" : "var(--color-ocean-700)",
                    fontWeight: 600, fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: active ? "0 4px 14px rgba(3,105,161,0.3)" : "none",
                  }}
                >
                  <span>{k.emoji}</span>
                  {k.label}
                  {k.value !== "semua" && (
                    <span style={{
                      background: active ? "rgba(255,255,255,0.25)" : "var(--color-ocean-100)",
                      color: active ? "white" : "var(--color-ocean-600)",
                      borderRadius: "9999px", padding: "0 7px",
                      fontSize: "0.7rem", fontWeight: 700,
                    }}>
                      {initialData.filter((g) => g.kategori === k.value).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Empty state */}
          {initialData.length === 0 ? (
            <EmptyState text="Belum ada foto di galeri." />
          ) : filtered.length === 0 ? (
            <EmptyState text="Tidak ada foto di kategori ini." />
          ) : (
            <>
              {/* Stats bar */}
              <div style={{
                textAlign: "center", marginBottom: "32px",
                fontSize: "0.82rem", color: "var(--color-ocean-500)", fontWeight: 500,
              }}>
                Menampilkan <strong>{filtered.length}</strong> album
                {" "}({filtered.reduce((s, g) => s + getGaleriImages(g).length, 0)} foto)
              </div>

              {/* Mosaic Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gridAutoRows: "180px",
                gap: "12px",
              }}>
                {filtered.map((g, i) => {
                  const thumb = getGaleriCover(g);
                  const span = getSpan(i);
                  const coverIdx = typeof g.coverIndex === "number" ? g.coverIndex : 0;
                  return (
                    <GaleriCard
                      key={g.id}
                      item={g}
                      thumb={thumb}
                      colSpan={span.col}
                      rowSpan={span.row}
                      delay={i % 9}
                      mounted={mounted}
                      onClick={() => openLightbox(g, coverIdx)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox state={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

/* ── Card ─────────────────────────────────────────────────────── */
function GaleriCard({
  item, thumb, colSpan, rowSpan, delay, mounted, onClick,
}: {
  item: GaleriItem;
  thumb: string | undefined;
  colSpan: string;
  rowSpan: string;
  delay: number;
  mounted: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const imgs = getGaleriImages(item);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        gridColumn: colSpan,
        gridRow: rowSpan,
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        background: WARNA[item.kategori] ?? "var(--color-ocean-700)",
        boxShadow: hover
          ? "0 20px 50px rgba(0,0,0,0.35)"
          : "0 4px 20px rgba(0,0,0,0.12)",
        transform: hover ? "translateY(-4px) scale(1.015)" : "translateY(0) scale(1)",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        opacity: mounted ? 1 : 0,
        animation: mounted ? `fadeUp 0.5s ease-out ${delay * 50}ms forwards` : "none",
      }}
    >
      {/* Image */}
      {thumb && (
        <img
          src={thumb}
          alt={item.caption}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            position: "absolute", inset: 0,
            transform: hover ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />
      )}

      {/* Top-right: multi-photo badge */}
      {imgs.length > 1 && (
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          color: "white", fontSize: "0.7rem", fontWeight: 700,
          padding: "3px 9px", borderRadius: "9999px",
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          📷 {imgs.length}
        </div>
      )}

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
        opacity: hover ? 1 : 0.7,
        transition: "opacity 0.3s",
      }} />

      {/* Caption */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "12px 14px 14px",
        transform: hover ? "translateY(0)" : "translateY(4px)",
        transition: "transform 0.3s",
      }}>
        <div style={{
          fontSize: "0.72rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.7)", marginBottom: "3px",
        }}>
          {item.kategori}
        </div>
        <div style={{
          color: "white", fontWeight: 600,
          fontSize: "0.85rem", lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {item.caption}
        </div>
        {/* Hover cta */}
        {hover && (
          <div style={{
            marginTop: "8px", fontSize: "0.72rem",
            color: "rgba(255,255,255,0.8)",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <span>Lihat {imgs.length > 1 ? `${imgs.length} foto` : "foto"}</span>
            <span>→</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      textAlign: "center", padding: "80px 20px",
      background: "white", borderRadius: "24px",
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🖼️</div>
      <p style={{ color: "var(--color-ocean-500)", fontSize: "1rem" }}>{text}</p>
    </div>
  );
}

/* ── Lightbox styles ─────────────────────────────────────────── */
const lb: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px", animation: "fadeIn 0.2s ease",
  },
  modal: {
    position: "relative", maxWidth: "860px", width: "100%",
    borderRadius: "20px", overflow: "hidden",
    background: "#0f172a",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
    display: "flex", flexDirection: "column",
    maxHeight: "90vh",
  },
  closeBtn: {
    position: "absolute", top: "12px", right: "14px", zIndex: 10,
    background: "rgba(255,255,255,0.12)", border: "none",
    color: "white", width: "36px", height: "36px",
    borderRadius: "50%", fontSize: "1.3rem",
    cursor: "pointer", lineHeight: "34px", textAlign: "center",
    backdropFilter: "blur(8px)", padding: 0,
  },
  imgWrap: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", overflow: "hidden",
    minHeight: "300px", maxHeight: "60vh",
    background: "#060e1c",
  },
  img: {
    width: "100%", height: "100%",
    objectFit: "contain",
    animation: "fadeIn 0.25s ease",
  },
  placeholder: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "100%", height: "300px",
  },
  navBtn: {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.12)", border: "none",
    color: "white", width: "44px", height: "44px",
    borderRadius: "50%", fontSize: "1.6rem",
    cursor: "pointer", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 5, lineHeight: 1,
  },
  footer: {
    padding: "16px 20px 20px",
    background: "linear-gradient(to bottom, #0f172a, #0c1624)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  tag: {
    background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)",
    fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px",
    borderRadius: "9999px", textTransform: "uppercase",
  },
  dots: {
    display: "flex", gap: "6px", marginTop: "10px",
  },
  dot: {
    width: "8px", height: "8px", borderRadius: "50%",
    border: "none", cursor: "pointer", padding: 0,
    transition: "all 0.2s",
  },
};