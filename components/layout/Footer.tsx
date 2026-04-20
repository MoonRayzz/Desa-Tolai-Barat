// File: components/layout/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { getDesaSettings } from "@/lib/firebase/settings";
import { cloudinaryResize } from "@/lib/utils";
import VisitorCounter from "@/components/shared/VisitorCounter";

// Cache per-request: deduplicate fetch jika dipanggil dari komponen lain dalam render yang sama
const getSettings = cache(getDesaSettings);

const COL_NAVIGASI = [
  { label: "Profil Desa",   href: "/profil"  },
  { label: "Berita & Info", href: "/berita"  },
  { label: "Wisata Alam",   href: "/wisata"  },
  { label: "Potensi Desa",  href: "/potensi" },
  { label: "BUMDes",        href: "/bumdes"  },
  { label: "Galeri",        href: "/galeri"  },
  { label: "Layanan Surat", href: "/layanan" },
];

const COL_LAYANAN = [
  { label: "Surat Keterangan",    href: "/layanan" },
  { label: "Keterangan Domisili", href: "/layanan" },
  { label: "Keterangan Usaha",    href: "/layanan" },
  { label: "Data Kependudukan",   href: "/layanan" },
];

// Warna program — hanya pakai token yang terdefinisi di globals.css
const PROGRAM_COLORS = [
  "var(--color-gold-400)",
  "var(--color-ocean-400)",
  "var(--color-forest-400)",
  "var(--color-gold-300)",
];

export default async function Footer() {
  const s = await getSettings();

  const programList =
    s.programUnggulan && s.programUnggulan.length > 0
      ? s.programUnggulan
      : [
          { judul: "Torue Berdaya",  isi: "Penguatan UMKM & pariwisata berbasis digital." },
          { judul: "Pantai Arjuna",  isi: "Destinasi wisata utama di pesisir Teluk Tomini." },
        ];

  return (
    <footer style={{ background: "var(--color-ocean-900)", color: "white" }}>
      <div className="container-desa" style={{ paddingTop: "64px", paddingBottom: "64px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
        }}>

          {/* ── Kolom 1: Identitas Desa ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              {s.logoDesa ? (
                <Image
                  src={cloudinaryResize(s.logoDesa, 104)}
                  alt="Logo Desa Tolai Barat"
                  width={52}
                  height={52}
                  style={{ objectFit: "contain", flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 46, height: 46, borderRadius: "10px",
                  background: "var(--color-ocean-700)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3C10 3 5 7 5 11.5C5 14.3 7.2 16.5 10 16.5C12.8 16.5 15 14.3 15 11.5C15 7 10 3 10 3Z" fill="white" opacity="0.9" />
                    <path d="M10 8C10 8 7.5 10 7.5 11.5C7.5 12.9 8.6 14 10 14C11.4 14 12.5 12.9 12.5 11.5C12.5 10 10 8 10 8Z" fill="#F5C842" />
                  </svg>
                </div>
              )}

              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "white" }}>
                  Desa Tolai Barat
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-ocean-300)", marginTop: "2px" }}>
                  Website Resmi
                </div>
              </div>
            </div>

            <p style={{ color: "var(--color-ocean-300)", fontSize: "0.85rem", lineHeight: 1.75, marginBottom: "20px" }}>
              Situs portal informasi publik dan layanan masyarakat Desa Tolai Barat secara terintegrasi.
            </p>

            {/* Kontak — SVG inline, bukan emoji */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem", color: "var(--color-ocean-300)" }}>
              <span style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {s.alamat || "Kec. Torue, Parigi Moutong"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {s.telepon || "-"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                {s.email || "-"}
              </span>
            </div>
          </div>

          {/* ── Kolom 2: Navigasi ── */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: "0.85rem", color: "white", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Navigasi
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {COL_NAVIGASI.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Kolom 3: Layanan ── */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: "0.85rem", color: "white", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Layanan Desa
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {COL_LAYANAN.map((l, idx) => (
                <li key={`layanan-${idx}`}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Kolom 4: Program Desa ── */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: "0.85rem", color: "white", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Program Desa
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {programList.map((p, idx) => (
                <div
                  key={`program-${idx}`}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px", padding: "14px",
                  }}
                >
                  <div style={{ color: PROGRAM_COLORS[idx % PROGRAM_COLORS.length], fontSize: "0.78rem", fontWeight: 600, marginBottom: "6px" }}>
                    {p.judul}
                  </div>
                  <div style={{ color: "var(--color-ocean-300)", fontSize: "0.78rem", lineHeight: 1.6 }}>
                    {p.isi}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Kolom 5: Visitor Counter ── */}
          <div>
            <VisitorCounter />
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
      <div className="container-desa" style={{
        paddingTop: "24px", paddingBottom: "24px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "16px",
      }}>
        <div style={{ fontSize: "0.85rem", color: "var(--color-ocean-400)" }}>
          &copy; {new Date().getFullYear()} Desa Tolai Barat. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
