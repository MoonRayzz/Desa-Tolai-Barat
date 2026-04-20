// File: app/admin/layout.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { getDesaSettings } from "@/lib/firebase/settings";
import { cloudinaryResize } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard",  icon: "▦",  label: "Dashboard"       },
  { href: "/admin/analytics",  icon: "📊", label: "Pengunjung"      },
  { href: "/admin/settings",   icon: "⚙",  label: "Pengaturan Desa" },
  { href: "/admin/pengumuman", icon: "📢", label: "Pengumuman"      },
  { href: "/admin/berita",     icon: "📰", label: "Berita"          },
  { href: "/admin/layanan",    icon: "📋", label: "Layanan"         },
  { href: "/admin/wisata",     icon: "🏖", label: "Wisata"          },
  { href: "/admin/bumdes",     icon: "🏢", label: "BUMDes"          },
  { href: "/admin/potensi",    icon: "🌾", label: "Potensi Desa"    },
  { href: "/admin/galeri",     icon: "🖼", label: "Galeri"          },
  { href: "/admin/perangkat",  icon: "👥", label: "Perangkat"       },
  { href: "/admin/survei",     icon: "📊", label: "Survei"          },
  { href: "/admin/fasilitas",  icon: "🏫", label: "Fasilitas"       },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
    getDesaSettings().then(s => setLogoUrl(s.logoDesa || ""));
  }, [user, loading, pathname, router]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-ocean-900)" }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.2)", borderTop: "3px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user && pathname !== "/admin/login") return null;
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width: isCollapsed ? "76px" : "230px", background: "var(--color-ocean-900)", display: "flex", flexDirection: "column",
        flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto", overflowX: "hidden", transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}>
        <div style={{ padding: isCollapsed ? "20px 0" : "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", flexDirection: isCollapsed ? "column" : "row", gap: isCollapsed ? "16px" : "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            
            {logoUrl ? (
              <Image
                src={cloudinaryResize(logoUrl, 72)}
                alt="Logo Desa Tolai Barat"
                width={36}
                height={36}
                style={{ objectFit: "contain", flexShrink: 0 }}
              />
            ) : (
              <div style={{ 
                width: 34, height: 34, borderRadius: "8px", 
                background: "var(--color-ocean-700)", 
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0,
              }}>
                🌊
              </div>
            )}
            
            {!isCollapsed && (<div><div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.85rem", color: "white" }}>Tolai Barat</div><div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>Panel Admin</div></div>)}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: "transparent", border: "none", color: "var(--color-ocean-300)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? <path d="M9 18l6-6-6-6" /> : <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>}
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1, padding: isCollapsed ? "12px 8px" : "12px 12px" }}>
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} title={isCollapsed ? n.label : ""} style={{
                display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start", gap: "10px", padding: isCollapsed ? "12px 0" : "10px 14px", borderRadius: "10px", marginBottom: "4px", textDecoration: "none", fontSize: "0.875rem", fontWeight: active ? 500 : 400, color: active ? "var(--color-ocean-300)" : "rgba(255,255,255,0.55)", background: active ? "rgba(94,207,222,0.1)" : "transparent", borderLeft: active && !isCollapsed ? "3px solid var(--color-ocean-400)" : "3px solid transparent", transition: "all 0.2s"
              }}>
                <span style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{n.icon}</span>
                {!isCollapsed && <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: isCollapsed ? "16px 8px" : "16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: isCollapsed ? "center" : "stretch" }}>
          {!isCollapsed && <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginBottom: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>}
          <button onClick={logout} title={isCollapsed ? "Keluar" : ""} style={{ width: "100%", padding: isCollapsed ? "10px 0" : "10px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span>🚪</span>{!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, background: "var(--color-ocean-50)", minHeight: "100vh", overflow: "auto", transition: "all 0.3s ease" }}>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><AdminShell>{children}</AdminShell></AuthProvider>;
}