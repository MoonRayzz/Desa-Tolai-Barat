// File: lib/firebase/potensi.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import type { PotensiDesa } from "@/types";

const COL = "potensi_desa";

export async function getAllPotensi(): Promise<PotensiDesa[]> {
  try {
    const snap = await getDocs(query(collection(db, COL), orderBy("nama", "asc")));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        nama: data.nama || "",
        kategori: data.kategori || "mikro",
        sektor: data.sektor || "pertanian",
        deskripsi: data.deskripsi || "",
        metrik: data.metrik || "",
        nilaiEkonomi: Number(data.nilaiEkonomi) || 0, // <-- TAMBAHKAN INI
        image: data.image || "",
        kontakName: data.kontakName || "",
        whatsapp: data.whatsapp || "",
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
      } as PotensiDesa;
    });
  } catch { return []; }
}

export async function createPotensi(data: Omit<PotensiDesa, "id">) {
  return await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updatePotensi(id: string, data: Partial<PotensiDesa>) {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deletePotensi(id: string) {
  await deleteDoc(doc(db, COL, id));
}   