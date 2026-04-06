// File: app/admin/bumdes/[id]/edit/page.tsx

"use client";

import { useState, useEffect, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBumdesUnitById, updateBumdesUnit } from "@/lib/firebase/bumdes";
import ImageUpload from "@/components/admin/ImageUpload";

export default function EditBumdesUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    namaUnit: "", pengelola: "", description: "", image: "", whatsapp: "", aktif: true,
  });

  useEffect(() => {
    async function loadData() {
      const data = await getBumdesUnitById(id);
      if (data) {
        setForm({
          namaUnit: data.namaUnit, pengelola: data.pengelola, description: data.description,
          image: data.image, whatsapp: data.whatsapp || "", aktif: data.aktif,
        });
      } else {
        alert("Unit usaha tidak ditemukan.");
        router.push("/admin/bumdes");
      }
      setLoading(false);
    }
    loadData();
  }, [id, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBumdesUnit(id, form);
      router.push("/admin/bumdes");
    } catch {
      alert("Gagal menyimpan perubahan.");
      setSaving(false);
    }
  }

  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ocean-700)", marginBottom: "6px" };

  if (loading) return <div style={{ padding: "40px" }}>Memuat form...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "700px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <Link href="/admin/bumdes" style={{ textDecoration: "none", color: "var(--color-ocean-500)", fontSize: "1.2rem" }}>← Back</Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.5rem", color: "var(--color-ocean-900)" }}>Edit Unit Usaha</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Nama Unit Usaha *</label>
          <input type="text" className="input-base" value={form.namaUnit} onChange={(e) => setForm({ ...form, namaUnit: e.target.value })} required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Nama Pengelola *</label>
            <input type="text" className="input-base" value={form.pengelola} onChange={(e) => setForm({ ...form, pengelola: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Nomor WhatsApp</label>
            <input type="text" className="input-base" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Deskripsi Layanan *</label>
          <textarea className="input-base" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div>
          <label style={labelStyle}>Status Unit</label>
          <select className="input-base" value={form.aktif ? "true" : "false"} onChange={(e) => setForm({ ...form, aktif: e.target.value === "true" })}>
            <option value="true">Aktif Beroperasi</option>
            <option value="false">Non-Aktif</option>
          </select>
        </div>
        
        <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Foto Unit Usaha" />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
          <Link href="/admin/bumdes" className="btn-secondary" style={{ padding: "10px 24px" }}>Batal</Link>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "10px 24px" }}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}