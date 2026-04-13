"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  getAllLayanan,
  createLayanan,
  updateLayanan,
  deleteLayanan,
  seedLayanan,
  TEMA_COLORS,
} from "@/lib/firebase/layanan";
import type { LayananDesa, LayananTema } from "@/types";

const EMPTY: Omit<LayananDesa, "id"> = {
  icon:   "📄",
  judul:  "",
  syarat: [""],
  waktu:  "1 hari kerja",
  tema:   "ocean",
  aktif:  true,
  urutan: 99,
};

const ls: React.CSSProperties = {
  display: "block", fontSize: "0.82rem", fontWeight: 500,
  color: "var(--color-ocean-700)", marginBottom: "6px",
};

export default function AdminLayananPage() {
  const [list, setList]       = useState<LayananDesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState<Omit<LayananDesa, "id"> | null>(null);
  const [editId, setEditId]   = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function load() {
    const data = await getAllLayanan();
    setList(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ ...EMPTY, syarat: [""] });
    setEditId(null);
  }

  function openEdit(l: LayananDesa) {
    setForm({
      icon:   l.icon,
      judul:  l.judul,
      syarat: [...l.syarat],
      waktu:  l.waktu,
      tema:   l.tema,
      aktif:  l.aktif,
      urutan: l.urutan,
    });
    setEditId(l.id);
  }

  function closeForm() {
    setForm(null);
    setEditId(null);
  }

  function setF(key: string, value: string | boolean | number) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function setSyarat(index: number, value: string) {
    setForm((prev) => {
      if (!prev) return prev;
      const syarat = [...prev.syarat];
      syarat[index] = value;
      return { ...prev, syarat };
    });
  }

  function addSyarat() {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, syarat: [...prev.syarat, ""] };
    });
  }

  function removeSyarat(index: number) {
    setForm((prev) => {
      if (!prev) return prev;
      if (prev.syarat.length <= 1) return prev;
      return { ...prev, syarat: prev.syarat.filter((_, i) => i !== index) };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.judul.trim()) {
      alert("Nama layanan wajib diisi.");
      return;
    }
    const cleanedSyarat = form.syarat.filter((s) => s.trim() !== "");
    if (cleanedSyarat.length === 0) {
      alert("Minimal satu persyaratan harus diisi.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, syarat: cleanedSyarat };
      if (editId) await updateLayanan(editId, payload);
      else        await createLayanan(payload);
      closeForm();
      await load();
    } catch {
      alert("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, judul: string) {
    if (!confirm("Hapus layanan \"" + judul + "\"?")) return;
    await deleteLayanan(id);
    setList((p) => p.filter((l) => l.id !== id));
  }

  async function handleToggleAktif(item: LayananDesa) {
    await updateLayanan(item.id, { aktif: !item.aktif });
    setList((p) =>
      p.map((l) => (l.id === item.id ? { ...l, aktif: !l.aktif } : l))
    );
  }

  async function handleSeed() {
    if (!confirm("Isi layanan default? Proses ini hanya berjalan jika layanan masih kosong.")) return;
    setSeeding(true);
    try {
      const count = await seedLayanan();
      if (count > 0) {
        alert(count + " layanan default berhasil ditambahkan.");
        await load();
      } else {
        alert("Layanan sudah ada, seed dibatalkan.");
      }
    } catch {
      alert("Gagal seed data.");
    } finally {
      setSeeding(false);
    }
  }

  // PERBAIKAN: Ubah label agar lebih bermakna bagi Admin
  const TEMA_OPTIONS: { value: LayananTema; label: string }[] = [
    { value: "ocean",  label: "Administrasi Umum (Biru)"  },
    { value: "gold",   label: "Sosial & Kesejahteraan (Kuning)" },
    { value: "forest", label: "Perizinan & Usaha (Hijau)" },
  ];

  // PERBAIKAN: Mapping label untuk tampilan tabel Admin
  const KATEGORI_LABEL: Record<string, string> = {
    ocean: "Administrasi Umum",
    gold: "Sosial & Kesejahteraan",
    forest: "Perizinan Usaha"
  };

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
            Kelola Layanan Desa
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--color-ocean-500)", marginTop: "2px" }}>
            {list.length} layanan terdaftar
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {list.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="btn-secondary"
              style={{ padding: "10px 18px", fontSize: "0.875rem" }}
            >
              {seeding ? "Memuat..." : "Isi Data Default"}
            </button>
          )}
          <button
            onClick={openAdd}
            className="btn-primary"
            style={{ padding: "10px 22px" }}
          >
            + Tambah Layanan
          </button>
        </div>
      </div>

      {/* Form tambah / edit */}
      {form && (
        <div style={{
          background: "white", borderRadius: "16px", padding: "24px",
          boxShadow: "var(--shadow-card)", marginBottom: "24px",
          border: "2px solid var(--color-ocean-200)",
        }}>
          <h2 style={{
            fontSize: "1.1rem", fontWeight: 600,
            color: "var(--color-ocean-900)", marginBottom: "20px",
          }}>
            {editId ? "Edit Layanan" : "Tambah Layanan Baru"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Row 1: icon, judul, waktu */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 160px",
              gap: "16px",
              marginBottom: "16px",
            }}>
              <div>
                <label style={ls}>Ikon (emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setF("icon", e.target.value)}
                  className="input-base"
                  style={{ textAlign: "center", fontSize: "1.2rem" }}
                  maxLength={4}
                />
              </div>
              <div>
                <label style={ls}>Nama Layanan *</label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setF("judul", e.target.value)}
                  placeholder="contoh: Surat Keterangan Domisili"
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label style={ls}>Estimasi Waktu</label>
                <input
                  type="text"
                  value={form.waktu}
                  onChange={(e) => setF("waktu", e.target.value)}
                  placeholder="1 hari kerja"
                  className="input-base"
                />
              </div>
            </div>

            {/* Row 2: tema, urutan, aktif */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px",
              gap: "16px",
              marginBottom: "16px",
            }}>
              <div>
                <label style={ls}>Kategori Layanan</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  {TEMA_OPTIONS.map((t) => {
                    const c = TEMA_COLORS[t.value];
                    const active = form.tema === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setF("tema", t.value)}
                        style={{
                          flex: 1,
                          padding: "10px 8px",
                          borderRadius: "10px",
                          border: active
                            ? "2px solid " + c.border
                            : "1px solid var(--color-ocean-200)",
                          background: active ? c.bg : "white",
                          color: active ? c.text : "var(--color-ocean-600)",
                          fontSize: "0.78rem",
                          fontWeight: active ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                
                {/* PERBAIKAN: Kotak Panduan Admin */}
                <div style={{ 
                  background: "rgba(11, 94, 107, 0.05)", borderLeft: "3px solid var(--color-ocean-400)", 
                  padding: "12px 16px", borderRadius: "0 8px 8px 0", fontSize: "0.8rem", color: "var(--color-ocean-700)" 
                }}>
                  <strong>💡 Panduan Kategori:</strong><br/>
                  • <b>Administrasi Umum:</b> Untuk surat-surat kependudukan (Cth: KTP, Domisili, Pengantar SKCK).<br/>
                  • <b>Sosial & Kesejahteraan:</b> Untuk bantuan dan kelayakan (Cth: Surat Keterangan Tidak Mampu).<br/>
                  • <b>Perizinan & Usaha:</b> Untuk legalitas bisnis dan acara (Cth: Surat Keterangan Usaha, Izin Keramaian).
                </div>

              </div>
              <div>
                <label style={ls}>Urutan Tampil</label>
                <input
                  type="number"
                  value={form.urutan}
                  onChange={(e) => setF("urutan", parseInt(e.target.value) || 99)}
                  className="input-base"
                  min={1}
                />
              </div>
            </div>

            {/* Syarat array */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}>
                <label style={{ ...ls, marginBottom: 0 }}>Persyaratan Dokumen *</label>
                <button
                  type="button"
                  onClick={addSyarat}
                  style={{
                    padding: "4px 12px", borderRadius: "7px",
                    background: "var(--color-ocean-100)",
                    color: "var(--color-ocean-700)",
                    border: "none", cursor: "pointer",
                    fontSize: "0.78rem", fontWeight: 500,
                  }}
                >
                  + Tambah Syarat
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {form.syarat.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "var(--color-ocean-100)",
                      color: "var(--color-ocean-700)",
                      fontSize: "0.7rem", fontWeight: 700,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => setSyarat(i, e.target.value)}
                      placeholder={"Syarat ke-" + (i + 1)}
                      className="input-base"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeSyarat(i)}
                      disabled={form.syarat.length <= 1}
                      style={{
                        padding: "7px 10px", borderRadius: "8px",
                        background: form.syarat.length <= 1 ? "#F1F5F9" : "#FEE2E2",
                        color: form.syarat.length <= 1 ? "#94A3B8" : "#991B1B",
                        border: "none",
                        cursor: form.syarat.length <= 1 ? "not-allowed" : "pointer",
                        fontSize: "0.85rem", flexShrink: 0,
                      }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Aktif checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <input
                type="checkbox"
                id="layanan-aktif"
                checked={form.aktif}
                onChange={(e) => setF("aktif", e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <label
                htmlFor="layanan-aktif"
                style={{ fontSize: "0.875rem", color: "var(--color-ocean-700)", cursor: "pointer", fontWeight: 500 }}
              >
                Aktif dan tampil di halaman portal warga
              </label>
            </div>

            {/* Actions */}
            <div style={{
              display: "flex", gap: "10px",
              paddingTop: "16px", borderTop: "1px solid var(--color-ocean-100)",
            }}>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ padding: "10px 22px" }}
              >
                {saving ? "Menyimpan..." : editId ? "Update Layanan" : "Simpan Layanan"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="btn-secondary"
                style={{ padding: "10px 22px" }}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List layanan */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--color-ocean-400)" }}>
          Memuat data layanan...
        </div>
      ) : list.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px",
          background: "white", borderRadius: "16px",
          boxShadow: "var(--shadow-card)", color: "var(--color-ocean-400)",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📋</div>
          <p style={{ marginBottom: "12px" }}>Belum ada layanan.</p>
          <p style={{ fontSize: "0.82rem" }}>
            Klik "Isi Data Default" untuk memuat 6 layanan standar, atau klik "+ Tambah Layanan" untuk membuat manual.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {list.map((l, i) => {
            const c = TEMA_COLORS[l.tema] ?? TEMA_COLORS.ocean;
            return (
              <div key={l.id} style={{
                background: "white",
                borderRadius: "14px",
                boxShadow: "var(--shadow-card)",
                border: "1px solid var(--color-ocean-100)",
                overflow: "hidden",
                opacity: l.aktif ? 1 : 0.65,
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 20px",
                  flexWrap: "wrap",
                }}>
                  {/* Urutan */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--color-ocean-100)",
                    color: "var(--color-ocean-700)",
                    fontSize: "0.75rem", fontWeight: 700,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>

                  {/* Icon + tema color preview */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "10px",
                    background: c.bg,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "1.25rem",
                    flexShrink: 0,
                  }}>
                    {l.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-ocean-900)" }}>
                      {l.judul}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-500)", marginTop: "2px" }}>
                      {l.syarat.length} persyaratan · Estimasi {l.waktu}
                    </div>
                  </div>

                  {/* Tema badge - PERBAIKAN DI SINI */}
                  <span style={{
                    background: c.bg, color: c.text,
                    fontSize: "0.68rem", fontWeight: 600,
                    padding: "4px 10px", borderRadius: "6px",
                    flexShrink: 0, border: `1px solid ${c.border}`
                  }}>
                    {KATEGORI_LABEL[l.tema] || l.tema}
                  </span>

                  {/* Toggle aktif */}
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-ocean-500)" }}>
                      {l.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                    <button
                      onClick={() => handleToggleAktif(l)}
                      style={{
                        width: 38, height: 22, borderRadius: "9999px",
                        background: l.aktif ? "var(--color-ocean-600)" : "var(--color-ocean-200)",
                        border: "none", cursor: "pointer",
                        position: "relative", transition: "background 0.2s",
                      }}
                    >
                      <span style={{
                        position: "absolute", top: 3,
                        left: l.aktif ? 19 : 3,
                        width: 16, height: 16,
                        borderRadius: "50%", background: "white",
                        transition: "left 0.2s",
                      }} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => openEdit(l)}
                      style={{
                        padding: "6px 14px", borderRadius: "8px",
                        background: "var(--color-ocean-100)",
                        color: "var(--color-ocean-700)",
                        border: "none", cursor: "pointer",
                        fontSize: "0.78rem", fontWeight: 500,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(l.id, l.judul)}
                      style={{
                        padding: "6px 14px", borderRadius: "8px",
                        background: "#FEE2E2", color: "#991B1B",
                        border: "none", cursor: "pointer",
                        fontSize: "0.78rem", fontWeight: 500,
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Syarat preview */}
                <div style={{
                  padding: "10px 20px 14px",
                  borderTop: "1px solid var(--color-ocean-50)",
                  background: "var(--color-ocean-50)",
                  display: "flex", flexWrap: "wrap", gap: "6px",
                }}>
                  {l.syarat.map((sy, si) => (
                    <span key={si} style={{
                      background: "white",
                      border: "1px solid var(--color-ocean-200)",
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      color: "var(--color-ocean-600)",
                      padding: "4px 10px",
                    }}>
                      {sy}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}