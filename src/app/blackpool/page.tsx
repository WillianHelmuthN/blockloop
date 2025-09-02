"use client";

import React, { useEffect, useRef, useState } from "react";
import { clamp, randRange, tToXY, isHit } from "./lib/geometry";
import ZoneOverlay from "./components/ZoneOverlay";
import { usePersistentState } from "./hooks/usePersistentState";

type GameState = "idle" | "playing" | "gameover";

// utilitários movidos para ./lib/geometry

export default function Page() {
  // Dimensões do tabuleiro (responsivo simples)
  // Usar estado + efeito pós-mount evita mismatch entre SSR (sem window) e cliente.
  const [boardW, setBoardW] = useState(360); // largura lógica alvo
  const [boardH, setBoardH] = useState(360 * 0.66); // altura lógica alvo
  const [displayW, setDisplayW] = useState(360); // largura realmente usada após limites (ex: 92vw)
  const [displayH, setDisplayH] = useState(360 * 0.66);
  const outerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function compute() {
      const vw = Math.min(window.innerWidth, 900);
      const isMobile = vw < 600;
      const size = isMobile
        ? clamp(vw * 0.9, 320, 420)
        : clamp(vw * 0.6, 560, 680);
      setBoardW(size);
      setBoardH(size * 0.66);
      const limited = Math.min(size, window.innerWidth * 0.92);
      setDisplayW(limited);
      setDisplayH(limited * 0.66);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Estado do jogo
  const [state, setState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = usePersistentState<number>("blockloop_best", 0);

  // Posição escalar do bloco (t ∈ [0,1)), velocidade em voltas por segundo
  const [t, setT] = useState(0);
  const [speed, setSpeed] = useState(0.25); // v0
  const [zone, setZone] = useState<{ start: number; end: number }>({
    start: 0.1,
    end: 0.16,
  });

  const reqRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  // best score persistido por hook

  // Loop de animação
  useEffect(() => {
    function step(ts: number) {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // segundos
      lastTsRef.current = ts;

      if (state === "playing") {
        setT((prev) => (prev + speed * dt) % 1);
      }

      reqRef.current = requestAnimationFrame(step);
    }

    reqRef.current = requestAnimationFrame(step);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      reqRef.current = null;
      lastTsRef.current = null;
    };
  }, [state, speed]);

  // Pausar quando perde o foco, continuar ao voltar (não quebra o loop)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") {
        // só “pausa lógica”: não avança t porque state != playing
        // mas aqui manteremos state; alternativa seria salvar e pausar
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Input: clique/toque/Space
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function startGame() {
    setScore(0);
    setSpeed(0.25);
    randomizeZone();
    setT(Math.random()); // posição inicial aleatória
    setState("playing");
    boardRef.current?.focus();
  }

  function randomizeZone() {
    const len = randRange(0.06, 0.1); // ~6% a 10% do perímetro
    const start = Math.random();
    setZone({ start, end: (start + len) % 1 });
  }

  function onHit() {
    // aumentar score/velocidade, mover zona
    setScore((s) => s + 1);
    setSpeed((v) => clamp(v * 1.08, 0, 2.0));
    randomizeZone();
  }

  function onMiss() {
    setState("gameover");
    setBest((b) => Math.max(b, score));
  }

  function handleAction() {
    if (state === "idle") {
      startGame();
      return;
    }
    if (state === "playing") {
      if (isHit(t, zone.start, zone.end)) {
        onHit();
      } else {
        onMiss();
      }
      return;
    }
    if (state === "gameover") {
      setState("idle");
    }
  }

  // Render helpers
  const inset = 16;
  const blockSize = 14;
  const { x, y } = tToXY(t, boardW, boardH, inset);

  // Converter zona (t) para um segmento visual nas 4 arestas — simplificação:
  // Renderizamos a zona como um traço “fluorescente” no perímetro com CSS gradient
  // usando um pseudo elemento posicionando overlay + mask linear.
  const zoneLabel = `${Math.round(((zone.end - zone.start + 1) % 1) * 100)}%`;

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        padding: 16,
      }}
    >
      <div
        ref={outerRef}
        style={{ width: "100%", maxWidth: boardW, paddingInline: 0 }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Black Pool
        </h1>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => (state === "playing" ? onMiss() : startGame())}
            aria-label={state === "playing" ? "Desistir" : "Iniciar jogo"}
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: state === "playing" ? "#fee2e2" : "#e0f2fe",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {state === "playing"
              ? "Desistir"
              : state === "gameover"
              ? "Reiniciar"
              : "Iniciar"}
          </button>
          <div style={{ fontWeight: 600 }}>Score: {score}</div>
          <div style={{ opacity: 0.8 }}>Best: {best}</div>
          <div style={{ opacity: 0.8 }}>Velocidade: {speed.toFixed(2)} rps</div>
          <div style={{ opacity: 0.8 }}>Zona: {zoneLabel}</div>
        </div>

        <div
          ref={boardRef}
          tabIndex={0}
          role="button"
          aria-label="Área do jogo. Clique ou toque para jogar."
          // Usar Pointer Events evita contagem dupla (touch gera click sintetizado)
          onPointerDown={(e) => {
            if (!e.isPrimary) return;
            e.preventDefault();
            handleAction();
          }}
          style={{
            position: "relative",
            width: displayW,
            height: displayH,
            borderRadius: 16,
            border: "2px solid #0ea5e9",
            outline: "none",
            userSelect: "none",
            background:
              "radial-gradient(1000px 400px at 50% -200px, rgba(14,165,233,0.05), transparent)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08) inset",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {/* Trilha/perímetro (para dar contraste) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: inset,
              top: inset,
              right: inset,
              bottom: inset,
              borderRadius: 12,
              border: "6px solid rgba(2,6,23,0.1)",
            }}
          />

          {/* Zona de acerto — desenhada como glow ao longo do perímetro via múltiplos gradientes */}
          <ZoneOverlay w={displayW} h={displayH} inset={inset} zone={zone} />

          {/* Bloco */}
          <div
            style={{
              position: "absolute",
              width: blockSize,
              height: blockSize,
              borderRadius: 6,
              background: isHit(t, zone.start, zone.end)
                ? "#22c55e"
                : "#0ea5e9",
              transform: `translate(${x - blockSize / 2}px, ${
                y - blockSize / 2
              }px)`,
              boxShadow: "0 6px 18px rgba(14,165,233,0.35)",
              transition: "background 80ms linear",
            }}
          />

          {/* Instruções overlay */}
          {state !== "playing" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(to bottom, rgba(2,6,23,0.0), rgba(2,6,23,0.06))",
                textAlign: "center",
                padding: 24,
              }}
            >
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  {state === "idle"
                    ? "Clique/Toque ou pressione Space para iniciar"
                    : "Game Over"}
                </p>
                <p style={{ opacity: 0.8 }}>
                  Acerte quando o bloco passar pela zona destacada no perímetro.
                </p>
                {state === "gameover" && (
                  <p style={{ marginTop: 8 }}>
                    Score: {score} · Best: {best}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Dica: também funciona com a tecla <kbd>Space</kbd>.
        </p>
      </div>
    </main>
  );
}

// ZoneOverlay agora importado de components/ZoneOverlay
