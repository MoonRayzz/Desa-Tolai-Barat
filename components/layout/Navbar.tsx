// File: components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getDesaSettings } from "@/lib/firebase/settings";
import { cloudinaryResize } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Beranda",      href: "/"        },
  { label: "Profil",       href: "/profil"  },
  { label: "Berita",       href: "/berita"  },
  { label: "Wisata",       href: "/wisata"  },
  { label: "Potensi Desa", href: "/potensi" },
  { label: "BUMDes",       href: "/bumdes"  },
  { label: "Galeri",       href: "/galeri"  },
  { label: "Survei",       href: "/survei"  },
  { label: "Layanan",      href: "/layanan" },
];

// Module-level cache — tidak fetch ulang setiap mount
let _cachedLogo: string | null = null;

export default function Navbar() {
  const pathname                = usePathname();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoUrl, setLogoUrl]   = useState(_cachedLogo ?? "");

  // Scroll listener
  useEffect(() => {
    const fn = () =>
      setScrolled(prev => {
        const next = window.scrollY > 20;
        return prev === next ? prev : next;
      });
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Tutup menu saat navigasi
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll saat mobile menu terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Fetch logo dengan cache
  useEffect(() => {
    if (_cachedLogo !== null) {
      setLogoUrl(_cachedLogo);
      return;
    }
    getDesaSettings().then(s => {
      _cachedLogo = s.logoDesa || "";
      setLogoUrl(_cachedLogo);
    });
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const clrLink     = scrolled ? "#0D1F2D" : "white";
  const clrMuted    = scrolled ? "rgba(13,31,45,0.65)" : "rgba(255,255,255,0.75)";
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

            {/* ── Logo & Nama Desa ── */}
            <Link href="/" style={{
              display: "flex", alignItems: "center",
              gap: "12px", textDecoration: "none",
            }}>
              {logoUrl ? (
                <Image
                  src={cloudinaryResize(logoUrl, 88)}
                  alt="Logo Desa Tolai Barat"
                  width={44}
                  height={44}
                  style={{ objectFit: "contain", flexShrink: 0 }}
                  priority
                />
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

            {/* ── Nav Desktop ── */}
            <nav style={{ display: "none", alignItems: "center", gap: "2px" }} className="lg-flex">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`navbar-link${isActive(l.href) ? " navbar-link--active" : ""}`}
                  style={{
                    color: isActive(l.href) ? clrLink : clrMuted,
                    background: isActive(l.href) ? clrActiveBg : "transparent",
                    "--navbar-hover-bg": scrolled
                      ? "rgba(11,94,107,0.07)"
                      : "rgba(255,255,255,0.12)",
                  } as React.CSSProperties}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* ── CTA Desktop ── */}
            <div style={{ display: "none" }} className="lg-flex">
              <Link href="/layanan" className="btn-primary" style={{ padding: "9px 20px", fontSize: "0.875rem" }}>
                Portal Warga
              </Link>
            </div>

            {/* ── Hamburger ── */}
            <button
              onClick={() => setOpen(prev => !prev)}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
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

      {/* ── Mobile Drawer ── */}
      {open && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 40,
              background: "rgba(13,31,45,0.5)", backdropFilter: "blur(4px)",
            }}
          />

          {/* Drawer */}
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
              width: "280px", background: "white", boxShadow: "var(--shadow-card-lg)",
              display: "flex", flexDirection: "column",
              animation: "slideInRight 0.25s ease-out",
            }}
          >
            {/* Header drawer */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderBottom: "1px solid var(--color-ocean-100)",
            }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: "1rem", color: "var(--color-ocean-900)",
              }}>
                Menu
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-ocean-600)", padding: "4px" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: "12px", marginBottom: "4px",
                    fontSize: "0.9rem", fontWeight: 500,
                    color: isActive(l.href) ? "var(--color-ocean-700)" : "var(--color-ocean-800)",
                    background: isActive(l.href) ? "var(--color-ocean-100)" : "transparent",
                    textDecoration: "none", transition: "background 0.15s",
                  }}
                >
                  {l.label}
                  {isActive(l.href) && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "var(--color-ocean-700)", flexShrink: 0,
                    }} />
                  )}
                </Link>
              ))}
            </nav>

            {/* Footer drawer */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-ocean-100)" }}>
              <Link href="/layanan" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                Portal Warga
              </Link>
              <p style={{
                textAlign: "center", fontSize: "0.7rem",
                color: "var(--color-ocean-400)", marginTop: "10px",
              }}>
                Desa Tolai Barat · Kode Pos 94473
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
