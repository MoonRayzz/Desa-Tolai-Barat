"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  batasUtara: string;
  batasTimur: string;
  batasSelatan: string;
  batasBarat: string;
}

// ─── Konstanta Filter ───────────────────────────────────────────────────────
// Semakin kecil nilai ALPHA → semakin halus (tapi lebih lambat respon)
// 0.08 – 0.15 adalah sweet-spot untuk kompas yang stabil di atas meja
const SMOOTHING_ALPHA = 0.1;

/**
 * Menghitung selisih sudut terpendek antara dua heading (dalam derajat).
 * Mengatasi wrap-around 359° → 0°.
 */
function shortestAngleDelta(from: number, to: number): number {
  let delta = to - from;
  // Normalkan ke range [-180, 180]
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

export default function CompassWilayah({
  batasUtara,
  batasTimur,
  batasSelatan,
  batasBarat,
}: Props) {
  const [displayHeading, setDisplayHeading] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState("");

  // Ref untuk menyimpan state filter tanpa trigger re-render setiap frame
  const smoothedHeadingRef = useRef(0);
  const rawHeadingRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    let raw = 0;

    // iOS: webkitCompassHeading sudah absolut & akurat
    if (typeof (event as any).webkitCompassHeading === "number") {
      raw = (event as any).webkitCompassHeading;
    }
    // Android: gunakan alpha dari deviceorientationabsolute jika tersedia
    else if (event.alpha !== null && event.alpha !== undefined) {
      raw = (360 - event.alpha + 360) % 360;
    } else {
      return; // Data tidak valid, abaikan
    }

    rawHeadingRef.current = raw;
  };

  // ─── Loop Animasi Terpisah ─────────────────────────────────────────────────
  // Memisahkan "baca sensor" dari "update UI" agar filter bekerja konsisten
  // terlepas dari frekuensi event sensor.
  const startRenderLoop = () => {
    const loop = () => {
      if (rawHeadingRef.current !== null) {
        const raw = rawHeadingRef.current;
        const prev = smoothedHeadingRef.current;

        // Low-pass filter dengan penanganan wrap-around
        const delta = shortestAngleDelta(prev, raw);
        const next = (prev + SMOOTHING_ALPHA * delta + 360) % 360;

        smoothedHeadingRef.current = next;
        setDisplayHeading(next);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const stopRenderLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const requestPermission = async () => {
    // iOS 13+ butuh explicit permission request
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
          setIsTracking(true);
          startRenderLoop();
        } else {
          setError("Izin sensor kompas ditolak.");
        }
      } catch {
        setError("Gagal mengakses sensor kompas perangkat.");
      }
    } else {
      // Android: coba deviceorientationabsolute dulu (lebih akurat, referensi true north)
      // fallback ke deviceorientation biasa
      const hasAbsolute = "ondeviceorientationabsolute" in window;
      if (hasAbsolute) {
        window.addEventListener(
          "deviceorientationabsolute",
          handleOrientation as EventListener,
          true
        );
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
      setIsTracking(true);
      startRenderLoop();
    }
  };

  // ─── Preview animasi saat kompas belum diaktifkan ─────────────────────────
  useEffect(() => {
    if (!isTracking) {
      let h = 0;
      const interval = setInterval(() => {
        h = (h + 0.3) % 360;
        setDisplayHeading(h);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isTracking]);

  // ─── Cleanup saat unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopRenderLoop();
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation as EventListener,
        true
      );
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[550px] relative overflow-hidden">

      {/* Tombol Akses Sensor */}
      {!isTracking && (
        <div className="absolute z-20 flex flex-col items-center gap-4 bg-ocean-950/80 p-6 rounded-3xl backdrop-blur-md border border-ocean-700/50 shadow-2xl">
          <div className="text-gold-400 text-4xl animate-bounce">🧭</div>
          <p className="text-ocean-100 text-sm text-center max-w-xs">
            Website ini dapat menggunakan sensor HP Anda untuk menunjukkan arah
            wilayah desa secara real-time.
          </p>
          <button
            onClick={requestPermission}
            className="bg-gold-500 hover:bg-gold-400 text-gold-950 font-bold py-3 px-6 rounded-xl transition-all"
          >
            Aktifkan Kompas Pintar
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}

      {/* Kompas Utama */}
      <div
        className="relative w-[220px] h-[220px] md:w-[280px] md:h-[280px] rounded-full border-4 border-gold-500/40 shadow-[0_0_50px_rgba(212,160,23,0.15)] flex items-center justify-center"
        style={{
          transform: `rotate(${-displayHeading}deg)`,
          // CSS transition DIMATIKAN — animasi dihandle sepenuhnya oleh RAF + filter
          // agar tidak ada double-smoothing yang menyebabkan lag atau overshoot
          transition: "none",
        }}
      >
        {/* Lingkaran Dalam */}
        <div className="absolute inset-2 border-2 border-dashed border-ocean-400/30 rounded-full animate-[spin_60s_linear_infinite_reverse]" />

        {/* Jarum Pusat */}
        <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center shadow-lg border-4 border-ocean-900 z-10">
          <div className="w-3 h-3 bg-ocean-900 rounded-full" />
        </div>

        {/* ── UTARA ── */}
        <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 flex flex-col items-center justify-end w-48 h-[120px]">
          <div
            className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center shadow-xl w-full"
            style={{ transform: `rotate(${displayHeading}deg)`, transition: "none" }}
          >
            <span className="block text-gold-400 font-bold text-[10px] uppercase tracking-widest mb-1">
              🌊 Utara
            </span>
            <span className="text-white text-xs font-medium leading-tight">{batasUtara}</span>
          </div>
          <div className="text-gold-500 font-display font-bold text-2xl mt-2 mb-1">U</div>
        </div>

        {/* ── TIMUR ── */}
        <div className="absolute top-1/2 -right-[110px] md:-right-[140px] -translate-y-1/2 flex items-center w-[160px] h-32">
          <div className="text-gold-500 font-display font-bold text-2xl mr-3">T</div>
          <div
            className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center shadow-xl w-full"
            style={{ transform: `rotate(${displayHeading}deg)`, transition: "none" }}
          >
            <span className="block text-gold-400 font-bold text-[10px] uppercase tracking-widest mb-1">
              🌅 Timur
            </span>
            <span className="text-white text-xs font-medium leading-tight">{batasTimur}</span>
          </div>
        </div>

        {/* ── SELATAN ── */}
        <div className="absolute -bottom-[100px] left-1/2 -translate-x-1/2 flex flex-col items-center justify-start w-48 h-[120px]">
          <div className="text-gold-500 font-display font-bold text-2xl mb-2 mt-1">S</div>
          <div
            className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center shadow-xl w-full"
            style={{ transform: `rotate(${displayHeading}deg)`, transition: "none" }}
          >
            <span className="block text-gold-400 font-bold text-[10px] uppercase tracking-widest mb-1">
              ⛰️ Selatan
            </span>
            <span className="text-white text-xs font-medium leading-tight">{batasSelatan}</span>
          </div>
        </div>

        {/* ── BARAT ── */}
        <div className="absolute top-1/2 -left-[110px] md:-left-[140px] -translate-y-1/2 flex items-center flex-row-reverse w-[160px] h-32">
          <div className="text-gold-500 font-display font-bold text-2xl ml-3">B</div>
          <div
            className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center shadow-xl w-full"
            style={{ transform: `rotate(${displayHeading}deg)`, transition: "none" }}
          >
            <span className="block text-gold-400 font-bold text-[10px] uppercase tracking-widest mb-1">
              🌴 Barat
            </span>
            <span className="text-white text-xs font-medium leading-tight">{batasBarat}</span>
          </div>
        </div>
      </div>
    </div>
  );
}