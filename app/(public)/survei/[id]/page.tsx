// File: app/(public)/survei/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSurveiById, submitJawaban, sudahIsiSurvei, markSudahIsi } from "@/lib/firebase/survei";
import type { Survei } from "@/types";

export default function SurveiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();

  const [survei, setSurvei]       = useState<Survei | null>(null);
  const [loading, setLoading]     = useState(true);
  const [sudahIsi, setSudahIsi]   = useState(false);
  const [jawaban, setJawaban]     = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selesai, setSelesai]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    getSurveiById(id).then(data => {
      if (!data) return router.replace("/survei");
      setSurvei(data); setSudahIsi(sudahIsiSurvei(id)); setLoading(false);
    });
  }, [id, router]);

  function handleInput(pId: string, val: any, tipe: string) {
    setJawaban(prev => {
      if (tipe === "kotak_centang") {
        const current = Array.isArray(prev[pId]) ? prev[pId] : [];
        if (current.includes(val)) return { ...prev, [pId]: current.filter((x: string) => x !== val) };
        return { ...prev, [pId]: [...current, val] };
      }
      return { ...prev, [pId]: val };
    });
  }

  async function handleSubmit() {
    if (!survei) return;
    const belumDijawab = survei.pertanyaan.filter(p => {
      const ans = jawaban[p.id];
      if (p.tipe === "kotak_centang") return !ans || ans.length === 0;
      return !ans || String(ans).trim() === "";
    });

    if (belumDijawab.length > 0) return setError(`Harap jawab semua pertanyaan. ${belumDijawab.length} pertanyaan belum terisi.`);
    
    setError(""); setSubmitting(true);
    try {
      await submitJawaban(id, jawaban);
      markSudahIsi(id); setSelesai(true);
    } catch { setError("Gagal mengirim jawaban. Periksa koneksi internet Anda."); } 
    finally { setSubmitting(false); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-ocean-500">Memuat survei elegan...</div>;
  if (!survei) return null;

  if ((sudahIsi && !selesai) || selesai) return (
    <div className="min-h-screen bg-ocean-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl max-w-lg w-full text-center border border-ocean-100">
        <div className="text-6xl mb-6">{selesai ? "🎉" : "✅"}</div>
        <h2 className="font-display font-bold text-2xl text-ocean-900 mb-4">{selesai ? "Jawaban Terkirim!" : "Anda sudah mengisi survei ini"}</h2>
        <p className="text-ocean-600 mb-8">{selesai ? "Terima kasih atas kontribusi Anda untuk kemajuan Desa Tolai Barat." : "Satu perangkat hanya diperbolehkan mengisi satu kali."}</p>
        <button onClick={() => router.push("/survei")} className="btn-primary w-full py-4">Kembali ke Daftar Survei</button>
      </div>
    </div>
  );

  const totalP = survei.pertanyaan.length;
  const sudahDijawab = survei.pertanyaan.filter(p => p.tipe === "kotak_centang" ? (jawaban[p.id]?.length > 0) : !!jawaban[p.id]).length;
  const progress = totalP > 0 ? Math.round((sudahDijawab / totalP) * 100) : 0;

  return (
    <div className="min-h-screen bg-sand-50 pb-20 font-sans">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-ocean-100 shadow-sm px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="font-bold text-ocean-900 line-clamp-1">{survei.judul}</div>
          <div className="text-xs font-bold text-ocean-500 bg-ocean-50 px-3 py-1.5 rounded-full">{progress}% Selesai</div>
        </div>
        <div className="absolute bottom-0 left-0 h-1 bg-ocean-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10">
        {survei.deskripsi && <p className="text-center text-ocean-600 mb-10 text-lg">{survei.deskripsi}</p>}

        <div className="space-y-12">
          {survei.pertanyaan.map((p, idx) => {
            const t = p.tipe || "pilihan_ganda";
            const ans = jawaban[p.id];

            return (
              <div key={p.id} className={`bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border-2 transition-colors duration-300 ${ans ? 'border-ocean-300 shadow-ocean-100' : 'border-transparent'}`}>
                <h3 className="font-display font-bold text-xl text-ocean-900 mb-6 leading-relaxed">
                  <span className="text-ocean-400 mr-3">{idx + 1}.</span>{p.teks}
                </h3>

                {t === "pilihan_ganda" && (
                  <div className="space-y-3">
                    {p.opsi.map(o => (
                      <button key={o} onClick={() => handleInput(p.id, o, t)} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${ans === o ? 'border-ocean-600 bg-ocean-50 text-ocean-900 font-bold' : 'border-ocean-100 bg-white text-ocean-700 hover:border-ocean-300'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${ans === o ? 'border-ocean-600' : 'border-ocean-300'}`}>
                          {ans === o && <div className="w-2.5 h-2.5 bg-ocean-600 rounded-full"></div>}
                        </div>
                        {o}
                      </button>
                    ))}
                  </div>
                )}

                {t === "kotak_centang" && (
                  <div className="space-y-3">
                    <p className="text-xs text-ocean-400 font-bold uppercase tracking-widest mb-2">* Bisa pilih lebih dari satu</p>
                    {p.opsi.map(o => {
                      const isChecked = Array.isArray(ans) && ans.includes(o);
                      return (
                        <button key={o} onClick={() => handleInput(p.id, o, t)} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${isChecked ? 'border-forest-500 bg-forest-50 text-forest-900 font-bold' : 'border-ocean-100 bg-white text-ocean-700 hover:border-ocean-300'}`}>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isChecked ? 'border-forest-500 bg-forest-500 text-white' : 'border-ocean-300'}`}>
                            {isChecked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}

                {t === "skala" && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-ocean-500 mb-4 uppercase tracking-widest">
                      <span>{p.opsi[0] || "Buruk"}</span><span>{p.opsi[1] || "Baik"}</span>
                    </div>
                    <div className="flex justify-between gap-2 md:gap-4">
                      {Array.from({ length: p.skalaMax || 5 }).map((_, i) => {
                        const val = i + 1;
                        const isSelected = ans === val;
                        return (
                          <button key={val} onClick={() => handleInput(p.id, val, t)} className={`flex-1 aspect-square rounded-2xl flex items-center justify-center text-lg font-bold transition-all border-2 ${isSelected ? 'bg-ocean-600 border-ocean-600 text-white shadow-lg transform -translate-y-1' : 'bg-white border-ocean-100 text-ocean-600 hover:border-ocean-300 hover:bg-ocean-50'}`}>
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {t === "paragraf" && (
                  <textarea 
                    value={ans || ""} 
                    onChange={(e) => handleInput(p.id, e.target.value, t)}
                    placeholder="Ketik jawaban Anda di sini..."
                    className="w-full bg-ocean-50 border-none rounded-2xl p-6 text-ocean-900 focus:ring-2 focus:ring-ocean-500 min-h-[150px] resize-y"
                  />
                )}

              </div>
            );
          })}
        </div>

        {error && <div className="mt-10 bg-red-100 text-red-700 p-4 rounded-xl text-center font-bold">{error}</div>}

        <button 
          onClick={handleSubmit} 
          disabled={submitting || progress !== 100}
          className="btn-primary w-full py-5 text-lg mt-10 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Memproses..." : progress === 100 ? "🚀 Kirim Semua Jawaban" : "Lengkapi Jawaban Anda"}
        </button>
      </div>
    </div>
  );
}