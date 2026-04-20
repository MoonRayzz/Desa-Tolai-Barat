"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elText = textRef.current;
    if (elText) {
      requestAnimationFrame(() => {
        elText.style.opacity = "1";
        elText.style.transform = "translateY(0)";
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ background: "var(--color-ocean-900)" }}>

      {/* DYNAMIC VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover", // Memaksa video menutupi layar (akan ter-crop otomatis)
          objectPosition: "center",
          opacity: 0.7, // Sedikit dinaikkan opacity videonya
          zIndex: 0,
        }}
      >
        <source src="/videos/hero-desa.mp4" type="video/mp4" />
      </video>

      {/* VIGNETTE GRADIENT OVERLAY (Efek Sinematik Gelap di Pinggir) */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(circle at center, transparent 20%, var(--color-ocean-900) 100%)",
          opacity: 0.8
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(to top, var(--color-ocean-900) 2%, transparent 40%)"
        }}
      />

      {/* Wave (Bawah) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", height: "60px", display: "block" }}>
          <path d="M0 55 C360 25 720 75 1080 45 C1260 30 1360 60 1440 55 L1440 80 L0 80 Z" fill="white" />
        </svg>
      </div>

      {/* CONTENT CONTAINER - CENTERED DENGAN GLASSMORPHISM */}
      <div className="relative z-10 container-desa pt-28 pb-16 md:pt-32 flex flex-col items-center text-center">
        <div
          ref={textRef}
          style={{
            maxWidth: "860px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: 0,
            transform: "translateY(28px)",
            transition: "opacity 1s ease-out, transform 1s ease-out",

            // EFEK KACA (GLASSMORPHISM)
            background: "rgba(11, 94, 107, 0.25)", // Warna ocean yang transparan
            backdropFilter: "blur(0px)", // Efek blur
            border: "1px solid rgba(255, 255, 255, 0.15)", // Garis batas tipis bercahaya
            padding: "48px 32px",
            borderRadius: "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)",
          }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(212, 160, 23, 0.15)",
            border: "1px solid rgba(245, 200, 66, 0.3)",
            color: "#FAD970", fontSize: "0.75rem", fontWeight: 600,
            padding: "6px 16px", borderRadius: "9999px", marginBottom: "24px",
            textTransform: "uppercase", letterSpacing: "0.05em"
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F5C842", display: "inline-block", animation: "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite" }} />
             Desa Tolai Barat — Mewujudkan Desa PADI(Produktif, Aman, Damai, Indah)
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 8vw, 5rem)",
            fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: "16px",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)"
          }}>
            Desa <span style={{ color: "#F5C842" }}>Tolai</span> Barat
          </h1>

          <p style={{ color: "#94DFE9", fontSize: "1.15rem", marginBottom: "24px", fontWeight: 500 }}>
            Kecamatan Torue · Kabupaten Parigi Moutong
          </p>

          <p style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "40px", maxWidth: "600px" }}>
            Pesisir Teluk Tomini yang indah, kearifan lokal yang terjaga, dan semangat masyarakat yang berdaya.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>
            <Link href="/profil" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1.05rem", borderRadius: "14px", boxShadow: "0 8px 20px rgba(11,94,107,0.4)" }}>
              Jelajahi Desa
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <Link href="/wisata" style={{
              display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)", color: "white",
              fontWeight: 500, fontSize: "1.05rem", padding: "14px 32px", borderRadius: "14px",
              transition: "all 0.2s", textDecoration: "none",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Wisata Lokal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}