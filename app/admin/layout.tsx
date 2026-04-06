  "use client";

  import Link from "next/link";
  import { usePathname, useRouter } from "next/navigation";
  import { useEffect, useState } from "react";
  import { AuthProvider, useAuth } from "@/contexts/AuthContext";

  const NAV = [
  { href: "/admin/dashboard",  icon: "▦",  label: "Dashboard"       },
  { href: "/admin/analytics",  icon: "📊", label: "Pengunjung"      },
  { href: "/admin/settings",   icon: "⚙",  label: "Pengaturan Desa" },
  { href: "/admin/pengumuman", icon: "📢", label: "Pengumuman"      },
  { href: "/admin/berita",     icon: "📰", label: "Berita"          },
  { href: "/admin/layanan",    icon: "📋", label: "Layanan"         },
  { href: "/admin/wisata",     icon: "🏖", label: "Wisata"          },
  { href: "/admin/bumdes",     icon: "🏢", label: "BUMDes"          }, // <--- TAMBAHKAN BARIS INI
  { href: "/admin/umkm",       icon: "🏪", label: "UMKM"            },
  { href: "/admin/galeri",     icon: "🖼", label: "Galeri"          },
  { href: "/admin/perangkat",  icon: "👥", label: "Perangkat"       },
  { href: "/admin/survei",     icon: "📊", label: "Survei"          },
  { href: "/admin/aspirasi",   icon: "💌", label: "Aspirasi"        },
];

  function AdminShell({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router   = useRouter();
    const pathname = usePathname();
    
    // STATE BARU: Untuk mengatur apakah sidebar minimize atau tidak
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
      if (!loading && !user && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    }, [user, loading, pathname, router]);

    if (loading) return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--color-ocean-900)",
      }}>
        <div style={{
          width: 40, height: 40, border: "3px solid rgba(255,255,255,0.2)",
          borderTop: "3px solid white", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

    if (!user || pathname === "/admin/login") {
      return <>{children}</>;
    }

    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside style={{
          // LEBAR DINAMIS: 76px jika minimize, 230px jika terbuka
          width: isCollapsed ? "76px" : "230px",
          background: "var(--color-ocean-900)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden", // Mencegah scroll menyamping saat transisi
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Animasi transisi halus
        }}>
          {/* Header / Logo */}
          <div style={{
            padding: isCollapsed ? "20px 0" : "20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            flexDirection: isCollapsed ? "column" : "row",
            gap: isCollapsed ? "16px" : "0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: 34, height: 34, borderRadius: "10px",
                background: "var(--color-ocean-700)",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.1rem",
                flexShrink: 0,
              }}>
                🌊
              </div>
              
              {/* Hanya tampilkan teks jika TIDAK minimize */}
              {!isCollapsed && (
                <div style={{ whiteSpace: "nowrap" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.85rem", color: "white" }}>
                    Tolai Barat
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
                    Panel Admin
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Toggle Minimize */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                background: "transparent", border: "none", color: "var(--color-ocean-300)",
                cursor: "pointer", padding: "4px", display: "flex", alignItems: "center",
                justifyContent: "center", borderRadius: "6px",
              }}
              title={isCollapsed ? "Perbesar Menu" : "Kecilkan Menu"}
            >
              {/* Menggunakan SVG Hamburger / Panah */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isCollapsed ? (
                  <path d="M9 18l6-6-6-6" /> // Panah Kanan
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </> // Hamburger Menu
                )}
              </svg>
            </button>
          </div>

          {/* Navigasi */}
          <nav style={{ flex: 1, padding: isCollapsed ? "12px 8px" : "12px 12px" }}>
            {NAV.map((n) => {
              const active = pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  title={isCollapsed ? n.label : ""} // Munculkan tooltip teks saat cursor diarahkan di mode minimize
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    gap: "10px",
                    padding: isCollapsed ? "12px 0" : "10px 14px",
                    borderRadius: "10px",
                    marginBottom: "4px",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: active ? 500 : 400,
                    color: active ? "var(--color-ocean-300)" : "rgba(255,255,255,0.55)",
                    background: active ? "rgba(94,207,222,0.1)" : "transparent",
                    borderLeft: active && !isCollapsed ? "3px solid var(--color-ocean-400)" : "3px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {n.icon}
                  </span>
                  
                  {/* Hanya tampilkan label jika TIDAK minimize */}
                  {!isCollapsed && (
                    <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer (User + Logout) */}
          <div style={{
            padding: isCollapsed ? "16px 8px" : "16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: isCollapsed ? "center" : "stretch",
          }}>
            {!isCollapsed && (
              <div style={{
                fontSize: "0.7rem", color: "rgba(255,255,255,0.4)",
                marginBottom: "12px", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user.email}
              </div>
            )}
            
            <button
              onClick={logout}
              title={isCollapsed ? "Keluar" : ""}
              style={{
                width: "100%",
                padding: isCollapsed ? "10px 0" : "10px",
                background: "rgba(239, 68, 68, 0.1)", // Warna kemerahan sedikit
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "8px",
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.85rem", cursor: "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
            >
              <span>🚪</span>
              {!isCollapsed && <span>Keluar</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{
          flex: 1,
          background: "var(--color-ocean-50)",
          minHeight: "100vh",
          overflow: "auto",
          transition: "all 0.3s ease", // Transisi agar saat sidebar membesar, konten menyesuaikan dengan halus
        }}>
          {children}
        </main>
      </div>
    );
  }

  export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <AuthProvider>
        <AdminShell>{children}</AdminShell>
      </AuthProvider>
    );
  }