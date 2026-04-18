import type { Metadata } from "next";
import HeroSection    from "@/components/home/HeroSection";
import StatsSection   from "@/components/home/StatsSection";
import AgendaSection  from "@/components/home/AgendaSection";
import WisataSection  from "@/components/home/WisataSection";
import SurveiWidget   from "@/components/home/SurveiWidget";
import BeritaSection  from "@/components/home/BeritaSection";
import LayananSection from "@/components/home/LayananSection";
import MapSection     from "@/components/home/MapSection";

const BASE_URL = "https://desa-tolai-barat.vercel.app";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Website resmi Desa Tolai Barat — informasi desa, berita terkini, " +
    "wisata Pantai Arjuna, dan layanan warga.",
};

const videoJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Desa Tolai Barat — Mewujudkan Desa PADI(Produktif, Aman, Damai, Indah)",
  description:
    "Video latar beranda website resmi Desa Tolai Barat yang menampilkan keindahan pesisir Teluk Tomini, kearifan lokal, dan kehidupan masyarakat desa.",
  thumbnailUrl: [`${BASE_URL}/og-image.jpg`],
  uploadDate: "2025-01-01T00:00:00+08:00",
  contentUrl: `${BASE_URL}/videos/hero-desa.mp4`,
  embedUrl: `${BASE_URL}/`,
  publisher: {
    "@type": "Organization",
    name: "Desa Tolai Barat",
    url: BASE_URL,
  },
};

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      {/* JSON-LD: VideoObject — agar Google bisa mengindeks video hero */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <HeroSection />
      <StatsSection />
      <AgendaSection />
      <WisataSection />
      <SurveiWidget />
      <BeritaSection />
      <LayananSection />
      <MapSection />
    </>
  );
}