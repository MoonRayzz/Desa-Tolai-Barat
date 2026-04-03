"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const NAV = [
  { href: "/admin/dashboard",  icon: "▦",  label: "Dashboard"       },
  { href: "/admin/analytics",  icon: "📊", label: "Pengunjung"      },
  { href: "/admin/settings",   icon: "⚙",  label: "Pengaturan Desa" },
  { href: "/admin/pengumuman", icon: "📢", label: "Pengumuman"      },
  { href: "/admin/berita",     icon: "📰", label: "Berita"          },
  { href: "/admin/layanan",    icon: "📋", label: "Layanan"         },
  { href: "/admin/wisata",     icon: "🏖", label: "Wisata"          },
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

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-ocean-900)",
    }}>
      <div style={{
        width: 40, height: 40,
        border: "3px solid rgba(255,255,255,0.2)",
        borderTop: "3px solid white",
        borderRadius: "50%",
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
        width: "220px",
        background: "var(--color-ocean-900)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          padding: "20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "10px",
              background: "var(--color-ocean-700)",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "1.1rem",
            }}>
              🌊
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: "0.85rem", color: "white",
              }}>
                Tolai Barat
              </div>
              <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
                Panel Admin
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  marginBottom: "2px",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: active ? 500 : 400,
                  color: active
                    ? "var(--color-ocean-300)"
                    : "rgba(255,255,255,0.55)",
                  background: active
                    ? "rgba(94,207,222,0.1)"
                    : "transparent",
                  borderLeft: active
                    ? "2px solid var(--color-ocean-400)"
                    : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{
                  fontSize: "1rem", width: "20px", textAlign: "center",
                }}>
                  {n.icon}
                </span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "8px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {user.email}
          </div>
          <button
            onClick={logout}
            style={{
              width: "100%", padding: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.8rem", cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        background: "var(--color-ocean-50)",
        minHeight: "100vh",
        overflow: "auto",
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