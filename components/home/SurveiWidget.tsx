import Link from "next/link";
import { getAktifSurvei } from "@/lib/firebase/survei";

export default async function SurveiWidget() {
  const list = await getAktifSurvei();
  if (list.length === 0) return null;

  const survei = list[0];

  const endLabel = survei.endDate
    ? new Date(survei.endDate + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <section className="section-padding-sm" style={{ background: "var(--color-sand-gradient)" }}>
      <div className="container-desa">
        <div style={{
          background: "var(--color-ocean-700)",
          borderRadius: "24px",
          padding: "32px 36px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "28px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Dekorasi */}
          <div style={{
            position: "absolute", right: -40, top: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", right: 40, bottom: -60,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }} />

          {/* Ikon */}
          <div style={{
            width: 64, height: 64, borderRadius: "18px",
            background: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "2rem",
            flexShrink: 0,
          }}>
            📊
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: "220px" }}>
            <div style={{
              display: "inline-block",
              background: "rgba(245,200,66,0.2)",
              color: "var(--color-gold-300)",
              fontSize: "0.7rem", fontWeight: 600,
              padding: "3px 10px", borderRadius: "9999px",
              marginBottom: "8px",
            }}>
              Survei Aktif
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "1.15rem", color: "white",
              marginBottom: "6px", lineHeight: 1.3,
            }}>
              {survei.judul}
            </h2>
            <div style={{
              fontSize: "0.82rem", color: "var(--color-ocean-200)",
              display: "flex", gap: "16px", flexWrap: "wrap",
            }}>
              <span>{survei.pertanyaan.length} pertanyaan</span>
              <span>{survei.totalResponden} responden</span>
              {endLabel && <span>Berakhir: {endLabel}</span>}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
            <Link
              href={"/survei/" + survei.id}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "var(--color-gold-400)", color: "var(--color-gold-900)",
                fontWeight: 600, fontSize: "0.9rem",
                padding: "12px 24px", borderRadius: "12px",
                textDecoration: "none", transition: "opacity 0.2s",
              }}
            >
              Isi Sekarang
            </Link>
            <Link
              href="/survei"
              style={{
                display: "inline-flex", alignItems: "center",
                background: "rgba(255,255,255,0.1)",
                color: "white", fontWeight: 500, fontSize: "0.9rem",
                padding: "12px 20px", borderRadius: "12px",
                textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Lihat Semua
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}