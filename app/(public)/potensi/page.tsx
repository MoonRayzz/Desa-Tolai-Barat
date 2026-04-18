// File: app/(public)/potensi/page.tsx
import { getAllPotensi } from "@/lib/firebase/potensi";
import CountUpBanner from "@/components/ui/CountUpBanner";
import PotensiMikroGrid from "@/components/ui/PotensiMikroGrid";
import type { PotensiDesa } from "@/types";

export const dynamic = "force-dynamic";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatRp = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);

const formatRpShort = (num: number) => {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} Jt`;
  return formatRp(num);
};

const getSektorIcon = (sektor: string) => {
  const map: Record<string, string> = {
    pertanian: "🌾",
    perkebunan: "🍫",
    perikanan: "🐟",
    pariwisata: "🏖️",
    perdagangan: "🛒",
    jasa: "⚙️",
  };
  return map[sektor?.toLowerCase()] ?? "🌟";
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PotensiPage() {
  const all = await getAllPotensi();
  const makro = all.filter((p) => p.kategori === "makro");
  const mikro = all.filter((p) => p.kategori === "mikro");

  const totalEkonomi = makro.reduce((acc, curr) => acc + (curr.nilaiEkonomi || 0), 0);
  const totalHektar = makro
    .map((p) => {
      const match = (p.metrik || "").match(/(\d[\d.,]*)/);
      return match ? parseFloat(match[1].replace(/\./g, "").replace(",", ".")) : 0;
    })
    .reduce((a, b) => a + b, 0);
  const totalKomoditas = makro.length;
  const sektorSet = new Set(all.map((p) => p.sektor?.toLowerCase()));
  const totalSektor = sektorSet.size;

  const topMakro = makro.slice(0, 3);
  const otherMakro = makro.slice(3);

  return (
    <div className="min-h-screen">

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "7rem 1.5rem 3rem",
          background: "linear-gradient(160deg, #061b2e 0%, #0d3349 60%, #0f4c6e 100%)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* dot grid */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            pointerEvents: "none",
          }}
        />
        {/* glow blobs */}
        <div style={{ position: "absolute", top: -60, right: "15%", width: 260, height: 260, borderRadius: "50%", background: "rgba(212,160,23,0.07)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: "10%", width: 200, height: 200, borderRadius: "50%", background: "rgba(30,120,180,0.08)", filter: "blur(50px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(212,160,23,0.15)",
              color: "#EF9F27",
              border: "1px solid rgba(212,160,23,0.3)",
              padding: "5px 18px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Kekuatan Ekonomi
          </span>

          <h1
            style={{
              fontFamily: "var(--font-display, Georgia, serif)",
              fontSize: "clamp(2rem, 6vw, 4rem)",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Potensi Desa Tolai Barat
          </h1>

          <p
            style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.75,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Dari hamparan sawah yang subur hingga kekayaan pesisir Teluk Tomini.
            Inilah urat nadi perputaran ekonomi dan kreativitas warga kami.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MAKRO HERO CARDS — overlap dari hero section
      ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "0 1rem 2rem",
          maxWidth: 1200,
          margin: "-2.5rem auto 0",
        }}
      >
        <div
          style={{
            display: "grid",
            /* Mobile: 1 kolom, ≥640px: ikuti jumlah topMakro */
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
            gap: 12,
          }}
        >
          {topMakro.map((item, idx) => (
            <MakroHeroCard key={item.id} item={item} featured={idx === 0} formatRpShort={formatRpShort} getSektorIcon={getSektorIcon} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COUNT-UP BANNER
      ══════════════════════════════════════════════════════════ */}
      {totalEkonomi > 0 && (
        <section style={{ padding: "0 1rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
          <CountUpBanner total={totalEkonomi} />
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          STAT STRIP — ringkasan angka fisik
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 1rem 3rem", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          {[
            { num: totalSektor, label: "Sektor aktif", color: "#0f766e", bg: "#ccfbf1" },
            { num: Math.round(totalHektar), label: "Total hektar lahan", color: "#1d4ed8", bg: "#dbeafe", suffix: " Ha" },
            { num: totalKomoditas, label: "Komoditas utama", color: "#b45309", bg: "#fef3c7" },
            { num: mikro.length, label: "Unit UMKM aktif", color: "#9d174d", bg: "#fce7f3" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "white",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 16,
                padding: "1rem",
                borderTop: `3px solid ${s.color}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(22px, 5vw, 28px)",
                  fontWeight: 700,
                  color: s.color,
                  lineHeight: 1,
                  fontFamily: "var(--font-display, Georgia, serif)",
                }}
              >
                {s.num}{s.suffix ?? ""}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          POTENSI PENGEMBANGAN — other makro
      ══════════════════════════════════════════════════════════ */}
      {(otherMakro.length > 0 || true) && (
        <section style={{ background: "#f0f7ff", padding: "3rem 1rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* section divider label */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "2rem" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "#0f4c6e",
                  background: "#dbeafe",
                  padding: "4px 14px",
                  borderRadius: 99,
                  whiteSpace: "nowrap",
                }}
              >
                Potensi Pengembangan & Lahan Aktif
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
                gap: 12,
              }}
            >
              {otherMakro.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.07)",
                    borderRadius: 16,
                    padding: "1rem",
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      overflow: "hidden",
                      flexShrink: 0,
                      background: "#0d3349",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                    }}
                  >
                    {item.image
                      ? <img src={item.image} alt={item.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : getSektorIcon(item.sektor)
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "#6b7280", marginBottom: 3 }}>
                      {item.sektor}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0d2b40", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.nama}
                    </div>
                    {item.metrik && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#854F0B",
                          background: "#FAEEDA",
                          padding: "2px 8px",
                          borderRadius: 5,
                          display: "inline-block",
                        }}
                      >
                        {item.metrik}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Slot kosong — ajakan tambah data */}
              <div
                style={{
                  border: "1.5px dashed rgba(0,0,0,0.15)",
                  borderRadius: 16,
                  padding: "1rem",
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  opacity: 0.55,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    color: "#9ca3af",
                    flexShrink: 0,
                  }}
                >
                  +
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>Belum terisi</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Tambah potensi baru via admin</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          MIKRO SECTION — client component dengan filter
      ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "white", padding: "4rem 1rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* section header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span
              style={{
                display: "inline-block",
                color: "#0f766e",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Ekonomi Mikro
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display, Georgia, serif)",
                fontSize: "clamp(1.5rem, 4vw, 2.6rem)",
                fontWeight: 700,
                color: "#0d2b40",
                marginBottom: 12,
              }}
            >
              UMKM &amp; Penggerak Ekonomi Warga
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 520, margin: "0 auto" }}>
              Daftar unit usaha, kios, dan toko yang bermitra atau beroperasi di kawasan Desa Tolai Barat.
            </p>
          </div>

          {/* client component */}
          <PotensiMikroGrid items={mikro} />
        </div>
      </section>

    </div>
  );
}

