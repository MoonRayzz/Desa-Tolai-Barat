import {
  collection, getDocs, addDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "./config";

export interface GaleriItem {
  id:          string;
  /** Array of image URLs (multi-image support) */
  imageUrls:   string[];
  /** Index of the cover/thumbnail image within imageUrls (default 0) */
  coverIndex:  number;
  /** Legacy single URL — kept for backward compat */
  imageUrl?:   string;
  caption:     string;
  kategori:    string;
  createdAt:   string;
}

/** Returns all image URLs for a gallery item */
export function getGaleriImages(g: GaleriItem): string[] {
  if (g.imageUrls && g.imageUrls.length > 0) return g.imageUrls;
  if (g.imageUrl) return [g.imageUrl];
  return [];
}

/** Returns the cover/thumbnail URL for a gallery item */
export function getGaleriCover(g: GaleriItem): string {
  const imgs = getGaleriImages(g);
  if (imgs.length === 0) return "";
  const idx = typeof g.coverIndex === "number" ? g.coverIndex : 0;
  return imgs[Math.min(idx, imgs.length - 1)];
}

const COL = "galeri";

export async function getAllGaleri(): Promise<GaleriItem[]> {
  try {
    const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => {
      const raw = d.data();

      // Convert Firestore Timestamp → plain ISO string (avoids toJSON error in RSC→CC boundary)
      const createdAt: string =
        raw.createdAt?.toDate?.()?.toISOString?.() ??
        (typeof raw.createdAt === "string" ? raw.createdAt : "");

      // Normalize legacy documents that only have imageUrl
      const imageUrls: string[] =
        Array.isArray(raw.imageUrls) && raw.imageUrls.length > 0
          ? raw.imageUrls
          : raw.imageUrl
          ? [raw.imageUrl as string]
          : [];

      return {
        id:         d.id,
        imageUrls,
        coverIndex: typeof raw.coverIndex === "number" ? raw.coverIndex : 0,
        imageUrl:   raw.imageUrl  ?? "",
        caption:    raw.caption   ?? "",
        kategori:   raw.kategori  ?? "",
        createdAt,
      } as GaleriItem;
    });
  } catch { return []; }
}

export async function createGaleri(
  data: Omit<GaleriItem, "id" | "createdAt" | "imageUrl">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    coverIndex: data.coverIndex ?? 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update only the coverIndex of an existing album */
export async function updateGaleriCover(id: string, coverIndex: number): Promise<void> {
  await updateDoc(doc(db, COL, id), { coverIndex });
}

export async function deleteGaleri(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}