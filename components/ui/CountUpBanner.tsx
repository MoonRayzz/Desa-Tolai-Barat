// File: components/ui/CountUpBanner.tsx
"use client";

import { useState, useEffect, useRef } from 'react';

export default function CountUpBanner({ total }: { total: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const duration = 2500; 

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      setCount(Math.floor(easeProgress * total));

      if (progress < 1) requestAnimationFrame(animate);
      else setCount(total);
    };

    requestAnimationFrame(animate);
  }, [total, isVisible]);

  const formatRp = (num: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  return (
    <div ref={containerRef} className="relative isolate overflow-hidden bg-ocean-950 rounded-[2.5rem] p-10 md:p-20 text-center shadow-2xl border border-white/10 w-full">
      
      {/* Background Animasi Aurora */}
      <div 
        className="absolute top-0 -left-20 w-72 h-72 bg-gold-500/20 rounded-full mix-blend-screen filter blur-[80px] opacity-70"
        style={{ animation: "float-slow 8s infinite alternate ease-in-out" }}
      ></div>
      <div 
        className="absolute -bottom-20 -right-20 w-80 h-80 bg-yellow-400/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70"
        style={{ animation: "float-slow 10s infinite alternate-reverse ease-in-out" }}
      ></div>
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}
      ></div>

      {/* Konten Utama */}
      <div className="relative z-10">
        <h2 className="text-gold-400 font-bold uppercase tracking-[0.2em] text-xs md:text-sm mb-6 drop-shadow-sm">
          Total Nilai Produksi Komoditas Utama
        </h2>
        
        {/* PERBAIKAN: Menambahkan px-4 dan py-2 agar ujung font tidak terpotong oleh bg-clip-text */}
        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-gold-400 to-yellow-600 drop-shadow-lg tabular-nums tracking-tight mb-8 px-4 py-2">
          {formatRp(count)}
        </div>
        
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mb-8 opacity-50 rounded-full"></div>

        <p className="text-ocean-200 font-medium max-w-2xl mx-auto text-sm md:text-base leading-relaxed drop-shadow-sm">
          Estimasi perputaran uang per tahun dari hasil bumi dan laut Desa Tolai Barat. Membuka peluang besar bagi investor, kemitraan BUMDes, dan pengembangan hilirisasi produk.
        </p>
      </div>

      <style>{`
        @keyframes float-slow {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
          100% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}