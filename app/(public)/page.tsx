import type { Metadata } from "next";
import HeroSection    from "@/components/home/HeroSection";
import StatsSection   from "@/components/home/StatsSection";
import AgendaSection  from "@/components/home/AgendaSection";
import WisataSection  from "@/components/home/WisataSection";
import SurveiWidget   from "@/components/home/SurveiWidget";
import BeritaSection  from "@/components/home/BeritaSection";
import LayananSection from "@/components/home/LayananSection";
import MapSection     from "@/components/home/MapSection";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Website resmi Desa Tolai Barat — informasi desa, berita terkini, " +
    "wisata Pantai Arjuna, dan layanan warga.",
};

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
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