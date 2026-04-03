import { getAllGaleri } from "@/lib/firebase/galeri";
import GaleriClient from "./GaleriClient";

export const revalidate = 60;

export default async function GaleriPage() {
  const list = await getAllGaleri();
  return <GaleriClient initialData={list} />;
}