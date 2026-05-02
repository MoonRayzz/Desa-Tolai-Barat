"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  getAllGaleri, createGaleri, deleteGaleri, updateGaleriCover,
  getGaleriImages, getGaleriCover, type GaleriItem,
} from "@/lib/firebase/galeri";
import { uploadImageToCloudinary } from "@/lib/cloudinary/cloudinary";

const KATEGORI_LIST = [
  { value: "wisata",        label: "🏖️ Wisata"        },
  { value: "kegiatan",      label: "🎉 Kegiatan"       },
  { value: "infrastruktur", label: "🏗️ Infrastruktur"  },
  { value: "budaya",        label: "🎭 Budaya"         },
];

interface FilePreview {
  file: File;
  previewUrl: string;
  status: "idle" | "uploading" | "done" | "error";
  uploadedUrl?: string;
}

export default function AdminGaleriPage() {
  const [list, setList]             = useState<GaleriItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [caption, setCaption]       = useState("");
  const [kategori, setKategori]     = useState("wisata");
  const [previews, setPreviews]     = useState<FilePreview[]>([]);
  const [dragOver, setDragOver]     = useState(false);
  // coverIndex saat upload (index dalam previews)
  const [newCoverIdx, setNewCoverIdx] = useState(0);
  // ID album yang sedang di-expand untuk ganti sampul
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [savingCover, setSavingCover] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const data = await getAllGaleri();
    setList(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  /* ── File handling ───────────────────────────────────────────── */
  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setPreviews((prev) => [
      ...prev,
      ...arr.map((f) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: "idle" as const,
      })),
    ]);
  }

  function removePreview(idx: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      const next = prev.filter((_, i) => i !== idx);
      // geser coverIndex jika perlu
      setNewCoverIdx((c) => {
        if (c === idx) return 0;
        if (c > idx) return c - 1;
        return c;
      });
      return next;
    });
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, []);

  /* ── Upload ──────────────────────────────────────────────────── */
  async function handleUpload() {
    if (previews.length === 0 || !caption.trim()) {
      alert("Pilih minimal 1 gambar dan isi keterangan terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < previews.length; i++) {
      setPreviews((p) => p.map((x, j) => j === i ? { ...x, status: "uploading" } : x));
      try {
        const url = await uploadImageToCloudinary(previews[i].file);
        uploadedUrls.push(url);
        setPreviews((p) => p.map((x, j) => j === i ? { ...x, status: "done", uploadedUrl: url } : x));
      } catch {
        setPreviews((p) => p.map((x, j) => j === i ? { ...x, status: "error" } : x));
      }
    }

    if (uploadedUrls.length === 0) {
      alert("Semua gambar gagal diupload.");
      setSubmitting(false);
      return;
    }

    try {
      // coverIndex mengacu pada index di uploadedUrls (bukan previews yang mungkin ada error)
      const safeCoverIdx = Math.min(newCoverIdx, uploadedUrls.length - 1);
      await createGaleri({ imageUrls: uploadedUrls, coverIndex: safeCoverIdx, caption, kategori });
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPreviews([]);
      setNewCoverIdx(0);
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
      await load();
    } catch {
      alert("Gagal menyimpan ke Firestore.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Set sampul existing album ───────────────────────────────── */
  async function handleSetCover(albumId: string, idx: number) {
    setSavingCover(albumId + "-" + idx);
    try {
      await updateGaleriCover(albumId, idx);
      setList((prev) =>
        prev.map((g) => g.id === albumId ? { ...g, coverIndex: idx } : g)
      );
    } finally {
      setSavingCover(null);
    }
  }

  async function handleDelete(id: string, cap: string) {
    if (!confirm(`Hapus album "${cap}"?`)) return;
    await deleteGaleri(id);
    setList((p) => p.filter((g) => g.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div style={{ padding: "32px" }}>
      <h1 style={s.h1}>🖼️ Kelola Galeri</h1>

      {/* ── Upload Form ── */}
      <div style={s.card}>
        <h2 style={s.h2}>Upload Foto Baru</h2>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => previews.length === 0 && inputRef.current?.click()}
          style={{
            ...s.dropzone,
            borderColor: dragOver ? "var(--color-ocean-500)" : "var(--color-ocean-200)",
            background: dragOver ? "var(--color-ocean-100)" : "var(--color-ocean-50)",
            cursor: previews.length === 0 ? "pointer" : "default",
          }}
        >
          {previews.length === 0 ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.8rem", marginBottom: "8px" }}>📸</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-ocean-600)" }}>
                Klik atau seret foto ke sini
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-400)", marginTop: "4px" }}>
                Bisa pilih banyak foto sekaligus · JPG, PNG, WebP · Maks 10 MB/foto
              </div>
            </div>
          ) : (
            <div style={s.previewGrid} onClick={(e) => e.stopPropagation()}>
              {previews.map((p, i) => {
                const isCover = newCoverIdx === i;
                return (
                  <div key={i} style={{ ...s.previewItem, outline: isCover ? "3px solid #0ea5e9" : "none" }}>
                    <img src={p.previewUrl} alt={`preview-${i}`} style={s.previewImg} />

                    {/* Upload status */}
                    {p.status === "uploading" && <div style={{ ...s.badge, background: "rgba(30,100,200,0.85)" }}>⏳</div>}
                    {p.status === "done"      && <div style={{ ...s.badge, background: "rgba(22,163,74,0.9)" }}>✓</div>}
                    {p.status === "error"     && <div style={{ ...s.badge, background: "rgba(220,38,38,0.9)" }}>✗</div>}

                    {/* Cover badge */}
                    {isCover && (
                      <div style={s.coverBadge}>⭐ Sampul</div>
                    )}

                    {/* Set as cover button — only when idle */}
                    {!isCover && !submitting && (
                      <button
                        style={s.setCoverBtn}
                        onClick={() => setNewCoverIdx(i)}
                        title="Jadikan sampul"
                      >
                        ⭐
                      </button>
                    )}

                    {/* Remove */}
                    {p.status !== "uploading" && !submitting && (
                      <button style={s.removeBtn} onClick={() => removePreview(i)} title="Hapus">×</button>
                    )}
                  </div>
                );
              })}

              {/* Add more */}
              {!submitting && (
                <div style={s.addMore} onClick={() => inputRef.current?.click()}>
                  <span style={{ fontSize: "1.6rem" }}>+</span>
                  <span style={{ fontSize: "0.7rem", marginTop: "2px" }}>Tambah</span>
                </div>
              )}
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" multiple
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
            style={{ display: "none" }} />
        </div>

        {previews.length > 1 && (
          <div style={{ fontSize: "0.78rem", color: "var(--color-ocean-500)", marginBottom: "14px" }}>
            ⭐ Klik ikon bintang pada foto untuk menjadikannya <strong>sampul album</strong>
          </div>
        )}

        {/* Caption + Kategori */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={s.label}>Keterangan Album</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)}
              placeholder="Contoh: Kegiatan Gotong Royong 2025" className="input-base" />
          </div>
          <div>
            <label style={s.label}>Kategori</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="input-base">
              {KATEGORI_LIST.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <button onClick={handleUpload} disabled={submitting || previews.length === 0}
            className="btn-primary" style={{ padding: "11px 28px" }}>
            {submitting
              ? `Mengupload ${previews.filter((p) => p.status === "done").length}/${previews.length}...`
              : `Upload ${previews.length > 0 ? `${previews.length} Foto` : "ke Galeri"}`}
          </button>
          {previews.length > 0 && !submitting && (
            <button onClick={() => {
              previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
              setPreviews([]); setNewCoverIdx(0);
              if (inputRef.current) inputRef.current.value = "";
            }} style={s.clearBtn}>Batal semua</button>
          )}
        </div>
      </div>

      {/* ── Gallery list ── */}
      <h2 style={{ ...s.h2, marginBottom: "16px" }}>Semua Album ({list.length})</h2>
      <div style={s.listGrid}>
        {loading ? (
          <div style={{ color: "var(--color-ocean-400)", padding: "20px" }}>Memuat...</div>
        ) : list.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "var(--color-ocean-400)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🖼️</div>
            Belum ada foto. Upload foto pertama!
          </div>
        ) : list.map((g) => {
          const imgs = getGaleriImages(g);
          const cover = getGaleriCover(g);
          const isExpanded = expandedId === g.id;

          return (
            <div key={g.id} style={s.albumCard}>
              {/* Thumbnail */}
              <div style={s.thumbWrap}>
                {cover ? (
                  <img src={cover} alt={g.caption} style={s.thumbMain} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem" }}>📷</div>
                )}
                {imgs.length > 1 && (
                  <div style={s.countBadge}>📷 {imgs.length}</div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "12px" }}>
                <div style={s.albumCaption}>{g.caption}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <span style={s.kategoriTag}>{g.kategori}</span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {imgs.length > 1 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : g.id)}
                        style={{
                          ...s.actionBtn,
                          background: isExpanded ? "var(--color-ocean-100)" : "var(--color-ocean-50)",
                          color: "var(--color-ocean-700)",
                        }}
                      >
                        {isExpanded ? "▲ Tutup" : "⭐ Sampul"}
                      </button>
                    )}
                    <button onClick={() => handleDelete(g.id, g.caption)} style={s.deleteBtn}>Hapus</button>
                  </div>
                </div>
              </div>

              {/* ── Cover Picker (expanded) ── */}
              {isExpanded && (
                <div style={s.expandPanel}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-ocean-700)", marginBottom: "10px" }}>
                    Pilih foto sampul album:
                  </div>
                  <div style={s.coverPickerGrid}>
                    {imgs.map((url, idx) => {
                      const isCover = idx === (g.coverIndex ?? 0);
                      const key = g.id + "-" + idx;
                      const saving = savingCover === key;
                      return (
                        <div
                          key={idx}
                          onClick={() => !isCover && !saving && handleSetCover(g.id, idx)}
                          style={{
                            ...s.coverPickerItem,
                            outline: isCover ? "3px solid #0ea5e9" : "2px solid transparent",
                            cursor: isCover ? "default" : "pointer",
                            opacity: saving ? 0.6 : 1,
                          }}
                          title={isCover ? "Sampul saat ini" : "Jadikan sampul"}
                        >
                          <img src={url} alt={`foto-${idx}`} style={s.coverPickerImg} />
                          {isCover && (
                            <div style={s.coverPickerBadge}>⭐ Sampul</div>
                          )}
                          {saving && (
                            <div style={{ ...s.coverPickerBadge, background: "rgba(0,0,0,0.5)" }}>...</div>
                          )}
                          {!isCover && !saving && (
                            <div style={s.coverPickerHover}>Jadikan Sampul</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Styles ───────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  h1: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.6rem", color: "var(--color-ocean-900)", marginBottom: "28px" },
  h2: { fontSize: "1rem", fontWeight: 600, color: "var(--color-ocean-900)", marginBottom: "20px" },
  card: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-card)", marginBottom: "28px", border: "2px solid var(--color-ocean-100)" },
  label: { display: "block", fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ocean-700)", marginBottom: "6px" },
  dropzone: { border: "2px dashed", borderRadius: "14px", padding: "24px", marginBottom: "14px", minHeight: "140px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  previewGrid: { display: "flex", flexWrap: "wrap", gap: "10px", width: "100%" },
  previewItem: { position: "relative", width: "100px", height: "100px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  badge: { position: "absolute", bottom: "4px", left: "4px", color: "white", fontSize: "0.7rem", borderRadius: "6px", padding: "1px 6px", fontWeight: 700 },
  coverBadge: { position: "absolute", top: "0", left: "0", right: "0", background: "rgba(14,165,233,0.88)", color: "white", fontSize: "0.6rem", fontWeight: 700, textAlign: "center", padding: "3px 0" },
  setCoverBtn: { position: "absolute", bottom: "4px", right: "4px", background: "rgba(0,0,0,0.5)", border: "none", color: "#fde047", width: "22px", height: "22px", borderRadius: "50%", fontSize: "0.7rem", cursor: "pointer", lineHeight: "22px", textAlign: "center", padding: 0 },
  removeBtn: { position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.55)", border: "none", color: "white", width: "22px", height: "22px", borderRadius: "50%", fontSize: "0.9rem", cursor: "pointer", lineHeight: "20px", textAlign: "center", padding: 0 },
  addMore: { width: "100px", height: "100px", borderRadius: "10px", border: "2px dashed var(--color-ocean-300)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-ocean-400)", flexShrink: 0 },
  clearBtn: { background: "none", border: "1px solid var(--color-ocean-200)", color: "var(--color-ocean-600)", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontSize: "0.85rem" },
  listGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" },
  albumCard: { borderRadius: "12px", overflow: "hidden", background: "white", boxShadow: "var(--shadow-card)", border: "1px solid var(--color-ocean-100)" },
  thumbWrap: { height: "160px", overflow: "hidden", position: "relative", background: "var(--color-ocean-100)" },
  thumbMain: { width: "100%", height: "100%", objectFit: "cover" },
  countBadge: { position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "white", fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" },
  albumCaption: { fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ocean-900)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" },
  kategoriTag: { background: "var(--color-ocean-100)", color: "var(--color-ocean-700)", fontSize: "0.65rem", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px" },
  actionBtn: { padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--color-ocean-200)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 },
  deleteBtn: { padding: "4px 10px", borderRadius: "6px", background: "#FEE2E2", color: "#991B1B", border: "none", cursor: "pointer", fontSize: "0.72rem", fontWeight: 500 },
  // Cover picker
  expandPanel: { borderTop: "1px solid var(--color-ocean-100)", padding: "14px 12px 16px", background: "var(--color-ocean-50)" },
  coverPickerGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  coverPickerItem: { position: "relative", width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" },
  coverPickerImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  coverPickerBadge: { position: "absolute", top: 0, left: 0, right: 0, background: "rgba(14,165,233,0.9)", color: "white", fontSize: "0.55rem", fontWeight: 700, textAlign: "center", padding: "3px 0" },
  coverPickerHover: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", color: "white", fontSize: "0.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "4px" },
};