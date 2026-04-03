"use client";

import { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable]   = useState(false);
  const [isInstalled, setIsInstalled]       = useState(false);
  const [isMinimized, setIsMinimized]       = useState(false);

  useEffect(() => {
    // 1. Daftarkan Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("PWA Service Worker terdaftar!", reg.scope))
        .catch((err) => console.error("PWA Service Worker gagal:", err));
    }

    // 2. Deteksi apakah sudah diinstal (Standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // 3. Tangkap event install dari browser
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      // AUTO-MINIMIZE: Sembunyikan teks setelah 6 detik agar tidak mengganggu
      setTimeout(() => {
        setIsMinimized(true);
      }, 6000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Deteksi jika sukses diinstal
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setIsInstalled(true);
      console.log("PWA Berhasil diinstal!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!isInstallable || isInstalled) return null;

  const handleMainClick = async () => {
    // Jika sedang dalam mode ikon saja, klik pertama akan membuka (expand)
    if (isMinimized) {
      setIsMinimized(false);
      return;
    }

    // Jika sedang terbuka, klik akan memicu proses instal
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div style={{
      position: "fixed", 
      bottom: "24px", 
      right: "24px", // Pindah ke kanan
      zIndex: 9999,
      animation: "fadeUp 0.5s ease-out forwards",
    }}>
      <button
        onClick={handleMainClick}
        style={{
          display: "flex", 
          alignItems: "center", 
          gap: isMinimized ? "0px" : "10px",
          background: "var(--color-ocean-900)", 
          color: "white",
          padding: isMinimized ? "12px" : "12px 20px", 
          borderRadius: isMinimized ? "50%" : "16px", // Jadi bulat kalau minimize
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)", 
          border: "none", 
          cursor: "pointer",
          fontWeight: 600, 
          fontSize: "0.875rem", 
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          width: isMinimized ? "50px" : "auto",
          height: isMinimized ? "50px" : "auto",
          justifyContent: "center",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ 
          fontSize: "1.2rem",
          transition: "transform 0.3s"
        }}>
          📱
        </span>
        
        <span style={{ 
          opacity: isMinimized ? 0 : 1,
          maxWidth: isMinimized ? "0px" : "200px",
          transition: "all 0.3s",
          pointerEvents: isMinimized ? "none" : "auto"
        }}>
          Install Aplikasi Desa
        </span>
      </button>

      {/* Tombol Close kecil jika user ingin minimize manual */}
      {!isMinimized && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(true);
          }}
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            background: "#ef4444",
            color: "white",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            cursor: "pointer",
            border: "2px solid white",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }}
        >
          ✕
        </div>
      )}
    </div>
  );
}