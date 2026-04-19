// File: app/admin/survei/[id]/hasil/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSurveiById, getHasilSurvei } from "@/lib/firebase/survei";
import type { Survei, HasilPertanyaan } from "@/types";

export default function HasilSurveiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();

  const [survei, setSurvei]   = useState<Survei | null>(null);
  const [hasil, setHasil]     = useState<HasilPertanyaan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSurveiById(id), getHasilSurvei(id)]).then(([s, h]) => {
      setSurvei(s); setHasil(h); setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-8 text-ocean-500">Memuat hasil komputasi...</div>;
  if (!survei) return <div className="p-8">Survei tidak ditemukan.</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/admin/survei")} className="text-ocean-500 hover:text-ocean-800 font-bold">← Kembali</button>
        <div>
          <h1 className="font-display font-bold text-2xl text-ocean-900">Analisis Survei</h1>
          <p className="text-ocean-500 text-sm">{survei.judul}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-card border border-ocean-100 text-center"><p className="text-ocean-500 text-sm font-bold uppercase">Total Responden</p><p className="text-4xl font-display font-bold text-ocean-900 mt-2">{survei.totalResponden}</p></div>
        <div className="bg-white p-6 rounded-2xl shadow-card border border-ocean-100 text-center"><p className="text-ocean-500 text-sm font-bold uppercase">Jumlah Soal</p><p className="text-4xl font-display font-bold text-gold-600 mt-2">{survei.pertanyaan.length}</p></div>
        <div className="bg-white p-6 rounded-2xl shadow-card border border-ocean-100 text-center"><p className="text-ocean-500 text-sm font-bold uppercase">Status</p><p className={`text-3xl font-display font-bold mt-2 ${survei.aktif ? 'text-forest-500' : 'text-red-500'}`}>{survei.aktif ? "Aktif" : "Ditutup"}</p></div>
      </div>

      <div className="space-y-8">
        {hasil.map((h, idx) => {
          const maxCount = Math.max(...h.opsi.map((o) => o.count), 1);
          const isParagraf = h.tipe === "paragraf";

          return (
            <div key={h.pertanyaanId} className="bg-white rounded-3xl p-8 shadow-card border border-ocean-100">
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-ocean-50">
                <span className="bg-ocean-100 text-ocean-700 px-4 py-1.5 rounded-full font-bold text-sm">P{idx + 1}</span>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-ocean-900 mb-1">{h.teks}</h3>
                  <p className="text-xs font-bold text-ocean-400 uppercase tracking-widest">{h.tipe.replace('_', ' ')} • {h.totalJawaban} Jawaban</p>
                </div>
              </div>

              {/* Render untuk Pilihan Ganda / Checkbox / Skala (Bar Chart) */}
              {!isParagraf && (
                <div className="space-y-4">
                  {h.opsi.sort((a, b) => h.tipe === "skala" ? Number(a.teks) - Number(b.teks) : b.count - a.count).map((opsi) => (
                    <div key={opsi.teks}>
                      <div className="flex justify-between text-sm mb-1 font-medium">
                        <span className="text-ocean-800">{h.tipe === "skala" ? `Rating ${opsi.teks}` : opsi.teks}</span>
                        <span className="text-ocean-600">{opsi.count} ({opsi.persen}%)</span>
                      </div>
                      <div className="h-3 bg-ocean-50 rounded-full overflow-hidden">
                        <div className="h-full bg-ocean-500 rounded-full transition-all duration-1000" style={{ width: `${(opsi.count / maxCount) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Render untuk Teks Paragraf (Chat Bubbles) */}
              {isParagraf && (
                <div className="bg-ocean-50 rounded-2xl p-4 max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
                  {h.jawabanTeks && h.jawabanTeks.length > 0 ? (
                    h.jawabanTeks.map((teks, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl shadow-sm text-ocean-800 text-sm border border-ocean-100">
                        <span className="text-xs text-ocean-400 font-bold block mb-1">Responden {i + 1}</span>
                        "{teks}"
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-ocean-400 font-medium">Belum ada jawaban teks masuk.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}