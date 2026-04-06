// File: app/admin/bumdes/page.tsx

"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import {
  getBumdesProfile, updateBumdesProfile,
  getAllBumdesUnits, deleteBumdesUnit
} from "@/lib/firebase/bumdes";
import type { BumdesProfile, BumdesUnit } from "@/types";

export default function AdminBumdesPage() {
  const [profile, setProfile] = useState<BumdesProfile | null>(null);
  const [units, setUnits] = useState<BumdesUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Ambil data profil & unit usaha saat halaman dimuat
  useEffect(() => {
    async function loadData() {
      const [profData, unitsData] = await Promise.all([
        getBumdesProfile(),
        getAllBumdesUnits()
      ]);
      setProfile(profData);
      setUnits(unitsData);
      setLoading(false);
    }
    loadData();
  }, []);

  // Fungsi simpan profil BUMDes
  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    try {
      await updateBumdesProfile(profile);
      alert("Profil BUMDes berhasil diperbarui!");
    } catch {
      alert("Gagal memperbarui profil.");
    } finally {
      setSavingProfile(false);
    }
  }

  // Fungsi hapus unit usaha
  async function handleDeleteUnit(id: string, nama: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus unit usaha "${nama}"?`)) return;
    try {
      await deleteBumdesUnit(id);
      setUnits((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Gagal menghapus unit usaha.");
    }
  }

  if (loading || !profile) return <div style={{ padding: "40px", textAlign: "center" }}>Memuat data BUMDes...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "1000px" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.75rem", color: "var(--color-ocean-900)" }}>
            Kelola BUMDes
          </h1>
          <p style={{ color: "var(--color-ocean-500)", fontSize: "0.875rem", marginTop: "4px" }}>
            Atur profil utama dan unit usaha BUMDes Tolai Barat.
          </p>
        </div>
      </div>

      {/* BAGIAN 1: FORM PROFIL BUMDES */}
      <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-ocean-800)", marginBottom: "20px", borderBottom: "1px solid var(--color-ocean-100)", paddingBottom: "12px" }}>
          🏢 Profil Utama BUMDes
        </h2>
        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ocean-700)", marginBottom: "6px" }}>Nama BUMDes</label>
              <input type="text" className="input-base" value={profile.nama} onChange={(e) => setProfile({ ...profile, nama: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ocean-700)", marginBottom: "6px" }}>Direktur / Ketua BUMDes</label>
              <input type="text" className="input-base" value={profile.direktur} onChange={(e) => setProfile({ ...profile, direktur: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ocean-700)", marginBottom: "6px" }}>Nomor Telepon (WA)</label>
              <input type="text" className="input-base" value={profile.telepon} onChange={(e) => setProfile({ ...profile, telepon: e.target.value })} placeholder="Cth: 62812..." />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ocean-700)", marginBottom: "6px" }}>Email Publik</label>
              <input type="email" className="input-base" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ocean-700)", marginBottom: "6px" }}>Visi BUMDes</label>
            <input type="text" className="input-base" value={profile.visi} onChange={(e) => setProfile({ ...profile, visi: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "var(--color-ocean-700)", marginBottom: "6px" }}>Deskripsi & Tentang BUMDes</label>
            <textarea className="input-base" rows={4} value={profile.deskripsi} onChange={(e) => setProfile({ ...profile, deskripsi: e.target.value })} required />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="submit" disabled={savingProfile} className="btn-primary" style={{ padding: "10px 24px" }}>
              {savingProfile ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>
        </form>
      </div>

      {/* BAGIAN 2: DAFTAR UNIT USAHA */}
      <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-ocean-100)", paddingBottom: "12px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-ocean-800)" }}>
            🛒 Kelola Unit Usaha
          </h2>
          <Link href="/admin/bumdes/tambah" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            + Tambah Unit Baru
          </Link>
        </div>

        {units.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--color-ocean-400)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🏢</div>
            <p>Belum ada unit usaha yang ditambahkan.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--color-ocean-50)" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "0.75rem", color: "var(--color-ocean-600)" }}>UNIT USAHA</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "0.75rem", color: "var(--color-ocean-600)" }}>PENGELOLA</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "0.75rem", color: "var(--color-ocean-600)" }}>STATUS</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "0.75rem", color: "var(--color-ocean-600)" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u, i) => (
                  <tr key={u.id} style={{ borderTop: "1px solid var(--color-ocean-100)", background: i % 2 === 0 ? "white" : "var(--color-ocean-50)" }}>
                    <td style={{ padding: "12px", fontWeight: 500, color: "var(--color-ocean-900)" }}>{u.namaUnit}</td>
                    <td style={{ padding: "12px", fontSize: "0.85rem" }}>{u.pengelola}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: u.aktif ? "#DCFCE7" : "#FEE2E2", color: u.aktif ? "#15803D" : "#991B1B", padding: "4px 10px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600 }}>
                        {u.aktif ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link href={`/admin/bumdes/${u.id}/edit`} style={{ padding: "6px 12px", background: "var(--color-ocean-100)", color: "var(--color-ocean-700)", borderRadius: "6px", fontSize: "0.75rem", textDecoration: "none", fontWeight: 500 }}>Edit</Link>
                        <button onClick={() => handleDeleteUnit(u.id, u.namaUnit)} style={{ padding: "6px 12px", background: "#FEE2E2", color: "#991B1B", borderRadius: "6px", fontSize: "0.75rem", border: "none", cursor: "pointer", fontWeight: 500 }}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}