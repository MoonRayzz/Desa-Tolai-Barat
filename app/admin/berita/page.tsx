"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllBeritaAdmin, deleteBerita } from "@/lib/firebase/berita";
import { formatTanggal } from "@/lib/utils";
import type { Berita } from "@/types";

interface CrawlResult {
  title:        string;
  slug:         string;
  excerpt:      string;
  content:      string;
  coverImage:   string;
  sourceUrl:    string;
  sourceDomain: string;
}

export default function AdminBeritaPage() {
  const router                  = useRouter();
  const [list, setList]         = useState<Berita[]>([]);
  const [loading, setLoading]   = useState(true);

  // Crawl state
  const [showCrawl, setShowCrawl]     = useState(false);
  const [crawlUrl, setCrawlUrl]       = useState("");
  const [crawling, setCrawling]       = useState(false);
  const [crawlError, setCrawlError]   = useState("");
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);

  async function load() {
    const data = await getAllBeritaAdmin();
    setList(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus berita "${title}"?`)) return;
    await deleteBerita(id);
    setList((prev) => prev.filter((b) => b.id !== id));
  }

  function openCrawl() {
    setCrawlUrl("");
    setCrawlError("");
    setCrawlResult(null);
    setShowCrawl(true);
  }

  function closeCrawl() {
    setShowCrawl(false);
    setCrawlUrl("");
    setCrawlError("");
    setCrawlResult(null);
  }

  async function handleCrawl() {
    if (!crawlUrl.trim()) {
      setCrawlError("Masukkan URL berita terlebih dahulu.");
      return;
    }
    if (!crawlUrl.startsWith("http")) {
      setCrawlError("URL harus diawali dengan https:// atau http://");
      return;
    }

    setCrawlError("");
    setCrawlResult(null);
    setCrawling(true);

    try {
      const res  = await fetch("/api/crawl", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url: crawlUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCrawlError(data.error || "Gagal mengambil konten.");
        return;
      }

      setCrawlResult(data as CrawlResult);
    } catch {
      setCrawlError("Gagal terhubung ke server. Periksa koneksi internet.");
    } finally {
      setCrawling(false);
    }
  }

  function handleUseResult() {
    if (!crawlResult) return;
    const params = new URLSearchParams({
      title:      crawlResult.title,
      slug:       crawlResult.slug,
      excerpt:    crawlResult.excerpt,
      content:    crawlResult.content,
      coverImage: crawlResult.coverImage,
      sourceUrl:  crawlResult.sourceUrl,
    });
    closeCrawl();
    router.push("/admin/berita/tambah?" + params.toString());
  }

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
            Kelola Berita
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--color-ocean-500)", marginTop: "2px" }}>
            {list.length} artikel
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={openCrawl}
            className="btn-secondary"
            style={{ padding: "10px 18px", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            🔗 Import dari URL
          </button>
          <Link href="/admin/berita/tambah" className="btn-primary" style={{ padding: "10px 22px" }}>
            + Tambah Berita
          </Link>
        </div>
      </div>

      {/* Tabel berita */}
      <div style={{
        background: "white", borderRadius: "16px",
        boxShadow: "var(--shadow-card)", overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-ocean-400)" }}>
            Memuat...
          </div>
        ) : list.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--color-ocean-400)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📰</div>
            <p>Belum ada berita.</p>
            <p style={{ fontSize: "0.82rem", marginTop: "6px" }}>
              Tambah manual atau import dari URL berita lain.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--color-ocean-50)" }}>
                  {["Judul", "Kategori", "Status", "Tanggal", "Aksi"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: "0.75rem", fontWeight: 600,
                      color: "var(--color-ocean-600)",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((b, i) => (
                  <tr key={b.id} style={{
                    borderTop: "1px solid var(--color-ocean-100)",
                    background: i % 2 === 0 ? "white" : "var(--color-ocean-50)",
                  }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{
                        fontSize: "0.875rem", fontWeight: 500,
                        color: "var(--color-ocean-900)",
                        maxWidth: "320px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {b.title}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{
                        background: "var(--color-ocean-100)", color: "var(--color-ocean-700)",
                        fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px",
                        borderRadius: "9999px", textTransform: "capitalize",
                      }}>
                        {b.kategori}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px",
                        borderRadius: "9999px",
                        background: b.published ? "#DCFCE7" : "#FEE2E2",
                        color: b.published ? "#15803D" : "#991B1B",
                      }}>
                        {b.published ? "Publik" : "Draft"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.8rem", color: "var(--color-ocean-500)", whiteSpace: "nowrap" }}>
                      {b.publishedAt ? formatTanggal(b.publishedAt) : "-"}
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link href={`/admin/berita/${b.id}/edit`} style={{
                          padding: "5px 12px", borderRadius: "7px",
                          background: "var(--color-ocean-100)", color: "var(--color-ocean-700)",
                          fontSize: "0.78rem", fontWeight: 500, textDecoration: "none",
                        }}>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(b.id, b.title)}
                          style={{
                            padding: "5px 12px", borderRadius: "7px",
                            background: "#FEE2E2", color: "#991B1B",
                            fontSize: "0.78rem", fontWeight: 500,
                            border: "none", cursor: "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crawl */}
      {showCrawl && (
        <div
          onClick={closeCrawl}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(13,31,45,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center",
            justifyContent: "center", padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", borderRadius: "20px",
              width: "100%", maxWidth: "680px",
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            }}
          >
            {/* Modal header */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              borderBottom: "1px solid var(--color-ocean-100)",
            }}>
              <div>
                <h2 style={{
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: "1.15rem", color: "var(--color-ocean-900)",
                }}>
                  Import Berita dari URL
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--color-ocean-500)", marginTop: "2px" }}>
                  Tempel link berita, sistem akan mengambil konten secara otomatis.
                </p>
              </div>
              <button
                onClick={closeCrawl}
                style={{
                  border: "none", background: "none",
                  cursor: "pointer", color: "var(--color-ocean-500)",
                  fontSize: "1.2rem", lineHeight: 1, padding: "4px",
                }}
              >
                x
              </button>
            </div>

            {/* Input URL */}
            <div style={{ padding: "24px" }}>
              <label style={{
                display: "block", fontSize: "0.82rem", fontWeight: 500,
                color: "var(--color-ocean-700)", marginBottom: "8px",
              }}>
                URL Berita
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="url"
                  value={crawlUrl}
                  onChange={(e) => { setCrawlUrl(e.target.value); setCrawlError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCrawl(); } }}
                  placeholder="https://contoh.com/berita/judul-berita"
                  className="input-base"
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button
                  onClick={handleCrawl}
                  disabled={crawling}
                  className="btn-primary"
                  style={{ padding: "0 20px", flexShrink: 0, whiteSpace: "nowrap" }}
                >
                  {crawling ? "Mengambil..." : "Ambil Konten"}
                </button>
              </div>

              {/* Loading */}
              {crawling && (
                <div style={{
                  marginTop: "20px", padding: "20px",
                  background: "var(--color-ocean-50)", borderRadius: "12px",
                  textAlign: "center",
                }}>
                  <div style={{
                    width: 32, height: 32,
                    border: "3px solid var(--color-ocean-200)",
                    borderTop: "3px solid var(--color-ocean-600)",
                    borderRadius: "50%",
                    margin: "0 auto 12px",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  <p style={{ fontSize: "0.875rem", color: "var(--color-ocean-600)" }}>
                    Mengambil dan memproses konten dari URL...
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Error */}
              {crawlError && (
                <div style={{
                  marginTop: "14px", padding: "12px 16px",
                  background: "#FEE2E2", color: "#991B1B",
                  borderRadius: "10px", fontSize: "0.875rem",
                  border: "1px solid #FCA5A5",
                }}>
                  {crawlError}
                </div>
              )}

              {/* Result preview */}
              {crawlResult && (
                <div style={{ marginTop: "20px" }}>
                  {/* Source badge */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    marginBottom: "16px",
                  }}>
                    <span style={{
                      background: "var(--color-forest-100)",
                      color: "var(--color-forest-700)",
                      fontSize: "0.72rem", fontWeight: 600,
                      padding: "3px 10px", borderRadius: "9999px",
                    }}>
                      Berhasil diambil dari {crawlResult.sourceDomain}
                    </span>
                  </div>

                  {/* Cover image */}
                  {crawlResult.coverImage && (
                    <div style={{
                      height: "180px", borderRadius: "12px",
                      overflow: "hidden", marginBottom: "16px",
                      background: "var(--color-ocean-100)",
                    }}>
                      <img
                        src={crawlResult.coverImage}
                        alt="Cover"
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Title */}
                  <div style={{
                    background: "var(--color-ocean-50)", borderRadius: "12px",
                    padding: "16px", marginBottom: "12px",
                  }}>
                    <div style={{
                      fontSize: "0.72rem", fontWeight: 600,
                      color: "var(--color-ocean-500)", marginBottom: "6px",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      Judul
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)", fontWeight: 600,
                      fontSize: "1rem", color: "var(--color-ocean-900)",
                      lineHeight: 1.4,
                    }}>
                      {crawlResult.title || "(Judul tidak ditemukan)"}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div style={{
                    background: "var(--color-ocean-50)", borderRadius: "12px",
                    padding: "16px", marginBottom: "12px",
                  }}>
                    <div style={{
                      fontSize: "0.72rem", fontWeight: 600,
                      color: "var(--color-ocean-500)", marginBottom: "6px",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      Ringkasan (excerpt)
                    </div>
                    <p style={{
                      fontSize: "0.875rem", color: "var(--color-ocean-700)",
                      lineHeight: 1.65,
                    }}>
                      {crawlResult.excerpt || "(Tidak ada ringkasan)"}
                    </p>
                  </div>

                  {/* Content preview */}
                  <div style={{
                    background: "var(--color-ocean-50)", borderRadius: "12px",
                    padding: "16px", marginBottom: "20px",
                  }}>
                    <div style={{
                      fontSize: "0.72rem", fontWeight: 600,
                      color: "var(--color-ocean-500)", marginBottom: "6px",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      Konten (preview 300 karakter pertama)
                    </div>
                    <p style={{
                      fontSize: "0.82rem", color: "var(--color-ocean-600)",
                      lineHeight: 1.6, fontFamily: "var(--font-mono)",
                    }}>
                      {crawlResult.content
                        .replace(/<[^>]+>/g, " ")
                        .replace(/\s+/g, " ")
                        .trim()
                        .slice(0, 300)
                      }
                      {crawlResult.content.length > 300 && "..."}
                    </p>
                  </div>

                  {/* Info stats */}
                  <div style={{
                    display: "flex", gap: "12px", flexWrap: "wrap",
                    fontSize: "0.78rem", color: "var(--color-ocean-500)",
                    marginBottom: "20px",
                  }}>
                    <span>
                      Panjang konten:{" "}
                      <strong style={{ color: "var(--color-ocean-700)" }}>
                        {crawlResult.content.replace(/<[^>]+>/g, "").length} karakter
                      </strong>
                    </span>
                    <span>
                      Cover foto:{" "}
                      <strong style={{ color: crawlResult.coverImage ? "var(--color-forest-600)" : "var(--color-ocean-400)" }}>
                        {crawlResult.coverImage ? "Ada" : "Tidak ada"}
                      </strong>
                    </span>
                  </div>

                  {/* Notice */}
                  <div style={{
                    padding: "12px 14px",
                    background: "#FDF3C8",
                    borderRadius: "10px",
                    border: "1px solid var(--color-gold-300)",
                    fontSize: "0.78rem",
                    color: "var(--color-gold-800)",
                    lineHeight: 1.7,
                    marginBottom: "20px",
                  }}>
                    Konten di atas akan dibuka di form editor untuk diedit sebelum disimpan.
                    Pastikan Anda memiliki hak untuk menggunakan konten dari sumber ini,
                    atau gunakan sebagai referensi penulisan.
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={closeCrawl}
                      className="btn-secondary"
                      style={{ padding: "11px 24px", flex: 1 }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleUseResult}
                      className="btn-primary"
                      style={{ padding: "11px 24px", flex: 2 }}
                    >
                      Lanjut ke Editor
                    </button>
                  </div>
                </div>
              )}

              {/* Tips */}
              {!crawling && !crawlResult && !crawlError && (
                <div style={{
                  marginTop: "16px", padding: "14px 16px",
                  background: "var(--color-ocean-50)", borderRadius: "10px",
                  fontSize: "0.78rem", color: "var(--color-ocean-600)",
                  lineHeight: 1.8,
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "6px", color: "var(--color-ocean-700)" }}>
                    Tips penggunaan:
                  </div>
                  <div>Tempelkan URL lengkap dari artikel berita, contoh:</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", marginTop: "4px", color: "var(--color-ocean-500)" }}>
                    https://tribunnews.com/regional/2025/01/01/judul-berita
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    Bekerja paling baik dengan: Tribun News, Detik, Kompas, Antara, media lokal Sulteng.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}