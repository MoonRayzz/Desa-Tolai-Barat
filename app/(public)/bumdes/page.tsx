// File: app/(public)/bumdes/page.tsx

import type { Metadata } from "next";
import { getBumdesProfile, getAllBumdesUnits } from "@/lib/firebase/bumdes";
import BumdesClient from "./BumdesClient";

// Pastikan data selalu diperbarui saat admin melakukan perubahan
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BUMDes",
  description: "Profil dan unit usaha Badan Usaha Milik Desa (BUMDes) Tolai Barat.",
};

export default async function BumdesPage() {
  const [profile, units] = await Promise.all([
    getBumdesProfile(),
    getAllBumdesUnits()
  ]);

  return <BumdesClient profile={profile} units={units} />;
}