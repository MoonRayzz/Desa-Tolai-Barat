"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createAspirasi } from "@/lib/firebase/aspirasi";
import type { AspirasiKategori } from "@/types";

const KATEGORI_LIST: { value: AspirasiKategori; label: string; icon: string }[] = [
  { value: "infrastruktur", label: "Infrastruktur",  icon: "🏗️" },
  { value: "pelayanan",     label: "Pelayanan",      icon: "🏛️" },
  { value: "lingkungan",    label: "Lingkungan",     icon: "🌿" },
  { value: "ekonomi",       label: "Ekonomi",        icon: "💼" },
  { value: "pendidikan",    label: "Pendidikan",     icon: "🎓" },
  { value: "lainnya",       label: "Lainnya",        icon: "💬" },
];

const ls: React.CSSProperties = {
  display: "block", fontSize: "0.875rem", fontWeight: 500,
  color: "var(--color-ocean-700)", marginBottom: "8px",
};

export default function AspirasiPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama:     "",
    kontak:   "",
    isi:      "",
    kategori: "lainnya" as AspirasiKategori,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selesai, setSelesai]       = useState(false);
  const [error, setError]           = useState("");

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.isi.trim().length < 10) {
      setError("Isi aspirasi minimal 10 karakter.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await createAspirasi({
        nama:        form.nama.trim() || "Anonim",
        kontak:      form.kontak.trim(),
        isi:         form.isi.trim(),
        kategori:    form.kategori,
        submittedAt: new Date().toISOString(),
      });
      setSelesai(true);
    } catch {
      setError("Gagal mengirim aspirasi. Periksa koneksi internet Anda.");
    } finally {
      setSubmitting(false);
    }
  }

  if (selesai) return (
    <>
      <div className="page-hero" style={{ paddingBottom: "80px" }}>
        <div className="container-desa" style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white",
          }}>
            Terima Kasih!
          </h1>
        </div>
      </div>
      <div className="container-desa" style={{ maxWidth: "580px", padding: "48px 16px" }}>
        <div style={{
          background: "white", borderRadius: "20px", padding: "48px",
          boxShadow: "var(--shadow-card)", textAlign: "center",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>💌</div>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: "1.25rem", color: "var(--color-ocean-900)", marginBottom: "10px",
          }}>
            Aspirasi Anda berhasil dikirim!
          </h2>
          <p style={{
            color: "var(--color-ocean-600)", fontSize: "0.9rem",
            lineHeight: 1.7, marginBottom: "28px",
          }}>
            Pemerintah desa akan membaca dan mempertimbangkan aspirasi Anda.
            Bersama kita wujudkan Desa Tolai Barat yang lebih baik.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/")}
              className="btn-secondary"
              style={{ padding: "11px 24px" }}
            >
              Kembali ke Beranda
            </button>
            <button
              onClick={() => { setSelesai(false); setForm({ nama: "", kontak: "", isi: "", kategori: "lainnya" }); }}
              className="btn-primary"
              style={{ padding: "11px 24px" }}
            >
              Kirim Lagi
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="page-hero" style={{ paddingBottom: "80px" }}>
        <div className="container-desa" style={{ maxWidth: "680px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white",
            marginBottom: "12px",
          }}>
            Kirim Aspirasi Warga
          </h1>
          <p style={{
            color: "var(--color-ocean-200)", fontSize: "1rem", lineHeight: 1.65,
          }}>
            Sampaikan saran, masukan, atau harapan Anda kepada pemerintah
            Desa Tolai Barat. Nama dapat dikosongkan jika ingin anonim.
          </p>
        </div>
      </div>

      <section style={{ padding: "0 0 80px", background: "var(--color-ocean-50)" }}>
        <div className="container-desa" style={{ maxWidth: "680px" }}>

          <div style={{
            background: "white", borderRadius: "20px", padding: "32px",
            boxShadow: "var(--shadow-card)", marginTop: "-24px",
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

                {/* Identitas opsional */}
                <div style={{
                  background: "var(--color-ocean-50)", borderRadius: "12px",
                  padding: "16px", border: "1px solid var(--color-ocean-100)",
                }}>
                  <div style={{
                    fontSize: "0.78rem", color: "var(--color-ocean-600)",
                    marginBottom: "14px", fontWeight: 500,
                  }}>
                    Identitas (opsional — bisa dikosongkan)
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "14px",
                  }}>
                    <div>
                      <label style={ls}>Nama</label>
                      <input
                        type="text"
                        value={form.nama}
                        onChange={(e) => set("nama", e.target.value)}
                        placeholder="Nama Anda (atau kosongkan untuk anonim)"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label style={ls}>Kontak</label>
                      <input
                        type="text"
                        value={form.kontak}
                        onChange={(e) => set("kontak", e.target.value)}
                        placeholder="No. HP / WhatsApp (opsional)"
                        className="input-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label style={ls}>Kategori Aspirasi *</label>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "8px",
                  }}>
                    {KATEGORI_LIST.map((k) => {
                      const active = form.kategori === k.value;
                      return (
                        <button
                          key={k.value}
                          type="button"
                          onClick={() => set("kategori", k.value)}
                          style={{
                            padding: "10px 8px",
                            borderRadius: "12px",
                            border: active
                              ? "2px solid var(--color-ocean-600)"
                              : "1.5px solid var(--color-ocean-200)",
                            background: active ? "var(--color-ocean-50)" : "white",
                            color: active
                              ? "var(--color-ocean-700)"
                              : "var(--color-ocean-600)",
                            fontSize: "0.8rem",
                            fontWeight: active ? 600 : 400,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span style={{ fontSize: "1.25rem" }}>{k.icon}</span>
                          {k.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Isi aspirasi */}
                <div>
                  <label style={ls}>Isi Aspirasi / Saran *</label>
                  <textarea
                    value={form.isi}
                    onChange={(e) => set("isi", e.target.value)}
                    rows={6}
                    placeholder="Tulis aspirasi, saran, atau harapan Anda untuk Desa Tolai Barat..."
                    className="input-base"
                    style={{ resize: "vertical" }}
                    required
                  />
                  <div style={{
                    fontSize: "0.75rem", color: "var(--color-ocean-400)",
                    marginTop: "5px", textAlign: "right",
                  }}>
                    {form.isi.length} karakter
                    {form.isi.length < 10 && form.isi.length > 0 && " (minimal 10)"}
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: "#FEE2E2", color: "#991B1B",
                    padding: "12px 16px", borderRadius: "10px",
                    fontSize: "0.875rem", border: "1px solid #FCA5A5",
                  }}>
                    {error}
                  </div>
                )}

                <div style={{
                  fontSize: "0.78rem", color: "var(--color-ocean-500)",
                  lineHeight: 1.6, padding: "12px 14px",
                  background: "var(--color-ocean-50)", borderRadius: "10px",
                  border: "1px solid var(--color-ocean-100)",
                }}>
                  Aspirasi Anda akan langsung diterima oleh pemerintah desa
                  dan ditindaklanjuti sesuai kemampuan dan kebijakan desa.
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
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
                    disabled={submitting}
                    className="btn-primary"
                    style={{ padding: "12px 32px" }}
                  >
                    {submitting ? "Mengirim..." : "Kirim Aspirasi"}
                  </button>
                </div>

              </div>
            </form>
          </div>

        </div>
      </section>
    </>
  );
}