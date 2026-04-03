"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBerita } from "@/lib/firebase/berita";
import ImageUpload from "@/components/admin/ImageUpload";
import type { BeritaKategori } from "@/types";

function generateSlug(title: string) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

const ls: React.CSSProperties = {
  display: "block", fontSize: "0.82rem", fontWeight: 500,
  color: "var(--color-ocean-700)", marginBottom: "6px",
};

function TambahBeritaForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [fromCrawl, setFromCrawl] = useState(false);

  const [form, setForm] = useState({
    title:      "",
    slug:       "",
    excerpt:    "",
    content:    "",
    kategori:   "berita" as BeritaKategori,
    author:     "Admin Desa",
    published:  true,
    coverImage: "",
    views:      0,
    sourceUrl:  "",
  });

  // Pre-fill dari hasil crawl jika ada query params
  useEffect(() => {
    const title      = searchParams.get("title")      || "";
    const slug       = searchParams.get("slug")       || "";
    const excerpt    = searchParams.get("excerpt")    || "";
    const content    = searchParams.get("content")    || "";
    const coverImage = searchParams.get("coverImage") || "";
    const sourceUrl  = searchParams.get("sourceUrl")  || "";

    if (title || content) {
      setFromCrawl(true);
      setForm((prev) => ({
        ...prev,
        title:      title      || prev.title,
        slug:       slug       || prev.slug,
        excerpt:    excerpt    || prev.excerpt,
        content:    content    || prev.content,
        coverImage: coverImage || prev.coverImage,
        sourceUrl:  sourceUrl  || prev.sourceUrl,
      }));
    }
  }, [searchParams]);

  function set(key: string, value: string | boolean | number) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" ? { slug: generateSlug(value as string) } : {}),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title || !form.excerpt || !form.content) {
      alert("Judul, ringkasan, dan isi berita wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      await createBerita({
        title:      form.title,
        slug:       form.slug,
        excerpt:    form.excerpt,
        content:    form.content,
        kategori:   form.kategori,
        author:     form.author,
        published:  form.published,
        coverImage: form.coverImage,
        publishedAt: new Date().toISOString(),
      });
      router.push("/admin/berita");
    } catch {
      alert("Gagal menyimpan. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "32px", maxWidth: "820px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-ocean-500)", fontSize: "1.2rem", lineHeight: 1,
          }}
        >
          back
        </button>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1.5rem", color: "var(--color-ocean-900)",
          }}>
            Tambah Berita
          </h1>
          {fromCrawl && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "var(--color-forest-100)", color: "var(--color-forest-700)",
              fontSize: "0.72rem", fontWeight: 600,
              padding: "2px 10px", borderRadius: "9999px", marginTop: "4px",
            }}>
              Diimpor dari URL — silakan edit sebelum menyimpan
            </div>
          )}
        </div>
      </div>

      {/* Banner sumber URL jika dari crawl */}
      {fromCrawl && form.sourceUrl && (
        <div style={{
          background: "#FDF3C8", borderRadius: "12px",
          padding: "12px 16px", marginBottom: "20px",
          border: "1px solid var(--color-gold-300)",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "12px",
          flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-gold-800)", marginBottom: "2px" }}>
              Sumber asli konten
            </div>
            
            <a href={form.sourceUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "0.8rem", color: "var(--color-gold-700)",
                textDecoration: "underline",
                overflow: "hidden", textOverflow: "ellipsis",
                display: "block", maxWidth: "480px", whiteSpace: "nowrap",
              }}
            >
              {form.sourceUrl}
            </a>
          </div>
          <button
            onClick={() => setForm((p) => ({ ...p, sourceUrl: "" }))}
            style={{
              padding: "4px 10px", borderRadius: "7px",
              background: "rgba(0,0,0,0.08)", border: "none",
              cursor: "pointer", fontSize: "0.72rem",
              color: "var(--color-gold-800)", flexShrink: 0,
            }}
          >
            Sembunyikan
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          background: "white", borderRadius: "16px", padding: "28px",
          boxShadow: "var(--shadow-card)",
          display: "flex", flexDirection: "column", gap: "20px",
        }}>

          {/* Judul */}
          <div>
            <label style={ls}>Judul Berita *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Masukkan judul berita..."
              className="input-base"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label style={ls}>Slug URL</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              className="input-base"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
            />
            <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-400)", marginTop: "4px" }}>
              URL: /berita/{form.slug || "slug-otomatis"}
            </div>
          </div>

          {/* Kategori + Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={ls}>Kategori</label>
              <select
                value={form.kategori}
                onChange={(e) => set("kategori", e.target.value)}
                className="input-base"
              >
                <option value="berita">Berita</option>
                <option value="pengumuman">Pengumuman</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="pembangunan">Pembangunan</option>
              </select>
            </div>
            <div>
              <label style={ls}>Status Publikasi</label>
              <select
                value={form.published ? "true" : "false"}
                onChange={(e) => set("published", e.target.value === "true")}
                className="input-base"
              >
                <option value="true">Publik</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>

          {/* Author */}
          <div>
            <label style={ls}>Penulis</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              className="input-base"
            />
          </div>

          {/* Cover Image */}
          <ImageUpload
            value={form.coverImage}
            onChange={(url) => set("coverImage", url)}
            label="Cover Foto (opsional)"
          />

          {/* Preview cover jika ada */}
          {form.coverImage && (
            <div style={{
              background: "var(--color-ocean-50)", borderRadius: "12px",
              padding: "12px", border: "1px solid var(--color-ocean-100)",
            }}>
              <div style={{
                fontSize: "0.78rem", color: "var(--color-ocean-500)",
                marginBottom: "8px", fontWeight: 500,
              }}>
                Preview Cover
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <img
                  src={form.coverImage}
                  alt="cover"
                  style={{
                    width: "80px", height: "60px",
                    objectFit: "cover", borderRadius: "8px", flexShrink: 0,
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-ocean-900)" }}>
                    {form.title || "Judul berita..."}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-500)", marginTop: "4px" }}>
                    {form.kategori} · {form.author}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ringkasan */}
          <div>
            <label style={ls}>Ringkasan / Excerpt *</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              placeholder="Ringkasan singkat berita (tampil di halaman list berita)..."
              className="input-base"
              style={{ resize: "vertical" }}
              required
            />
          </div>

          {/* Isi */}
          <div>
            <label style={ls}>Isi Berita * (HTML diperbolehkan)</label>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={16}
              placeholder={"<p>Tulis isi berita di sini...</p>\n<p>Paragraf kedua...</p>"}
              className="input-base"
              style={{
                resize: "vertical",
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                lineHeight: 1.7,
              }}
              required
            />
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginTop: "5px",
            }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-400)" }}>
                Gunakan tag HTML: &lt;p&gt;, &lt;strong&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-ocean-400)" }}>
                {form.content.replace(/<[^>]+>/g, "").length} karakter
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: "flex", gap: "12px", justifyContent: "flex-end",
            paddingTop: "8px", borderTop: "1px solid var(--color-ocean-100)",
          }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
              style={{ padding: "11px 24px" }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: "11px 28px" }}
            >
              {saving ? "Menyimpan..." : "Simpan Berita"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

export default function TambahBeritaPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "32px", color: "var(--color-ocean-500)" }}>
        Memuat form...
      </div>
    }>
      <TambahBeritaForm />
    </Suspense>
  );
}