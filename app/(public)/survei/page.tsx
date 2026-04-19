// File: app/(public)/survei/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getAktifSurvei, getAllSurvei } from "@/lib/firebase/survei";
import type { Survei } from "@/types";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Survei Warga",
  description: "Ikuti survei dan sampaikan pendapat Anda untuk kemajuan Desa Tolai Barat.",
};

function SurveiCard({ s, aktif }: { s: Survei; aktif: boolean }) {
  const endLabel = s.endDate
    ? new Date(s.endDate + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      padding: "24px",
      boxShadow: "var(--shadow-card)",
      border: "1px solid var(--color-ocean-100)",
      opacity: aktif ? 1 : 0.6,
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <span style={{
          background: aktif ? "var(--color-ocean-100)" : "#F1F5F9",
          color: aktif ? "var(--color-ocean-700)" : "#64748B",
          fontSize: "0.7rem", fontWeight: 600,
          padding: "3px 10px", borderRadius: "9999px",
        }}>
          {aktif ? "Sedang Berlangsung" : "Selesai"}
        </span>
        <span style={{
          background: "var(--color-gold-100)",
          color: "var(--color-gold-700)",
          fontSize: "0.7rem", fontWeight: 600,
          padding: "3px 10px", borderRadius: "9999px",
        }}>
          {s.pertanyaan.length} pertanyaan
        </span>
      </div>

      <div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 600,
          fontSize: "1.1rem", color: "var(--color-ocean-900)",
          marginBottom: "6px",
        }}>
          {s.judul}
        </h2>
        {s.deskripsi.trim() !== "" && (
          <p style={{
            fontSize: "0.875rem", color: "var(--color-ocean-600)",
            lineHeight: 1.65,
          }}>
            {s.deskripsi}
          </p>
        )}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "10px",
        paddingTop: "14px", borderTop: "1px solid var(--color-ocean-100)",
        fontSize: "0.78rem", color: "var(--color-ocean-500)",
      }}>
        <span>{s.totalResponden} responden</span>
        {endLabel && <span>Berakhir: {endLabel}</span>}
      </div>

      {aktif && (
        <Link
          href={"/survei/" + s.id}
          className="btn-primary"
          style={{ textAlign: "center", marginTop: "4px" }}
        >
          Isi Survei Sekarang
        </Link>
      )}
    </div>
  );
}

export default async function SurveiPage() {
  const [aktifList, semuaList] = await Promise.all([
    getAktifSurvei(),
    getAllSurvei(),
  ]);

  const aktifIds  = new Set(aktifList.map((s) => s.id));
  const arsipList = semuaList.filter((s) => !aktifIds.has(s.id));

  return (
    <>
      <div className="page-hero">
        <div className="container-desa" style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "12px",
          }}>
            Survei Warga
          </h1>
          <p style={{ color: "var(--color-ocean-300)", fontSize: "1rem", maxWidth: "520px", margin: "0 auto" }}>
            Suara Anda penting untuk kemajuan Desa Tolai Barat.
            Ikuti survei berikut dan sampaikan pendapat Anda.
          </p>
        </div>
      </div>

      <section className="section-padding" style={{ background: "var(--color-ocean-50)" }}>
        <div className="container-desa">

          {aktifList.length > 0 && (
            <div style={{ marginBottom: "48px" }}>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: "1.35rem", color: "var(--color-ocean-900)",
                marginBottom: "20px",
              }}>
                Survei Aktif
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}>
                {aktifList.map((s) => (
                  <SurveiCard key={s.id} s={s} aktif={true} />
                ))}
              </div>
            </div>
          )}

          {aktifList.length === 0 && (
            <div style={{
              textAlign: "center", padding: "80px",
              background: "white", borderRadius: "20px",
              boxShadow: "var(--shadow-card)", marginBottom: "48px",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📋</div>
              <h3 style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: "1.1rem", color: "var(--color-ocean-800)", marginBottom: "8px",
              }}>
                Belum ada survei aktif saat ini
              </h3>
              <p style={{ color: "var(--color-ocean-500)", fontSize: "0.875rem" }}>
                Pantau terus halaman ini untuk survei berikutnya.
              </p>
            </div>
          )}

          <div style={{
            background: "var(--color-ocean-700)",
            borderRadius: "20px", padding: "28px 32px",
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "space-between",
            gap: "20px", marginBottom: arsipList.length > 0 ? "48px" : 0,
          }}>
            <div>
              <h3 style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: "1.1rem", color: "white", marginBottom: "6px",
              }}>
                Punya saran atau aspirasi?
              </h3>
              <p style={{ color: "var(--color-ocean-200)", fontSize: "0.875rem" }}>
                Sampaikan langsung kepada pemerintah desa secara bebas.
              </p>
            </div>
            <Link href="/aspirasi" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "var(--color-gold-400)", color: "var(--color-gold-900)",
              fontWeight: 600, fontSize: "0.875rem",
              padding: "12px 24px", borderRadius: "12px",
              textDecoration: "none", flexShrink: 0,
            }}>
              Kirim Aspirasi
            </Link>
          </div>

          {arsipList.length > 0 && (
            <div>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: "1rem", color: "var(--color-ocean-400)", marginBottom: "16px",
              }}>
                Survei Sebelumnya
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}>
                {arsipList.slice(0, 6).map((s) => (
                  <SurveiCard key={s.id} s={s} aktif={false} />
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}