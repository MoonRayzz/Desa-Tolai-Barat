import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TrackPageView from "@/components/TrackPageView";
import PengumumanBanner from "@/components/home/PengumumanBanner";
import FCMPrompt from "@/components/shared/FCMPrompt";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TrackPageView />
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <PengumumanBanner />
        {children}
      </main>
      <Footer />
      <FCMPrompt />
    </>
  );
}