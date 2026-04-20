// File: components/layout/Footer.tsx
import Link from "next/link";
import { getDesaSettings } from "@/lib/firebase/settings";
import VisitorCounter from "@/components/shared/VisitorCounter";

const COL_NAVIGASI = [
  { label: "Profil Desa",    href: "/profil" },
  { label: "Berita & Info",  href: "/berita" },
  { label: "Wisata Alam",    href: "/wisata" },
  { label: "Potensi Desa",   href: "/potensi" },
  { label: "Galeri",         href: "/galeri" },
  { label: "Layanan Surat",  href: "/layanan" },
];

const COL_LAYANAN = [
  { label: "Surat Keterangan",    href: "/layanan" },
  { label: "Keterangan Domisili", href: "/layanan" },
  { label: "Keterangan Usaha",    href: "/layanan" },
  { label: "Data Kependudukan",   href: "/layanan" },
];

export default async function Footer() {
  const s = await getDesaSettings();
  
  const programList = s.programUnggulan && s.programUnggulan.length > 0 ? s.programUnggulan : [ { judul: "Torue Berdaya", isi: "Penguatan UMKM & pariwisata berbasis digital." }, { judul: "Pantai Arjuna", isi: "Destinasi wisata utama di pesisir Teluk Tomini." } ];
  const colors = ["var(--color-gold-400)", "var(--color-ocean-400)", "var(--color-forest-400)", "var(--color-orange-400)"];

  return (
    <footer style={{ background: "var(--color-ocean-900)", color: "white" }}>
      <div className="container-desa" style={{ paddingTop: "64px", paddingBottom: "64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px" }}>

          <div style={{ gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              
              {/* --- LOGO DIPERBAIKI: Transparan dan lebih besar --- */}
              {s.logoDesa ? (
                <img src={s.logoDesa} alt="Logo Desa" style={{ width: "52px", height: "52px", objectFit: "contain", flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 46, height: 46, borderRadius: "10px",
                  background: "var(--color-ocean-700)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: "1.3rem" }}>🌊</span>
                </div>
              )}
              
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", color: "white" }}>Desa Tolai Barat</div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-ocean-300)", marginTop: "2px" }}>Website Resmi</div>
              </div>
            </div>

            <p style={{ color: "var(--color-ocean-300)", fontSize: "0.85rem", lineHeight: 1.75, marginBottom: "20px" }}>Situs portal informasi publik dan layanan masyarakat Desa Tolai Barat secara terintegrasi.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem", color: "var(--color-ocean-300)" }}>
              <span>📍 {s.alamat || "Kec. Torue, Parigi Moutong"}</span>
              <span>📞 {s.telepon || "-"}</span>
              <span>✉️ {s.email || "-"}</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, fontSize: "0.85rem", color: "white", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Navigasi</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {COL_NAVIGASI.map((l) => (<li key={l.href}><Link href={l.href} className="text-ocean-300 hover:text-white text-[0.875rem] transition-colors">{l.label}</Link></li>))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, fontSize: "0.85rem", color: "white", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Layanan Desa</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {COL_LAYANAN.map((l) => (<li key={l.label}><Link href={l.href} className="text-ocean-300 hover:text-white text-[0.875rem] transition-colors">{l.label}</Link></li>))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, fontSize: "0.85rem", color: "white", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Program Desa</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {programList.map((p, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ color: colors[idx % colors.length], fontSize: "0.78rem", fontWeight: 600, marginBottom: "6px" }}>{p.judul}</div>
                  <div style={{ color: "var(--color-ocean-300)", fontSize: "0.78rem", lineHeight: 1.6 }}>{p.isi}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}></div>
      <div className="container-desa" style={{ paddingTop: "24px", paddingBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--color-ocean-400)" }}>
          &copy; {new Date().getFullYear()} Desa Tolai Barat. All rights reserved.
        </div>
        <VisitorCounter />
      </div>
    </footer>
  );
}