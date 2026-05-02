import SectionHeader from "@/components/ui/SectionHeader";
import { getDesaSettings } from "@/lib/firebase/settings";

export default async function StatsSection() {
  const s = await getDesaSettings();

  // 6 Kotak Ringkasan
  const STATS = [
    { label: "Jumlah Penduduk", value: s.jumlahPenduduk, unit: "jiwa",  icon: "👥" },
    { label: "Kepala Keluarga", value: s.jumlahKK,       unit: "KK",    icon: "🏠" },
    { label: "Luas Wilayah",    value: s.luasWilayah,    unit: "Ha",    icon: "🗺️" },
    { label: "Jumlah Dusun",    value: s.jumlahDusun,    unit: "dusun", icon: "🌿" },
    { label: "RT / RW",         value: s.rtRw,           unit: "",      icon: "📍" },
    { label: "Kode Pos",        value: s.kodePos,        unit: "",      icon: "📮" },
  ];

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // 3 Kotak Info
  const INFO = [
    { 
      judul: "Sejarah Singkat", 
      isi: truncateText(s.sejarah, 180), 
      warna: "#E0F4F7", border: "#5ECFDE" 
    },
    { 
      judul: "Visi Desa",       
      isi: `"${s.visi}"`, 
      warna: "#FDF3C8", border: "#F5C842" 
    },
    { 
      judul: "Letak Geografis", 
      isi: `Koordinat: ${s.koordinatLat || "-0.9886"}, ${s.koordinatLng || "120.3308"}. Berbatasan dengan Teluk Tomini di bagian Utara.`, 
      warna: "#EBF5E0", border: "#6FAB44" 
    },
  ];

  return (
    <section className="section-padding bg-sand-gradient overflow-hidden">
      <div className="container-desa">
        <SectionHeader 
          badge="Profil Singkat" 
          title="Mengenal Desa Tolai Barat"
          subtitle="Desa di pesisir Teluk Tomini dengan kekayaan alam dan budaya yang terjaga." 
          center 
        />

        {/* 6 Kotak Statistik Ringkas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px", marginTop: "40px", marginBottom: "48px" }}>
          {STATS.map((st) => (
            <div key={st.label} style={{ background: "white", borderRadius: "16px", padding: "20px", textAlign: "center", boxShadow: "var(--shadow-card)", transition: "transform 0.2s" }} className="hover:-translate-y-1">
              <div style={{ fontSize: "1.75rem", marginBottom: "8px" }}>{st.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.35rem", color: "var(--color-ocean-700)" }}>
                {st.value}
                {st.unit && <span style={{ fontSize: "0.75rem", marginLeft: "4px", fontFamily: "var(--font-sans)", fontWeight: 400 }}>{st.unit}</span>}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-ocean-700)", marginTop: "4px" }}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* 3 Info Cards (Sejarah, Visi, Geografis) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INFO.map((item) => (
            <div 
              key={item.judul} 
              className="bg-white p-8 rounded-tr-[40px] rounded-bl-[40px] border-l-4 shadow-card hover:shadow-card-md transition-shadow"
              style={{ borderLeftColor: item.border }}
            >
              <h3 className="font-display font-bold text-lg text-ocean-900 mb-4 uppercase tracking-wide">
                {item.judul}
              </h3>
              <p className="text-sm leading-relaxed text-ocean-800">
                {item.isi}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}