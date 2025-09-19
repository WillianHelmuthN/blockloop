"use client";

import Link from "next/link";
import React from "react";

export function HeroVideo() {
  return (
    <section
      aria-label="Hero principal com vídeo"
      className="relative h-[70vh] min-h-[480px] w-full overflow-hidden flex items-center justify-center"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/video_home_hero_top.mp4"
        autoPlay
        playsInline
        muted
        loop
        preload="metadata"
      />
      {/* Camadas de escurecimento e efeito */}
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col gap-6">
        <h1 className="neon-title leading-tight">
          Domine o Loop. Ganhe Pontos. Mostre sua Habilidade.
        </h1>
        <p className="text-xl md:text-4xl text-white/80 max-w-2xl mx-auto">
          Não é sorte. É habilidade. E quem tem coragem, ganha de verdade.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/blackpool"
            className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/30 transition-colors"
          >
            Jogar Agora (MVP)
          </Link>
          <Link
            href="#roadmap"
            className="px-7 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium border border-white/20 backdrop-blur-sm transition-colors"
          >
            Ver Roadmap
          </Link>
        </div>
        <div className="text-[11px] uppercase tracking-wider font-medium text-white/50">
          MVP em validação — partilhe feedback
        </div>
      </div>
    </section>
  );
}

export default HeroVideo;
