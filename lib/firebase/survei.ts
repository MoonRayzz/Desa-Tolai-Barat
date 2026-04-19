// File: lib/firebase/survei.ts
import {
  collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, where, increment
} from "firebase/firestore";
import { db } from "./config";
import type { Survei, JawabanSurvei, HasilPertanyaan } from "@/types";

const COL         = "survei";
const COL_JAWABAN = "survei_jawaban";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── READ ────────────────────────────────────────────────────────────────────

export async function getAllSurvei(): Promise<Survei[]> {
  try {
    const q    = query(collection(db, COL), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Survei));
  } catch {
    return [];
  }
}

export async function getAktifSurvei(): Promise<Survei[]> {
  try {
    const today = getTodayStr();
    const q     = query(
      collection(db, COL),
      where("aktif", "==", true),
      orderBy("startDate", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Survei))
      .filter((s) => {
        if (s.startDate > today) return false;
        if (s.endDate && s.endDate < today) return false;
        return true;
      });
  } catch {
    return [];
  }
}

export async function getSurveiById(id: string): Promise<Survei | null> {
  try {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Survei;
  } catch {
    return null;
  }
}

// ─── CREATE / UPDATE / DELETE ─────────────────────────────────────────────────

export async function createSurvei(
  data: Omit<Survei, "id" | "createdAt" | "totalResponden">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    totalResponden: 0,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateSurvei(
  id:   string,
  data: Partial<Omit<Survei, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data });
}

export async function deleteSurvei(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

// ─── JAWABAN ─────────────────────────────────────────────────────────────────

export async function submitJawaban(
  surveiId: string,
  jawaban:  Record<string, any>
): Promise<void> {
  await addDoc(collection(db, COL_JAWABAN), {
    surveiId,
    jawaban,
    submittedAt: new Date().toISOString(),
  });
  await updateDoc(doc(db, COL, surveiId), {
    totalResponden: increment(1),
  });
}

export async function getAllJawabanBySurvei(
  surveiId: string
): Promise<JawabanSurvei[]> {
  try {
    const q    = query(
      collection(db, COL_JAWABAN),
      where("surveiId", "==", surveiId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as JawabanSurvei));
  } catch {
    return [];
  }
}

export async function getHasilSurvei(surveiId: string): Promise<HasilPertanyaan[]> {
  const [survei, jawabanList] = await Promise.all([
    getSurveiById(surveiId),
    getAllJawabanBySurvei(surveiId),
  ]);
  if (!survei) return [];

  return survei.pertanyaan.map((p) => {
    const tipe = p.tipe || "pilihan_ganda"; // Backward compatibility untuk survei lama
    const countMap: Record<string, number> = {};
    const jawabanTeks: string[] = [];

    // Inisialisasi opsi untuk bar chart agar opsi yang tidak dipilih tetap tampil 0
    if (tipe === "pilihan_ganda" || tipe === "kotak_centang") {
      p.opsi.forEach((o) => { countMap[o] = 0; });
    } else if (tipe === "skala") {
      const max = p.skalaMax || 5;
      for (let i = 1; i <= max; i++) { countMap[i.toString()] = 0; }
    }

    // Hitung jawaban dari seluruh responden
    jawabanList.forEach((j) => {
      const jawabanUser = j.jawaban[p.id];
      if (jawabanUser !== undefined && jawabanUser !== null && jawabanUser !== "") {
        if (tipe === "paragraf") {
          jawabanTeks.push(jawabanUser.toString());
        } else if (tipe === "kotak_centang" && Array.isArray(jawabanUser)) {
          // Karena checkbox bisa lebih dari 1 pilihan
          jawabanUser.forEach(val => { countMap[val] = (countMap[val] || 0) + 1; });
        } else {
          countMap[jawabanUser.toString()] = (countMap[jawabanUser.toString()] || 0) + 1;
        }
      }
    });

    // Kalkulasi persentase dan total
    const totalJawaban = tipe === "paragraf" 
      ? jawabanTeks.length 
      : Object.values(countMap).reduce((a, b) => a + b, 0);

    return {
      pertanyaanId: p.id,
      teks: p.teks,
      tipe: tipe,
      totalJawaban,
      jawabanTeks: tipe === "paragraf" ? jawabanTeks : undefined,
      opsi: (tipe !== "paragraf") ? Object.keys(countMap).map((key) => ({
        teks: key,
        count: countMap[key] || 0,
        persen: totalJawaban > 0 ? Math.round(((countMap[key] || 0) / totalJawaban) * 100) : 0,
      })) : [],
    };
  });
}

// ─── ANTI-SPAM (localStorage helper — dipakai di client component) ─────────────

export const SURVEI_STORAGE_KEY = "tolai_sudah_isi_survei";

export function getSudahIsiList(): string[] {
  try {
    const raw = localStorage.getItem(SURVEI_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function sudahIsiSurvei(surveiId: string): boolean {
  return getSudahIsiList().includes(surveiId);
}

export function markSudahIsi(surveiId: string): void {
  try {
    const list = getSudahIsiList();
    if (!list.includes(surveiId)) {
      list.push(surveiId);
      localStorage.setItem(SURVEI_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {}
}