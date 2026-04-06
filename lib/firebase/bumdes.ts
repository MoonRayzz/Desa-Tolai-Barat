// File: lib/firebase/bumdes.ts

import {
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "./config";
import type { BumdesProfile, BumdesUnit } from "@/types";

// Nama koleksi di Firestore
const PROFILE_DOC_ID = "main_profile";
const COL_BUMDES_PROFILE = "bumdes_profile";
const COL_BUMDES_UNITS = "bumdes_units";

// ==========================================
// 1. FUNGSI UNTUK PROFIL UTAMA BUMDES
// ==========================================

// Mengambil data Profil BUMDes
export async function getBumdesProfile(): Promise<BumdesProfile> {
  try {
    const ref = doc(db, COL_BUMDES_PROFILE, PROFILE_DOC_ID);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      return snap.data() as BumdesProfile;
    }
    
    // Fallback jika admin belum pernah menyimpan profil BUMDes
    return {
      nama: "BUMDes Tolai Barat",
      deskripsi: "Badan Usaha Milik Desa Tolai Barat yang berfokus pada pemberdayaan ekonomi masyarakat dan pengelolaan aset desa.",
      direktur: "Belum Diatur",
      telepon: "",
      email: "",
      visi: "Menjadi roda penggerak ekonomi desa yang mandiri dan menyejahterakan warga."
    };
  } catch (error) {
    console.error("Gagal mengambil profil BUMDes:", error);
    throw error;
  }
}

// Menyimpan/Mengupdate data Profil BUMDes
export async function updateBumdesProfile(data: Partial<BumdesProfile>): Promise<void> {
  try {
    const ref = doc(db, COL_BUMDES_PROFILE, PROFILE_DOC_ID);
    // setDoc dengan merge: true akan menimpa field yang ada tanpa menghapus field lain
    await setDoc(ref, data, { merge: true });
  } catch (error) {
    console.error("Gagal menyimpan profil BUMDes:", error);
    throw error;
  }
}

// ==========================================
// 2. FUNGSI UNTUK UNIT USAHA BUMDES
// ==========================================

// Helper mapping data unit usaha
function mapBumdesUnit(d: any): BumdesUnit {
  const data = d.data();
  return {
    id: d.id,
    namaUnit: data.namaUnit || "",
    pengelola: data.pengelola || "",
    description: data.description || "",
    image: data.image || "",
    whatsapp: data.whatsapp || null,
    aktif: data.aktif !== undefined ? data.aktif : true, // Default true jika tidak ada
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
  };
}

// Mengambil semua Unit Usaha
export async function getAllBumdesUnits(): Promise<BumdesUnit[]> {
  try {
    const q = query(collection(db, COL_BUMDES_UNITS), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(mapBumdesUnit);
  } catch (error) {
    console.error("Gagal mengambil daftar unit usaha:", error);
    return [];
  }
}

// Mengambil satu Unit Usaha berdasarkan ID
export async function getBumdesUnitById(id: string): Promise<BumdesUnit | null> {
  try {
    const snap = await getDoc(doc(db, COL_BUMDES_UNITS, id));
    if (!snap.exists()) return null;
    return mapBumdesUnit(snap);
  } catch (error) {
    console.error("Gagal mengambil detail unit usaha:", error);
    return null;
  }
}

// Menambah Unit Usaha baru
export async function createBumdesUnit(data: Omit<BumdesUnit, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const ref = await addDoc(collection(db, COL_BUMDES_UNITS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    console.error("Gagal menambah unit usaha:", error);
    throw error;
  }
}

// Mengupdate Unit Usaha
export async function updateBumdesUnit(id: string, data: Partial<BumdesUnit>): Promise<void> {
  try {
    const updatePayload = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, COL_BUMDES_UNITS, id), updatePayload);
  } catch (error) {
    console.error("Gagal mengupdate unit usaha:", error);
    throw error;
  }
}

// Menghapus Unit Usaha
export async function deleteBumdesUnit(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COL_BUMDES_UNITS, id));
  } catch (error) {
    console.error("Gagal menghapus unit usaha:", error);
    throw error;
  }
}