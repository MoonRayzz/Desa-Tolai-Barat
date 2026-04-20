// File: components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getDesaSettings } from "@/lib/firebase/settings";

const NAV_LINKS = [
  { label: "Beranda",      href: "/"         },
  { label: "Profil",       href: "/profil"   },
  { label: "Berita",       href: "/berita"   },
  { label: "Wisata",       href: "/wisata"   },
  { label: "Potensi Desa", href: "/potensi"  },
  { label: "Galeri",       href: "/galeri"   },
  { label: "Survei",       href: "/survei"   },
  { label: "Layanan",      href: "/layanan"  },
];

export default function Navbar() {
  const pathname                = usePathname();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [logoUrl, setLogoUrl]   = useState("");

  useEffect(() => {
    const fn = () => setScrolled(prev => { const next = window.scrollY > 20; return prev === next ? prev : next; });
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    getDesaSettings().then(s => setLogoUrl(s.logoDesa || ""));
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const clrLink     = scrolled ? "#0D1F2D" : "white";
  const clrMuted    = scrolled ? "rgba(13,31,45,0.65)" : "rgba(255,255,255,0.75)";
  const clrHoverBg  = scrolled ? "rgba(11,94,107,0.07)" : "rgba(255,255,255,0.12)";
  const clrActiveBg = scrolled ? "rgba(11,94,107,0.1)"  : "rgba(255,255,255,0.18)";

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all 0.3s ease",
        backgroundColor: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(11,94,107,0.1)" : "none",
        boxShadow: scrolled ? "var(--shadow-card)" : "none",
      }}>
        <div className="container-desa">
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", height: "68px",
          }}>

            <Link href="/" style={{
              display: "flex", alignItems: "center",
              gap: "12px", textDecoration: "none",
            }}>
              
              {/* --- LOGO DIPERBAIKI: Tanpa background putih, ukuran diperbesar --- */}
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Desa" style={{ width: "44px", height: "44px", objectFit: "contain", flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 38, height: 38, borderRadius: "10px",
                  background: "var(--color-ocean-700)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3C10 3 5 7 5 11.5C5 14.3 7.2 16.5 10 16.5C12.8 16.5 15 14.3 15 11.5C15 7 10 3 10 3Z" fill="white" opacity="0.9" />
                    <path d="M10 8C10 8 7.5 10 7.5 11.5C7.5 12.9 8.6 14 10 14C11.4 14 12.5 12.9 12.5 11.5C12.5 10 10 8 10 8Z" fill="#F5C842" />
                  </svg>
                </div>
              )}

              <div style={{ lineHeight: 1.2 }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 600,
                  fontSize: "0.9rem", color: clrLink, transition: "color 0.3s",
                }}>
                  Desa Tolai Barat
                </div>
                <div style={{
                  fontSize: "0.7rem", color: clrMuted,
                  transition: "color 0.3s", marginTop: "1px",
                }}>
                  Kec. Torue · Parigi Moutong
                </div>
              </div>
            </Link>

            <nav style={{ display: "none", alignItems: "center", gap: "2px" }} className="lg-flex">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    padding: "7px 10px", borderRadius: "10px",
                    fontSize: "0.82rem", fontWeight: 500,
                    color: isActive(l.href) ? clrLink : clrMuted,
                    background: isActive(l.href) ? clrActiveBg : "transparent",
                    transition: "all 0.2s", textDecoration: "none",
                  }}
                  onMouseEnter={(e) => { if (!isActive(l.href)) (e.currentTarget as HTMLElement).style.background = clrHoverBg; }}
                  onMouseLeave={(e) => { if (!isActive(l.href)) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div style={{ display: "none" }} className="lg-flex">
              <Link href="/layanan" className="btn-primary" style={{ padding: "9px 20px", fontSize: "0.875rem" }}>
                Portal Warga
              </Link>
            </div>

            <button
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              className="lg-hide"
              style={{
                padding: "8px", borderRadius: "10px", border: "none",
                background: "transparent", cursor: "pointer",
                color: clrLink, transition: "color 0.3s",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                {open ? (
                  <path d="M5 5L17 17M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <>
                    <line x1="3" y1="7"  x2="19" y2="7"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="3" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </>
                )}
              </svg>
            </button>

          </div>
        </div>
      </header>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 40,
              background: "rgba(13,31,45,0.5)", backdropFilter: "blur(4px)",
            }}
          />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
            width: "280px", background: "white", boxShadow: "var(--shadow-card-lg)",
            display: "flex", flexDirection: "column", animation: "fadeIn 0.2s ease-out",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-ocean-100)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "var(--color-ocean-900)" }}>Menu</span>
              <button onClick={() => setOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-ocean-600)", padding: "4px" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href} href={l.href}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: "12px", marginBottom: "4px", fontSize: "0.9rem", fontWeight: 500,
                    color: isActive(l.href) ? "var(--color-ocean-700)" : "var(--color-ocean-800)",
                    background: isActive(l.href) ? "var(--color-ocean-100)" : "transparent",
                    textDecoration: "none", transition: "background 0.15s",
                  }}
                >
                  {l.label}
                  {isActive(l.href) && (<span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-ocean-700)", flexShrink: 0 }} />)}
                </Link>
              ))}
            </nav>

            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-ocean-100)" }}>
              <Link href="/layanan" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>Portal Warga</Link>
              <p style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--color-ocean-400)", marginTop: "10px" }}>Desa Tolai Barat · Kode Pos 94473</p>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .lg-flex { display: flex !important; }
          .lg-hide { display: none !important; }
        }
        @media (max-width: 1023px) {
          .lg-flex { display: none !important; }
        }
      `}</style>
    </>
  );
}