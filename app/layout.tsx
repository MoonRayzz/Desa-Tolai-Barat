// File: app/layout.tsx
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

export const viewport: Viewport = {
  themeColor: "#0B5E6B",
  width: "device-width",
  initialScale: 1,
  // maximumScale dihapus → user bebas zoom (WCAG 1.4.4 Resize Text)
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://desa-tolai-barat.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:  "Desa Tolai Barat — Kec. Torue, Parigi Moutong",
    template: "%s | Desa Tolai Barat",
  },
  description:
    "Website resmi Desa Tolai Barat, Kecamatan Torue, Kabupaten Parigi Moutong, " +
    "Sulawesi Tengah. Informasi desa, wisata Pantai Arjuna, UMKM, dan layanan warga.",
  keywords: [
    "Desa Tolai Barat", "Torue", "Parigi Moutong",
    "Sulawesi Tengah", "Pantai Arjuna", "Desa Digital"
  ],
  authors: [{ name: "Pemerintah Desa Tolai Barat" }],
  
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Desa Tolai Barat",
    title: "Website Resmi Desa Tolai Barat — Pesisir Teluk Tomini",
    description:
      "Portal informasi resmi Desa Tolai Barat, Kecamatan Torue, Parigi Moutong, Sulawesi Tengah. " +
      "Berita desa, wisata Pantai Arjuna, UMKM, dan layanan warga.",
    url: "/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Desa Tolai Barat — Pesisir Teluk Tomini, Sulawesi Tengah",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Website Resmi Desa Tolai Barat — Pesisir Teluk Tomini",
    description:
      "Portal informasi resmi Desa Tolai Barat, Kecamatan Torue, Parigi Moutong, Sulawesi Tengah.",
    images: ["/og-image.jpg"],
  },

  verification: {
    google: "tGznE5rNerGCz4Ga_DVEk8bRQkBwY6QuR0v1A9XzaqM", 
  },

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
        <PWAInstallPrompt />
        {children}
      </body>
    </html>
  );
}