// ─── Makro Hero Card (inline server component) ────────────────────────────────
function MakroHeroCard({
  item,
  featured,
  formatRpShort,
  getSektorIcon,
}: {
  item: PotensiDesa;
  featured: boolean;
  formatRpShort: (n: number) => string;
  getSektorIcon: (s: string) => string;
}) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        height: featured ? "clamp(280px, 50vw, 420px)" : "clamp(220px, 40vw, 320px)",
        background: "#0d2b40",
        boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
      }}
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.nama}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform .7s ease",
          }}
        />
      )}
      {!item.image && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 80,
            opacity: 0.1,
          }}
        >
          {getSektorIcon(item.sektor)}
        </div>
      )}
      {/* gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(5,15,30,0.95) 0%, rgba(5,15,30,0.4) 55%, rgba(5,15,30,0.1) 100%)",
        }}
      />
      {/* sector icon top right */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 20,
          fontSize: 32,
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
        }}
      >
        {getSektorIcon(item.sektor)}
      </div>

      {/* content bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "#EF9F27",
            marginBottom: 6,
          }}
        >
          Sektor {item.sektor}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-display, Georgia, serif)",
            fontSize: featured ? "clamp(18px, 4vw, 28px)" : "clamp(15px, 3vw, 20px)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.15,
            marginBottom: 12,
          }}
        >
          {item.nama}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {item.metrik && (
            <span
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                padding: "5px 12px",
                borderRadius: 8,
              }}
            >
              {item.metrik}
            </span>
          )}
          {item.nilaiEkonomi ? (
            <span
              style={{
                background: "#EF9F27",
                color: "#1a0a00",
                fontSize: 12,
                fontWeight: 800,
                padding: "5px 12px",
                borderRadius: 8,
              }}
            >
              {formatRpShort(item.nilaiEkonomi)} / Thn
            </span>
          ) : null}
        </div>
        {featured && item.deskripsi && (
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              marginTop: 10,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.deskripsi}
          </p>
        )}
      </div>
    </div>
  );
}