"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  getSurveiById,
  submitJawaban,
  sudahIsiSurvei,
  markSudahIsi,
} from "@/lib/firebase/survei";
import type { Survei } from "@/types";

export default function SurveiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = use(params);
  const router  = useRouter();

  const [survei, setSurvei]       = useState<Survei | null>(null);
  const [loading, setLoading]     = useState(true);
  const [sudahIsi, setSudahIsi]   = useState(false);
  const [jawaban, setJawaban]     = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selesai, setSelesai]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    async function load() {
      const data = await getSurveiById(id);
      if (!data) { router.replace("/survei"); return; }
      setSurvei(data);
      setSudahIsi(sudahIsiSurvei(id));
      setLoading(false);
    }
    load();
  }, [id, router]);

  function setPilihan(pertanyaanId: string, opsi: string) {
    setJawaban((prev) => ({ ...prev, [pertanyaanId]: opsi }));
  }

  async function handleSubmit() {
    if (!survei) return;

    const belumDijawab = survei.pertanyaan.filter(
      (p) => !jawaban[p.id]
    );
    if (belumDijawab.length > 0) {
      setError(
        "Harap jawab semua pertanyaan terlebih dahulu. " +
        belumDijawab.length + " pertanyaan belum dijawab."
      );
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await submitJawaban(id, jawaban);
      markSudahIsi(id);
      setSelesai(true);
    } catch {
      setError("Gagal mengirim jawaban. Periksa koneksi internet Anda.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--color-ocean-500)",
    }}>
      Memuat survei...
    </div>
  );

  if (!survei) return null;

  // ── Sudah pernah isi ──
  if (sudahIsi && !selesai) return (
    <>
      <div className="page-hero" style={{ paddingBottom: "80px" }}>
        <div className="container-desa" style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white",
          }}>
            {survei.judul}
          </h1>
        </div>
      </div>
      <div className="container-desa" style={{ maxWidth: "640px", padding: "48px 16px" }}>
        <div style={{
          background: "white", borderRadius: "20px", padding: "48px",
          boxShadow: "var(--shadow-card)", textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: "1.25rem", color: "var(--color-ocean-900)", marginBottom: "10px",
          }}>
            Anda sudah mengisi survei ini
          </h2>
          <p style={{ color: "var(--color-ocean-600)", fontSize: "0.9rem", marginBottom: "28px" }}>
            Terima kasih telah berpartisipasi. Jawaban Anda sudah tercatat.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/survei")}
              className="btn-secondary"
              style={{ padding: "11px 24px" }}
            >
              Lihat Survei Lain
            </button>
            <button
              onClick={() => router.push("/aspirasi")}
              className="btn-primary"
              style={{ padding: "11px 24px" }}
            >
              Kirim Aspirasi
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ── Selesai mengisi ──
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
      <div className="container-desa" style={{ maxWidth: "640px", padding: "48px 16px" }}>
        <div style={{
          background: "white", borderRadius: "20px", padding: "48px",
          boxShadow: "var(--shadow-card)", textAlign: "center",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🎉</div>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: "1.35rem", color: "var(--color-ocean-900)", marginBottom: "10px",
          }}>
            Jawaban Anda berhasil dikirim!
          </h2>
          <p style={{ color: "var(--color-ocean-600)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "28px" }}>
            Partisipasi Anda sangat berarti untuk kemajuan Desa Tolai Barat.
            Hasil survei akan digunakan sebagai bahan pertimbangan pemerintah desa.
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
              onClick={() => router.push("/aspirasi")}
              className="btn-primary"
              style={{ padding: "11px 24px" }}
            >
              Kirim Aspirasi
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const totalPertanyaan = survei.pertanyaan.length;
  const sudahDijawab   = Object.keys(jawaban).length;
  const progress       = totalPertanyaan > 0
    ? Math.round((sudahDijawab / totalPertanyaan) * 100)
    : 0;

  return (
    <>
      <div className="page-hero" style={{ paddingBottom: "80px" }}>
        <div className="container-desa" style={{ maxWidth: "720px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white",
            marginBottom: "12px",
          }}>
            {survei.judul}
          </h1>
          {survei.deskripsi.trim() !== "" && (
            <p style={{ color: "var(--color-ocean-200)", fontSize: "1rem", lineHeight: 1.65 }}>
              {survei.deskripsi}
            </p>
          )}
          <div style={{
            display: "flex", gap: "16px", marginTop: "20px",
            fontSize: "0.82rem", color: "var(--color-ocean-300)",
          }}>
            <span>{totalPertanyaan} pertanyaan</span>
            <span>{survei.totalResponden} responden</span>
          </div>
        </div>
      </div>

      <section style={{ padding: "0 0 80px", background: "var(--color-ocean-50)" }}>
        <div className="container-desa" style={{ maxWidth: "720px" }}>

          {/* Progress bar */}
          <div style={{
            background: "white", borderRadius: "12px",
            padding: "16px 20px", marginBottom: "24px",
            boxShadow: "var(--shadow-card)", marginTop: "-24px",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "0.82rem", marginBottom: "8px",
            }}>
              <span style={{ color: "var(--color-ocean-700)", fontWeight: 500 }}>
                Progress Pengisian
              </span>
              <span style={{ color: "var(--color-ocean-600)" }}>
                {sudahDijawab} / {totalPertanyaan} dijawab
              </span>
            </div>
            <div style={{
              height: "8px", background: "var(--color-ocean-100)",
              borderRadius: "9999px", overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: progress + "%",
                background: progress === 100
                  ? "var(--color-forest-500)"
                  : "var(--color-ocean-600)",
                borderRadius: "9999px",
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>

          {/* Pertanyaan */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {survei.pertanyaan.map((p, idx) => {
              const terpilih = jawaban[p.id];
              return (
                <div key={p.id} style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "var(--shadow-card)",
                  border: terpilih
                    ? "1px solid var(--color-ocean-300)"
                    : "1px solid var(--color-ocean-100)",
                  transition: "border-color 0.2s",
                }}>
                  {/* Nomor + teks pertanyaan */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "18px" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: terpilih
                        ? "var(--color-ocean-600)"
                        : "var(--color-ocean-100)",
                      color: terpilih ? "white" : "var(--color-ocean-700)",
                      fontSize: "0.78rem", fontWeight: 700,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0,
                      transition: "all 0.2s",
                    }}>
                      {terpilih ? "✓" : idx + 1}
                    </div>
                    <h3 style={{
                      fontFamily: "var(--font-display)", fontWeight: 600,
                      fontSize: "1rem", color: "var(--color-ocean-900)",
                      lineHeight: 1.5, flex: 1,
                    }}>
                      {p.teks}
                    </h3>
                  </div>

                  {/* Opsi */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {p.opsi.map((opsi) => {
                      const dipilih = terpilih === opsi;
                      return (
                        <button
                          key={opsi}
                          onClick={() => setPilihan(p.id, opsi)}
                          style={{
                            width: "100%",
                            padding: "13px 16px",
                            borderRadius: "12px",
                            border: dipilih
                              ? "2px solid var(--color-ocean-600)"
                              : "1.5px solid var(--color-ocean-200)",
                            background: dipilih
                              ? "var(--color-ocean-50)"
                              : "white",
                            color: "var(--color-ocean-900)",
                            fontSize: "0.9rem",
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontWeight: dipilih ? 500 : 400,
                          }}
                        >
                          <span style={{
                            width: 20, height: 20, borderRadius: "50%",
                            border: dipilih
                              ? "6px solid var(--color-ocean-600)"
                              : "2px solid var(--color-ocean-300)",
                            background: "white",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }} />
                          {opsi}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#FEE2E2", color: "#991B1B",
              padding: "14px 18px", borderRadius: "12px",
              fontSize: "0.875rem", marginTop: "20px",
              border: "1px solid #FCA5A5",
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <div style={{
            background: "white", borderRadius: "16px",
            padding: "24px", marginTop: "20px",
            boxShadow: "var(--shadow-card)",
            display: "flex", flexDirection: "column", gap: "12px",
          }}>
            <div style={{
              fontSize: "0.82rem", color: "var(--color-ocean-500)",
              lineHeight: 1.6,
            }}>
              Pastikan semua pertanyaan sudah dijawab sebelum mengirim.
              Jawaban tidak dapat diubah setelah dikirim.
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/survei")}
                className="btn-secondary"
                style={{ padding: "12px 24px" }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || progress !== 100}
                className="btn-primary"
                style={{
                  padding: "12px 32px",
                  opacity: progress !== 100 ? 0.5 : 1,
                  cursor: progress !== 100 ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Mengirim..." : "Kirim Jawaban"}
              </button>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}