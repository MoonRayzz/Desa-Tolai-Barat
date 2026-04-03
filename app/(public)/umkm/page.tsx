// File: app/(public)/umkm/page.tsx

import { getAllUmkm } from "@/lib/firebase/umkm";
import UmkmClient from "./UmkmClient";

// Mematikan cache agar data UMKM langsung LIVE saat diupdate Admin
export const dynamic = "force-dynamic";

export default async function UmkmPage() {
  // Hanya mengambil data asli dari Firebase
  const list = await getAllUmkm();
  
  return <UmkmClient initialData={list} />;
}