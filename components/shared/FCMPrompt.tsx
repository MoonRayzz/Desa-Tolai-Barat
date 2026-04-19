// File: components/shared/FCMPrompt.tsx
"use client";

import { useState, useEffect } from "react";
import { requestFCMToken } from "@/lib/firebase/messaging";

export default function FCMPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cek apakah browser mendukung notifikasi
    if (!('Notification' in window)) return;
    
    // Jangan tampilkan jika sudah diizinkan atau ditolak permanen
    if (Notification.permission === "granted" || Notification.permission === "denied") return;

    // Cek session/local storage agar tidak terlalu mengganggu
    const promptDismissed = localStorage.getItem("fcm_prompt_dismissed");
    if (promptDismissed) return;

    // Delay sedikit agar tidak mengagetkan user saat pertama buka web
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  async function handleAllow() {
    setLoading(true);
    const token = await requestFCMToken();
    if (token) {
      // Sukses
      setShow(false);
    } else {
      // Gagal atau ditolak, kita simpan status agar tidak nanya terus
      localStorage.setItem("fcm_prompt_dismissed", "true");
      setShow(false);
    }
    setLoading(false);
  }

  function handleDismiss() {
    localStorage.setItem("fcm_prompt_dismissed", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white p-5 rounded-2xl shadow-xl border border-ocean-100 z-[60] flex flex-col gap-3"
      style={{ animation: "fadeInUp 0.5s ease-out" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-xl flex-shrink-0">
          🔔
        </div>
        <div>
          <h4 className="font-bold text-ocean-900 text-sm">Nyalakan Notifikasi</h4>
          <p className="text-xs text-ocean-600 mt-1">Dapatkan update pengumuman penting & survei desa Tolai Barat langsung di perangkat Anda.</p>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button 
          onClick={handleDismiss} 
          disabled={loading}
          className="flex-1 py-2 text-xs font-bold text-ocean-500 bg-ocean-50 rounded-lg hover:bg-ocean-100 transition-colors"
        >
          Nanti Saja
        </button>
        <button 
          onClick={handleAllow} 
          disabled={loading}
          className="flex-1 py-2 text-xs font-bold text-white bg-ocean-600 rounded-lg hover:bg-ocean-700 transition-colors"
        >
          {loading ? "Memproses..." : "Izinkan"}
        </button>
      </div>
    </div>
  );
}
