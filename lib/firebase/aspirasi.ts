import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query,
} from "firebase/firestore";
import { db } from "./config";
import type { Aspirasi } from "@/types";

const COL = "aspirasi";

export async function getAllAspirasi(): Promise<Aspirasi[]> {
  try {
    const q    = query(collection(db, COL), orderBy("submittedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Aspirasi));
  } catch {
    return [];
  }
}

export async function createAspirasi(
  data: Omit<Aspirasi, "id" | "dibaca">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    dibaca: false,
  });
  return ref.id;
}

export async function markAsDibaca(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { dibaca: true });
}

export async function deleteAspirasi(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function getStatistikAspirasi(): Promise<{
  total: number;
  belumDibaca: number;
  perKategori: Record<string, number>;
}> {
  try {
    const list = await getAllAspirasi();
    const perKategori: Record<string, number> = {};
    list.forEach((a) => {
      perKategori[a.kategori] = (perKategori[a.kategori] || 0) + 1;
    });
    return {
      total:       list.length,
      belumDibaca: list.filter((a) => !a.dibaca).length,
      perKategori,
    };
  } catch {
    return { total: 0, belumDibaca: 0, perKategori: {} };
  }
}