"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSurvei, generateId } from "@/lib/firebase/survei";
import type { PertanyaanSurvei } from "@/types";

const ls: React.CSSProperties = {
  display: "block", fontSize: "0.82rem", fontWeight: 500,
  color: "var(--color-ocean-700)", marginBottom: "6px",
};

function buatPertanyaanBaru(): PertanyaanSurvei {
  return { id: generateId(), teks: "", opsi: ["", ""] };
}

export default function TambahSurveiPage() {
  const router  = useRouter();
  const today   = new Date().toISOString().split("T")[0];
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    judul:     "",
    deskripsi: "",
    aktif:     true,
    startDate: today,
    endDate:   "",
  });
  const [pertanyaan, setPertanyaan] = useState<PertanyaanSurvei[]>([
    buatPertanyaanBaru(),
  ]);

  function setF(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addPertanyaan() {
    setPertanyaan((prev) => [...prev, buatPertanyaanBaru()]);
  }

  function removePertanyaan(index: number) {
    if (pertanyaan.length <= 1) return;
    setPertanyaan((prev) => prev.filter((_, i) => i !== index));
  }

  function setPertanyaanTeks(index: number, teks: string) {
    setPertanyaan((prev) =>
      prev.map((p, i) => (i === index ? { ...p, teks } : p))
    );
  }

  function addOpsi(pIdx: number) {
    setPertanyaan((prev) =>
      prev.map((p, i) =>
        i === pIdx ? { ...p, opsi: [...p.opsi, ""] } : p
      )
    );
  }

  function removeOpsi(pIdx: number, oIdx: number) {
    setPertanyaan((prev) =>
      prev.map((p, i) => {
        if (i !== pIdx || p.opsi.length <= 2) return p;
        return { ...p, opsi: p.opsi.filter((_, oi) => oi !== oIdx) };
      })
    );
  }

  function setOpsi(pIdx: number, oIdx: number, val: string) {
    setPertanyaan((prev) =>
      prev.map((p, i) => {
        if (i !== pIdx) return p;
        const opsi = [...p.opsi];
        opsi[oIdx] = val;
        return { ...p, opsi };
      })
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.judul.trim()) { alert("Judul survei wajib diisi."); return; }

    for (let i = 0; i < pertanyaan.length; i++) {
      const p = pertanyaan[i];
      if (!p.teks.trim()) {
        alert("Pertanyaan ke-" + (i + 1) + " belum diisi."); return;
      }
      const emptyOpsi = p.opsi.some((o) => !o.trim());
      if (emptyOpsi) {
        alert("Semua pilihan jawaban di pertanyaan ke-" + (i + 1) + " harus diisi."); return;
      }
    }

    setSaving(true);
    try {
      await createSurvei({
        judul:      form.judul.trim(),
        deskripsi:  form.deskripsi.trim(),
        aktif:      form.aktif,
        startDate:  form.startDate,
        endDate:    form.endDate.trim() !== "" ? form.endDate : null,
        pertanyaan,
      });
      router.push("/admin/survei");
    } catch {
      alert("Gagal menyimpan survei. Coba lagi.");
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
            color: "var(--color-ocean-500)", fontSize: "1.1rem", lineHeight: 1,
          }}
        >
          back
        </button>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "1.5rem", color: "var(--color-ocean-900)",
        }}>
          Buat Survei Baru
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Info dasar survei */}
          <div style={{
            background: "white", borderRadius: "16px", padding: "24px",
            boxShadow: "var(--shadow-card)",
            display: "flex", flexDirection: "column", gap: "18px",
          }}>
            <div style={{
              fontSize: "0.82rem", fontWeight: 600,
              color: "var(--color-ocean-700)", paddingBottom: "10px",
              borderBottom: "1px solid var(--color-ocean-100)",
            }}>
              Informasi Survei
            </div>

            <div>
              <label style={ls}>Judul Survei *</label>
              <input
                type="text"
                value={form.judul}
                onChange={(e) => setF("judul", e.target.value)}
                placeholder="contoh: Survei Kepuasan Layanan Desa 2025"
                className="input-base"
                required
              />
            </div>

            <div>
              <label style={ls}>Deskripsi</label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setF("deskripsi", e.target.value)}
                rows={3}
                placeholder="Jelaskan tujuan survei ini kepada warga..."
                className="input-base"
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={ls}>Tanggal Mulai *</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setF("startDate", e.target.value)}
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label style={ls}>Tanggal Berakhir</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setF("endDate", e.target.value)}
                  min={form.startDate}
                  className="input-base"
                />
                <div style={{ fontSize: "0.72rem", color: "var(--color-ocean-400)", marginTop: "4px" }}>
                  Kosongkan jika tidak ada batas waktu
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="survei-aktif"
                checked={form.aktif}
                onChange={(e) => setF("aktif", e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <label
                htmlFor="survei-aktif"
                style={{ fontSize: "0.875rem", color: "var(--color-ocean-700)", cursor: "pointer" }}
              >
                Langsung aktifkan dan tampilkan di website
              </label>
            </div>
          </div>

          {/* Daftar pertanyaan */}
          {pertanyaan.map((p, pIdx) => (
            <div key={p.id} style={{
              background: "white", borderRadius: "16px", padding: "24px",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--color-ocean-100)",
            }}>
              {/* Header pertanyaan */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "16px",
                paddingBottom: "12px", borderBottom: "1px solid var(--color-ocean-100)",
              }}>
                <span style={{
                  background: "var(--color-ocean-100)", color: "var(--color-ocean-700)",
                  fontSize: "0.78rem", fontWeight: 600,
                  padding: "4px 12px", borderRadius: "9999px",
                }}>
                  Pertanyaan {pIdx + 1}
                </span>
                {pertanyaan.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePertanyaan(pIdx)}
                    style={{
                      padding: "5px 12px", borderRadius: "8px",
                      background: "#FEE2E2", color: "#991B1B",
                      border: "none", cursor: "pointer",
                      fontSize: "0.78rem", fontWeight: 500,
                    }}
                  >
                    Hapus Pertanyaan
                  </button>
                )}
              </div>

              {/* Teks pertanyaan */}
              <div style={{ marginBottom: "18px" }}>
                <label style={ls}>Teks Pertanyaan *</label>
                <input
                  type="text"
                  value={p.teks}
                  onChange={(e) => setPertanyaanTeks(pIdx, e.target.value)}
                  placeholder={"contoh: Bagaimana penilaian Anda terhadap pelayanan desa?"}
                  className="input-base"
                  required
                />
              </div>

              {/* Pilihan jawaban */}
              <div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: "10px",
                }}>
                  <label style={{ ...ls, marginBottom: 0 }}>
                    Pilihan Jawaban * (minimal 2)
                  </label>
                  <button
                    type="button"
                    onClick={() => addOpsi(pIdx)}
                    style={{
                      padding: "4px 12px", borderRadius: "7px",
                      background: "var(--color-ocean-100)",
                      color: "var(--color-ocean-700)",
                      border: "none", cursor: "pointer",
                      fontSize: "0.78rem", fontWeight: 500,
                    }}
                  >
                    + Tambah Pilihan
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {p.opsi.map((opsi, oIdx) => (
                    <div key={oIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        border: "2px solid var(--color-ocean-200)",
                        flexShrink: 0, background: "white",
                      }} />
                      <input
                        type="text"
                        value={opsi}
                        onChange={(e) => setOpsi(pIdx, oIdx, e.target.value)}
                        placeholder={"Pilihan " + (oIdx + 1)}
                        className="input-base"
                        style={{ flex: 1 }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeOpsi(pIdx, oIdx)}
                        disabled={p.opsi.length <= 2}
                        style={{
                          padding: "7px 10px", borderRadius: "8px",
                          background: p.opsi.length <= 2 ? "#F1F5F9" : "#FEE2E2",
                          color: p.opsi.length <= 2 ? "#94A3B8" : "#991B1B",
                          border: "none",
                          cursor: p.opsi.length <= 2 ? "not-allowed" : "pointer",
                          fontSize: "0.85rem", flexShrink: 0,
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Tombol tambah pertanyaan */}
          <button
            type="button"
            onClick={addPertanyaan}
            style={{
              padding: "14px",
              borderRadius: "14px",
              border: "2px dashed var(--color-ocean-300)",
              background: "white",
              color: "var(--color-ocean-600)",
              fontSize: "0.875rem", fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            + Tambah Pertanyaan Baru
          </button>

          {/* Ringkasan */}
          <div style={{
            background: "var(--color-ocean-50)", borderRadius: "12px",
            padding: "16px 20px", border: "1px solid var(--color-ocean-100)",
            fontSize: "0.82rem", color: "var(--color-ocean-600)", lineHeight: 1.7,
          }}>
            Survei ini akan memiliki {pertanyaan.length} pertanyaan dan{" "}
            {pertanyaan.reduce((acc, p) => acc + p.opsi.length, 0)} total pilihan jawaban.
          </div>

          {/* Actions */}
          <div style={{
            display: "flex", gap: "12px", justifyContent: "flex-end",
            padding: "16px 0",
          }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
              style={{ padding: "12px 24px" }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: "12px 32px" }}
            >
              {saving ? "Menyimpan..." : "Simpan dan Publikasikan"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}