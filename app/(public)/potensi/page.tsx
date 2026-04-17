// File: app/(public)/potensi/page.tsx
import { getAllPotensi } from "@/lib/firebase/potensi";
import SectionHeader from "@/components/ui/SectionHeader";

export const dynamic = "force-dynamic";

export default async function PotensiPage() {
  const all = await getAllPotensi();
  const makro = all.filter(p => p.kategori === "makro");
  const mikro = all.filter(p => p.kategori === "mikro");

  // Kalkulasi Total Perputaran Ekonomi Makro
  const totalEkonomi = makro.reduce((acc, curr) => acc + (curr.nilaiEkonomi || 0), 0);
  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  // Ambil 3 Teratas untuk Headline, sisanya di bawah
  const topMakro = makro.slice(0, 3);
  const otherMakro = makro.slice(3);

  // Ikon cerdas berdasarkan sektor
  const getIcon = (sektor: string) => {
    switch (sektor.toLowerCase()) {
      case "pertanian": return "🌾";
      case "perkebunan": return "🍫";
      case "perikanan": return "🐟";
      case "pariwisata": return "🏖️";
      default: return "🌟";
    }
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* HEADER HERO */}
      <section className="pt-32 pb-16 bg-ocean-900 text-center px-4">
        <span className="badge bg-gold-500/20 text-gold-400 mb-6 inline-block">Kekuatan Ekonomi</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
          Potensi Desa Tolai Barat
        </h1>
        <p className="text-lg text-ocean-200 max-w-2xl mx-auto">
          Dari hamparan sawah yang subur hingga kekayaan pesisir Teluk Tomini. Inilah urat nadi perputaran ekonomi dan kreativitas warga kami.
        </p>
      </section>

      {/* TOP SECTION: 3 KOMODITAS RAKSASA (Padi, Kakao, Bandeng) */}
      <section className="-mt-10 relative z-10 px-4">
        <div className="container-desa max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topMakro.map((item, idx) => (
              <div key={item.id} className={`relative overflow-hidden rounded-[2rem] shadow-2xl group h-[420px] ${idx === 0 ? 'md:col-span-3 lg:col-span-1' : ''}`}>
                <img src={item.image || "/images/potensi-hero.jpg"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.nama} />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-900/60 to-transparent flex flex-col justify-end p-8">
                  
                  {/* Ikon Mengambang */}
                  <div className="absolute top-6 right-6 text-5xl opacity-80 group-hover:rotate-12 transition-transform drop-shadow-lg">
                    {getIcon(item.sektor)}
                  </div>

                  <span className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-2 block drop-shadow-md">
                    Sektor {item.sektor}
                  </span>
                  <h3 className="text-3xl font-display font-bold text-white mb-2 leading-tight drop-shadow-md">
                    {item.nama}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl font-bold text-sm">
                      {item.metrik}
                    </span>
                    {item.nilaiEkonomi ? (
                      <span className="bg-gold-500 text-ocean-950 px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                        {formatRp(item.nilaiEkonomi)} / Thn
                      </span>
                    ) : null}
                  </div>
                  
                  <p className="text-ocean-100 text-sm mt-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MIDDLE SECTION: INFOGRAFIS TOTAL NILAI EKONOMI (> 12 MILIAR) */}
      {totalEkonomi > 0 && (
        <section className="py-16">
          <div className="container-desa max-w-5xl">
            <div className="bg-gradient-to-br from-gold-500 to-yellow-600 rounded-[2.5rem] p-10 md:p-14 text-center shadow-xl relative overflow-hidden">
              {/* Efek Cahaya */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/30 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/20 blur-3xl rounded-full"></div>
              
              <h2 className="text-gold-950 font-bold uppercase tracking-widest text-sm mb-4 relative z-10">
                Total Nilai Produksi Komoditas Utama
              </h2>
              <div className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white drop-shadow-lg relative z-10 mb-4">
                {formatRp(totalEkonomi)}
              </div>
              <p className="text-gold-900 font-medium max-w-2xl mx-auto relative z-10">
                Estimasi perputaran uang per tahun dari hasil bumi dan laut Desa Tolai Barat. Membuka peluang besar bagi investor, kemitraan BUMDes, dan pengembangan hilirisasi produk.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* POTENSI MAKRO LAINNYA (Misal: Lahan Pariwisata) */}
      {otherMakro.length > 0 && (
        <section className="py-10 bg-ocean-50">
          <div className="container-desa">
            <h3 className="font-display font-bold text-2xl text-ocean-900 mb-8 text-center">Potensi Pengembangan & Lahan Aktif</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {otherMakro.map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-6 flex gap-6 items-center shadow-sm border border-ocean-100">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.image || "/images/potensi-hero.jpg"} alt={item.nama} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ocean-500 uppercase">{item.sektor}</span>
                    <h4 className="font-bold text-lg text-ocean-900 mb-1">{item.nama}</h4>
                    <div className="text-sm font-bold text-gold-600 bg-gold-50 inline-block px-2 py-1 rounded-md">
                      {item.metrik}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BOTTOM SECTION: DIREKTORI MIKRO & BUMDES */}
      <section className="section-padding bg-white">
        <div className="container-desa">
          <SectionHeader 
            badge="Ekonomi Mikro"
            title="UMKM & Penggerak Ekonomi Warga"
            subtitle="Daftar unit usaha, kios, dan toko yang bermitra atau beroperasi di kawasan Desa Tolai Barat."
            center
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {mikro.map(item => (
              <div key={item.id} className="card-base group flex flex-col h-full border border-ocean-100 hover:border-ocean-300">
                <div className="h-48 overflow-hidden relative">
                  <img src={item.image || "/images/potensi-hero.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.nama} />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-ocean-700 shadow-sm">
                    {item.sektor}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h4 className="font-bold text-ocean-900 mb-1 leading-tight">{item.nama}</h4>
                  {item.metrik && <span className="text-xs font-medium text-ocean-500 mb-3">{item.metrik}</span>}
                  
                  <p className="text-xs text-ocean-600 line-clamp-3 mb-6 flex-grow">{item.deskripsi}</p>
                  
                  {/* Area Kontak Bawah */}
                  <div className="mt-auto border-t border-ocean-50 pt-4">
                    {item.kontakName && (
                      <div className="text-xs text-ocean-500 font-medium mb-3 flex items-center gap-2">
                        👤 {item.kontakName}
                      </div>
                    )}
                    {item.whatsapp ? (
                      <a href={`https://wa.me/${item.whatsapp}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
                        <span>💬 Hubungi via WhatsApp</span>
                      </a>
                    ) : (
                      <div className="text-center w-full py-2.5 bg-ocean-50 text-ocean-400 rounded-xl text-xs font-bold">
                        Kontak Tidak Tersedia
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}