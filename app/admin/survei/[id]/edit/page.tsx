// File: app/admin/survei/[id]/edit/page.tsx
"use client";

import { useState, useEffect, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import { getSurveiById, updateSurvei, generateId } from "@/lib/firebase/survei";
import { createPengumuman } from "@/lib/firebase/pengumuman";
import type { PertanyaanSurvei, TipePertanyaan, PengumumanPriority } from "@/types";

const ls: React.CSSProperties = { display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--color-ocean-700)", marginBottom: "6px" };

function buatPertanyaanBaru(): PertanyaanSurvei {
  return { id: generateId(), teks: "", tipe: "pilihan_ganda", opsi: ["Opsi 1", "Opsi 2"], skalaMax: 5 };
}

export default function EditSurveiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm]     = useState({ judul: "", deskripsi: "", aktif: true, startDate: "", endDate: "" });
  const [pertanyaan, setPertanyaan] = useState<PertanyaanSurvei[]>([]);
  const [buatBanner, setBuatBanner] = useState(false);
  const [bannerPriority, setBannerPriority] = useState<PengumumanPriority>("penting");

  useEffect(() => {
    getSurveiById(id).then((data) => {
      if (!data) {
        alert("Survei tidak ditemukan");
        router.replace("/admin/survei");
        return;
      }
      setForm({
        judul: data.judul,
        deskripsi: data.deskripsi,
        aktif: data.aktif,
        startDate: data.startDate,
        endDate: data.endDate || "",
      });
      setPertanyaan(data.pertanyaan || [buatPertanyaanBaru()]);
      setLoadingInitial(false);
    });
  }, [id, router]);

  function setF(key: string, value: string | boolean) { setForm((prev) => ({ ...prev, [key]: value })); }
  function addPertanyaan() { setPertanyaan((prev) => [...prev, buatPertanyaanBaru()]); }
  function removePertanyaan(index: number) { if (pertanyaan.length > 1) setPertanyaan((prev) => prev.filter((_, i) => i !== index)); }
  function updateP(index: number, key: keyof PertanyaanSurvei, val: any) {
    setPertanyaan(prev => prev.map((p, i) => i === index ? { ...p, [key]: val } : p));
  }
  function addOpsi(pIdx: number) { setPertanyaan(prev => prev.map((p, i) => i === pIdx ? { ...p, opsi: [...p.opsi, `Opsi ${p.opsi.length + 1}`] } : p)); }
  function removeOpsi(pIdx: number, oIdx: number) { setPertanyaan(prev => prev.map((p, i) => (i === pIdx && p.opsi.length > 2) ? { ...p, opsi: p.opsi.filter((_, oi) => oi !== oIdx) } : p)); }
  function setOpsi(pIdx: number, oIdx: number, val: string) { setPertanyaan(prev => prev.map((p, i) => { if (i !== pIdx) return p; const opsi = [...p.opsi]; opsi[oIdx] = val; return { ...p, opsi }; })); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.judul.trim()) return alert("Judul wajib diisi.");
    for (let i = 0; i < pertanyaan.length; i++) {
      const p = pertanyaan[i];
      if (!p.teks.trim()) return alert(`Pertanyaan ke-${i + 1} belum diisi.`);
      if ((p.tipe === "pilihan_ganda" || p.tipe === "kotak_centang") && p.opsi.some(o => !o.trim())) return alert(`Ada opsi kosong di pertanyaan ke-${i + 1}.`);
      if (p.tipe === "skala" && p.opsi.length < 2) p.opsi = ["Sangat Buruk", "Sangat Baik"]; // Default fallback
    }
    setSaving(true);
    try {
      await updateSurvei(id, { judul: form.judul.trim(), deskripsi: form.deskripsi.trim(), aktif: form.aktif, startDate: form.startDate, endDate: form.endDate.trim() || null, pertanyaan });
      
      if (buatBanner) {
        await createPengumuman({
          title: "Survei: " + form.judul.trim(),
          content: form.deskripsi.trim() || "Silakan berpartisipasi mengisi survei ini.",
          type: "pengumuman",
          priority: bannerPriority,
          startDate: form.startDate || new Date().toISOString().split("T")[0],
          endDate: form.endDate.trim() || null,
          aktif: true,
          link: "/survei/" + id,
          linkText: "Isi Survei",
        });
      }

      router.push("/admin/survei");
    } catch { alert("Gagal mengupdate survei."); setSaving(false); }
  }

  if (loadingInitial) return <div className="p-8 text-ocean-500">Memuat data survei...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-ocean-500 hover:text-ocean-700 font-bold">← Kembali</button>
        <h1 className="font-display font-bold text-2xl text-ocean-900">Edit Survei Dinamis</h1>
      </div>

      {/* DUA KOLOM: Kiri Form, Kanan Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* --- KOLOM KIRI: EDITOR --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card border border-ocean-100">
            <h2 className="font-bold text-ocean-800 mb-4 border-b border-ocean-50 pb-2">Pengaturan Dasar</h2>
            <div className="space-y-4">
              <div><label style={ls}>Judul Survei *</label><input type="text" value={form.judul} onChange={(e) => setF("judul", e.target.value)} placeholder="Formulir Kepuasan..." className="input-base" required /></div>
              <div><label style={ls}>Deskripsi (Opsional)</label><textarea value={form.deskripsi} onChange={(e) => setF("deskripsi", e.target.value)} rows={2} className="input-base" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label style={ls}>Tgl Mulai *</label><input type="date" value={form.startDate} onChange={(e) => setF("startDate", e.target.value)} className="input-base" required /></div>
                <div><label style={ls}>Tgl Berakhir</label><input type="date" value={form.endDate} onChange={(e) => setF("endDate", e.target.value)} className="input-base" /></div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-ocean-50">
                <div className="flex items-center gap-3 mb-3">
                  <input type="checkbox" id="buatBanner" checked={buatBanner} onChange={(e) => setBuatBanner(e.target.checked)} className="w-5 h-5 rounded border-ocean-300 text-ocean-600 focus:ring-ocean-500 cursor-pointer" />
                  <label htmlFor="buatBanner" className="font-bold text-ocean-800 cursor-pointer">Tampilkan / Update Banner Pengumuman Baru</label>
                </div>
                {buatBanner && (
                  <div className="pl-8 bg-ocean-50 p-4 rounded-xl space-y-3 border border-ocean-100">
                    <p className="text-xs text-ocean-600">Jika dicentang, sistem akan mengirimkan banner pengumuman untuk survei ini.</p>
                    <div>
                      <label style={ls}>Prioritas Banner</label>
                      <select value={bannerPriority} onChange={(e) => setBannerPriority(e.target.value as PengumumanPriority)} className="input-base py-2">
                         <option value="penting">Penting (Muncul Banner Warna Kuning Emas)</option>
                         <option value="darurat">Darurat (Muncul Banner Warna Merah)</option>
                         <option value="normal">Normal (Banner Biru Standar)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {pertanyaan.map((p, pIdx) => (
            <div key={p.id} className="bg-white rounded-2xl p-6 shadow-card border border-ocean-100 relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-ocean-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-4">
                <span className="bg-ocean-100 text-ocean-800 text-xs font-bold px-3 py-1 rounded-full">Pertanyaan {pIdx + 1}</span>
                {pertanyaan.length > 1 && <button type="button" onClick={() => removePertanyaan(pIdx)} className="text-red-500 text-sm hover:underline font-medium">Hapus</button>}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-2">
                  <label style={ls}>Pertanyaan *</label>
                  <input type="text" value={p.teks} onChange={(e) => updateP(pIdx, "teks", e.target.value)} placeholder="Ketik pertanyaan di sini..." className="input-base" required />
                </div>
                <div>
                  <label style={ls}>Jenis Jawaban</label>
                  <select value={p.tipe} onChange={(e) => updateP(pIdx, "tipe", e.target.value as TipePertanyaan)} className="input-base font-medium">
                    <option value="pilihan_ganda">🔘 Pilihan Ganda</option>
                    <option value="kotak_centang">☑️ Kotak Centang</option>
                    <option value="skala">📏 Skala Bipolar</option>
                    <option value="paragraf">📝 Teks Paragraf</option>
                  </select>
                </div>
              </div>

              {/* Logika Editor Opsi Berdasarkan Tipe */}
              {(p.tipe === "pilihan_ganda" || p.tipe === "kotak_centang") && (
                <div className="pl-4 border-l-2 border-ocean-50 space-y-2">
                  {p.opsi.map((opsi, oIdx) => (
                    <div key={oIdx} className="flex gap-2 items-center">
                      <span className="text-ocean-300">{p.tipe === "pilihan_ganda" ? "○" : "☐"}</span>
                      <input type="text" value={opsi} onChange={(e) => setOpsi(pIdx, oIdx, e.target.value)} className="input-base py-1.5 text-sm" required />
                      <button type="button" onClick={() => removeOpsi(pIdx, oIdx)} disabled={p.opsi.length <= 2} className="text-red-400 hover:text-red-600 disabled:opacity-30">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOpsi(pIdx)} className="text-ocean-600 text-sm font-bold mt-2 hover:underline">+ Tambah Opsi</button>
                </div>
              )}

              {p.tipe === "skala" && (
                <div className="bg-ocean-50 p-4 rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-bold text-ocean-700">Skala 1 sampai</span>
                    <select value={p.skalaMax} onChange={(e) => updateP(pIdx, "skalaMax", Number(e.target.value))} className="input-base w-24 py-1">
                      <option value={5}>5</option><option value={10}>10</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1"><label className="text-xs font-bold text-ocean-500 mb-1 block">Label Angka 1 (Kiri)</label><input type="text" value={p.opsi[0] || ""} onChange={(e) => setOpsi(pIdx, 0, e.target.value)} placeholder="Sangat Buruk" className="input-base py-1.5 text-sm" /></div>
                    <div className="flex-1"><label className="text-xs font-bold text-ocean-500 mb-1 block">Label Angka {p.skalaMax} (Kanan)</label><input type="text" value={p.opsi[1] || ""} onChange={(e) => setOpsi(pIdx, 1, e.target.value)} placeholder="Sangat Baik" className="input-base py-1.5 text-sm" /></div>
                  </div>
                </div>
              )}

              {p.tipe === "paragraf" && (
                <div className="bg-gray-100 border border-gray-200 border-dashed rounded-xl p-4 text-center text-sm text-gray-500">
                  Responden akan melihat kotak isian teks panjang di sini.
                </div>
              )}
            </div>
          ))}

          <button type="button" onClick={addPertanyaan} className="w-full py-4 border-2 border-dashed border-ocean-300 text-ocean-700 font-bold rounded-2xl hover:bg-ocean-50 transition-colors">
            + Tambah Pertanyaan Baru
          </button>

          <button type="submit" disabled={saving} className="btn-primary w-full py-4 text-lg shadow-lg">
            {saving ? "Menyimpan..." : "💾 Update & Simpan Perubahan"}
          </button>
        </form>

        {/* --- KOLOM KANAN: LIVE PREVIEW --- */}
        <div className="hidden lg:block sticky top-8">
          <div className="bg-[#f0f4f8] rounded-[2.5rem] p-6 shadow-inner border-[8px] border-ocean-900 h-[85vh] overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-ocean-800 rounded-full mb-4"></div>
            
            <div className="mt-8 mb-6">
              <h2 className="text-2xl font-display font-bold text-ocean-900">{form.judul || "Judul Survei"}</h2>
              <p className="text-sm text-ocean-600 mt-2">{form.deskripsi || "Deskripsi survei akan muncul di sini."}</p>
            </div>

            <div className="space-y-6">
              {pertanyaan.map((p, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-ocean-50">
                  <p className="font-bold text-ocean-900 mb-4">{p.teks || "Pertanyaan belum diisi?"}</p>
                  
                  {p.tipe === "pilihan_ganda" && p.opsi.map((o, i) => (
                    <div key={i} className="flex items-center gap-3 mb-2"><div className="w-4 h-4 rounded-full border-2 border-ocean-200"></div><span className="text-sm text-ocean-700">{o || "Opsi"}</span></div>
                  ))}
                  
                  {p.tipe === "kotak_centang" && p.opsi.map((o, i) => (
                    <div key={i} className="flex items-center gap-3 mb-2"><div className="w-4 h-4 rounded border-2 border-ocean-200"></div><span className="text-sm text-ocean-700">{o || "Opsi"}</span></div>
                  ))}

                  {p.tipe === "skala" && (
                    <div>
                      <div className="flex justify-between text-xs text-ocean-500 mb-2 font-bold uppercase tracking-wider"><span>{p.opsi[0] || "Label 1"}</span><span>{p.opsi[1] || "Label Max"}</span></div>
                      <div className="flex justify-between gap-1">
                        {Array.from({ length: p.skalaMax || 5 }).map((_, i) => (
                          <div key={i} className="flex-1 aspect-square rounded-lg border border-ocean-200 flex items-center justify-center text-sm font-medium text-ocean-400 bg-ocean-50">{i + 1}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.tipe === "paragraf" && (
                    <div className="w-full h-20 border-b-2 border-ocean-100 bg-ocean-50/30 rounded-t-lg"></div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 bg-ocean-600 text-white text-center py-3 rounded-xl font-bold opacity-50">Kirim Jawaban</div>
          </div>
        </div>

      </div>
    </div>
  );
}
