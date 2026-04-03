import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import "./globals.css";

const playfair = Playfair_Display({
  subsets:  ["latin"],
  variable: "--font-playfair",
  weight:   ["400", "500", "600", "700"],
  display:  "swap",
});

const dmSans = DM_Sans({
  subsets:  ["latin"],
  variable: "--font-dm-sans",
  weight:   ["300", "400", "500", "600"],
  display:  "swap",
});

// PWA: Viewport & Warna Tema
export const viewport: Viewport = {
  themeColor: "#0B5E6B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// PWA: Tambahkan manifest dan konfigurasi Apple/iOS
export const metadata: Metadata = {
  title: {
    default:  "Desa Tolai Barat — Kec. Torue, Parigi Moutong",
    template: "%s | Desa Tolai Barat",
  },
  description:
    "Website resmi Desa Tolai Barat, Kecamatan Torue, Kabupaten Parigi Moutong, " +
    "Sulawesi Tengah. Informasi desa, wisata Pantai Arjuna, UMKM, dan layanan warga.",
  keywords: [
    "Desa Tolai Barat", "Torue", "Parigi Moutong",
    "Sulawesi Tengah", "Pantai Arjuna",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://web-desa-tolai-barat.vercel.app/"
  ),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tolai Barat",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${dmSans.variable}`}
      data-scroll-behavior="smooth"
    >
      <body style={{ fontFamily: "var(--font-sans)", backgroundColor: "white" }}>
        {/* Tombol Install PWA melayang */}
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  );
}