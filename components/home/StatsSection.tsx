import SectionHeader from "@/components/ui/SectionHeader";
import { getDesaSettings } from "@/lib/firebase/settings";

export default async function StatsSection() {
  const s = await getDesaSettings();

  const STATS = [
    { label: "Jumlah Penduduk", value: s.jumlahPenduduk, unit: "jiwa",  icon: "👥" },
    { label: "Kepala Keluarga", value: s.jumlahKK,       unit: "KK",    icon: "🏠" },
    { label: "Luas Wilayah",    value: s.luasWilayah,    unit: "Ha",    icon: "🗺️" },
    { label: "Jumlah Dusun",    value: s.jumlahDusun,    unit: "dusun", icon: "🌿" },
    { label: "RT / RW",         value: s.rtRw,           unit: "",      icon: "📍" },
    { label: "Kode Pos",        value: s.kodePos,        unit: "",      icon: "📮" },
  ];

  // PERBAIKAN: Membuat fungsi pemotong teks (truncate)
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    // Potong teks dan tambahkan elipsis
    return text.substring(0, maxLength).trim() + "...";
  };

  // Menggunakan fungsi pemotong teks untuk "Sejarah Singkat"
  const INFO = [
    { 
      judul: "Sejarah Singkat", 
      isi: truncateText(s.sejarah, 180), // Maksimal 180 karakter
      warna: "#E0F4F7", 
      border: "#5ECFDE" 
    },
    { 
      judul: "Visi Desa",       
      isi: `"${s.visi}"`, 
      warna: "#FDF3C8", 
      border: "#F5C842" 
    },
    { 
      judul: "Letak Geografis", 
      isi: "Berbatasan langsung dengan Teluk Tomini di sebelah utara, bagian dari Kecamatan Torue. Koordinat: 0°59′19″LS, 120°19′51″BT.", 
      warna: "#EBF5E0", 
      border: "#6FAB44" 
    },
  ];

  return (
    <section className="section-padding bg-sand-gradient">
      <div className="container-desa">
        <SectionHeader badge="Profil Singkat" title="Mengenal Desa Tolai Barat"
          subtitle="Desa di pesisir Teluk Tomini dengan kekayaan alam dan budaya yang terjaga." center />

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px", marginTop: "40px", marginBottom: "48px" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: "white", borderRadius: "16px", padding: "20px", textAlign: "center", boxShadow: "var(--shadow-card)" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.35rem", color: "var(--color-ocean-700)" }}>
                {s.value}
                {s.unit && <span style={{ fontSize: "0.75rem", marginLeft: "4px", fontFamily: "var(--font-sans)", fontWeight: 400 }}>{s.unit}</span>}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-500)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
          {INFO.map((item) => (
            <div key={item.judul} style={{ background: item.warna, borderLeft: `4px solid ${item.border}`, borderRadius: "0 16px 16px 0", padding: "28px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.125rem", color: "var(--color-ocean-900)", marginBottom: "12px" }}>
                {item.judul}
              </h3>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "var(--color-ocean-800)" }}>
                {item.isi}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}