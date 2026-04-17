// File: app/admin/potensi/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { getAllPotensi, createPotensi, updatePotensi, deletePotensi } from "@/lib/firebase/potensi";
import ImageUpload from "@/components/admin/ImageUpload";
import type { PotensiDesa, PotensiKategori } from "@/types";

export default function AdminPotensiPage() {
  const [list, setList] = useState<PotensiDesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PotensiKategori | "semua">("semua");
  const [form, setForm] = useState<Partial<PotensiDesa> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await getAllPotensi();
    // Sortir agar makro tampil lebih dulu
    setList(data.sort((a, b) => a.kategori.localeCompare(b.kategori)));
    setLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form?.nama) return;
    try {
      const dataToSave = { ...form, nilaiEkonomi: Number(form.nilaiEkonomi) || 0 };
      if (editId) await updatePotensi(editId, dataToSave);
      else await createPotensi(dataToSave as Omit<PotensiDesa, "id">);
      setForm(null); setEditId(null);
      load();
    } catch { alert("Gagal menyimpan."); }
  }

  const filteredList = filter === "semua" ? list : list.filter(item => item.kategori === filter);
  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ocean-900">Manajemen Potensi Desa</h1>
          <p className="text-sm text-ocean-500">Masukkan data komoditas makro & usaha mikro warga.</p>
        </div>
        <button onClick={() => setForm({ kategori: "makro", sektor: "pertanian", image: "", nilaiEkonomi: 0 })} className="btn-primary">
          + Tambah Potensi/Usaha
        </button>
      </div>

      <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm w-fit">
        {["semua", "makro", "mikro"].map(k => (
          <button key={k} onClick={() => setFilter(k as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === k ? 'bg-ocean-700 text-white' : 'text-ocean-600 hover:bg-ocean-50'}`}>
            {k.toUpperCase()}
          </button>
        ))}
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editId ? 'Edit' : 'Tambah'} Potensi/Usaha</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-bold block mb-1">Nama Potensi/Usaha *</label>
                <input type="text" className="input-base" placeholder="Cth: Padi Sawah / Toko Sembako Pak Budi" value={form.nama || ""} onChange={e => setForm({...form, nama: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Kategori *</label>
                <select className="input-base" value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value as any})}>
                  <option value="makro">Makro (Komoditas Utama/Besar)</option>
                  <option value="mikro">Mikro (UMKM/Toko/Kios)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Sektor *</label>
                <select className="input-base" value={form.sektor} onChange={e => setForm({...form, sektor: e.target.value as any})}>
                  <option value="pertanian">Pertanian</option>
                  <option value="perkebunan">Perkebunan</option>
                  <option value="perikanan">Perikanan</option>
                  <option value="pariwisata">Pariwisata</option>
                  <option value="perdagangan">Perdagangan</option>
                  <option value="jasa">Jasa</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Angka Metrik / Volume</label>
                <input type="text" className="input-base" placeholder="Cth: 446 Hektar / 88 Ton" value={form.metrik || ""} onChange={e => setForm({...form, metrik: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Nilai Ekonomi / Tahun (Rp)</label>
                <input type="number" className="input-base" placeholder="Cth: 10400400000 (Hanya Angka)" value={form.nilaiEkonomi || ""} onChange={e => setForm({...form, nilaiEkonomi: Number(e.target.value)})} />
                <span className="text-xs text-green-600 font-medium mt-1 block">Tampil: {formatRp(Number(form.nilaiEkonomi) || 0)}</span>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Nama Kontak (Opsional)</label>
                <input type="text" className="input-base" value={form.kontakName || ""} onChange={e => setForm({...form, kontakName: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">WhatsApp (628...)</label>
                <input type="text" className="input-base" value={form.whatsapp || ""} onChange={e => setForm({...form, whatsapp: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-bold block mb-1">Deskripsi Singkat</label>
                <textarea className="input-base" rows={3} value={form.deskripsi || ""} onChange={e => setForm({...form, deskripsi: e.target.value})} />
              </div>
              <div className="col-span-2">
                <ImageUpload value={form.image || ""} onChange={url => setForm({...form, image: url})} label="Foto Potensi (Landscape)" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="submit" className="btn-primary flex-1">Simpan Data</button>
              <button type="button" onClick={() => setForm(null)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-ocean-50 text-ocean-700 text-sm uppercase">
            <tr>
              <th className="p-4">Potensi</th>
              <th className="p-4">Metrik & Nilai</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(item => (
              <tr key={item.id} className="border-t hover:bg-ocean-50/50">
                <td className="p-4">
                  <div className="font-bold text-ocean-900">{item.nama}</div>
                  <div className="text-xs text-ocean-500 uppercase">{item.sektor}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-ocean-700">{item.metrik || '-'}</div>
                  {item.nilaiEkonomi ? <div className="text-xs text-green-600 font-bold">{formatRp(item.nilaiEkonomi)} / thn</div> : null}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${item.kategori === 'makro' ? 'bg-gold-100 text-gold-700' : 'bg-ocean-100 text-ocean-700'}`}>
                    {item.kategori}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => {setForm(item); setEditId(item.id)}} className="p-2 text-ocean-600 hover:bg-ocean-100 rounded-lg">Edit</button>
                  <button onClick={() => { if(confirm('Hapus?')) deletePotensi(item.id).then(load)}} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}