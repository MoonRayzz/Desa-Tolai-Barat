// File: app/(public)/wisata/page.tsx

import { getAllWisata } from "@/lib/firebase/wisata";
import WisataClient from "./WisataClient";

// Mematikan cache agar data wisata langsung LIVE saat diupdate Admin
export const dynamic = "force-dynamic";

export default async function WisataPage() {
  // Hanya mengambil data asli dari Firebase
  const list = await getAllWisata();
  
  return <WisataClient initialData={list} />;
}