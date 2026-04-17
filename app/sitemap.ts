// File: app/sitemap.ts

import type { MetadataRoute } from "next";
import { getBeritaPublished } from "@/lib/firebase/berita";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://desa-tolai-barat.vercel.app";
  const baseUrl = rawBaseUrl.replace(/\/$/, "");

  // Daftar halaman statis utama
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`,            lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/profil`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/berita`,     lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${baseUrl}/wisata`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/potensi`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${baseUrl}/galeri`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${baseUrl}/layanan`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/agenda`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${baseUrl}/bumdes`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/survei`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  let beritaPages: MetadataRoute.Sitemap = [];
  
  try {
    const beritaList = await getBeritaPublished(100);
    beritaPages = beritaList.map((b) => ({
      url: `${baseUrl}/berita/${b.slug}`,
      lastModified: b.publishedAt ? new Date(b.publishedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Gagal generate sitemap berita:", error);
  }

  return [...staticPages, ...beritaPages];
}