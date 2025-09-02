"use client";

import React, { useEffect, useRef, useState } from "react";
import { clamp, randRange, tToXY, isHit } from "./lib/geometry";
import ZoneOverlay from "./components/ZoneOverlay";
import { usePersistentState } from "./hooks/usePersistentState";
import { useUserPoints } from "../providers/UserPointsProvider";

type GameState = "idle" | "playing" | "paused" | "gameover";

// utilitários movidos para ./lib/geometry

export default function Page() {
  const { user, login, addPoints } = useUserPoints();

  // Aposta atual (valor colocado na partida) e estado
  const [stake, setStake] = useState<number>(10);
  const [currentStake, setCurrentStake] = useState<number | null>(null); // stake efetivo dessa rodada
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
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
    if (!user) return;
    const s = Math.min(stake, user.points);
    if (s <= 0) return;
    // debitar stake do saldo global
    addPoints(-s);
    setCurrentStake(s);
    setScore(0);
    setSpeed(0.25);
    randomizeZone();
    setT(Math.random()); // posição inicial aleatória
    setState("playing");
    setShowMilestoneModal(false);
    boardRef.current?.focus();
  }

  function randomizeZone() {
    const len = randRange(0.06, 0.1); // ~6% a 10% do perímetro
    const start = Math.random();
    setZone({ start, end: (start + len) % 1 });
  }

  function onHit() {
    setScore((prevScore) => {
      const newScore = prevScore + 1;
      // milestones a cada 10 até 40
      if (newScore % 10 === 0 && newScore <= 40) {
        // pausa para decidir cashout / continuar
        setState("paused");
        setShowMilestoneModal(true);
      }
      return newScore;
    });
    setSpeed((v) => clamp(v * 1.08, 0, 2.0));
    randomizeZone();
  }

  function onMiss() {
    setState("gameover");
    setBest((b) => Math.max(b, score));
    // Derrota: jogador perde stake (já debitada); não ganha nada.
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
    if (state === "paused") {
      // Ignora clique direto; o modal com botões decide.
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

  // Gate de login simples: se não há user, mostrar tela para inserir nome
  if (!user) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
          padding: 16,
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            Black Pool
          </h1>
          <p style={{ fontSize: 14, opacity: 0.75, marginBottom: 16 }}>
            Escolha um nome para começar. Você receberá{" "}
            <strong>100 pontos</strong> iniciais para jogar em toda a plataforma
            (MVP local).
          </p>
          <LoginForm onLogin={login} />
        </div>
      </main>
    );
  }

  // Cálculo do multiplicador (milestone atual)
  function multiplierFor(score: number): number | null {
    if (score < 10) return null;
    if (score === 10) return 1;
    if (score === 20) return 2;
    if (score === 30) return 5;
    if (score === 40) return 10;
    return null; // fora das faixas definidas
  }

  function canContinue(score: number) {
    return score < 40; // 40 é limite
  }

  function handleCashOut() {
    if (currentStake == null) return;
    const multi = multiplierFor(score);
    if (multi == null) return;
    const prize = currentStake * multi;
    addPoints(prize); // credita prêmio
    setState("gameover");
    setShowMilestoneModal(false);
    setBest((b) => Math.max(b, score));
  }

  function handleContinue() {
    if (!canContinue(score)) return;
    setShowMilestoneModal(false);
    setState("playing");
  }

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
          {/* Controle de stake (somente antes de iniciar) */}
          {state === "idle" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Stake:</label>
              <select
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontSize: 14
                }}
              >
                {Array.from(
                  { length: Math.min(15, Math.floor(user.points / 10)) },
                  (_, i) => (i + 1) * 10
                ).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => (state === "playing" ? onMiss() : startGame())}
            aria-label={
              state === "playing"
                ? "Desistir"
                : state === "gameover"
                ? "Reiniciar"
                : "Iniciar jogo"
            }
            disabled={
              state === "idle" && (user.points < 10 || stake > user.points)
            }
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              opacity:
                state === "idle" && (user.points < 10 || stake > user.points)
                  ? 0.5
                  : 1,
              cursor:
                state === "idle" && (user.points < 10 || stake > user.points)
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 600,
            }}
          >
            {state === "playing"
              ? "Desistir"
              : state === "gameover"
              ? "Reiniciar"
              : "Iniciar"}
          </button>
          <div style={{ fontWeight: 600 }}>Nível: {score}</div>
          <div style={{ fontWeight: 600 }}>Saldo: {user.points}</div>
          <div style={{ opacity: 0.8 }}>Jogador: {user.name}</div>
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
          {state !== "playing" && !showMilestoneModal && (
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
                    ? "Escolha a stake e clique para iniciar"
                    : state === "paused"
                    ? "Pausado"
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
                {state === "idle" && (
                  <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    Stake define o potencial de prêmio nos níveis 10/20/30/40.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Modal de Milestone */}
          {showMilestoneModal && currentStake != null && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
              }}
              role="dialog"
              aria-modal="true"
            >
              <div
                style={{
                  background: "white",
                  color: "#0f172a",
                  padding: 24,
                  borderRadius: 16,
                  width: "100%",
                  maxWidth: 380,
                  boxShadow: "0 10px 40px -5px rgba(0,0,0,0.25)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Nível {score} alcançado!
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.4 }}>
                  Multiplicador disponível:{" "}
                  <strong>{multiplierFor(score)}x</strong>
                  {score === 40 && " (limite máximo)"}
                </p>
                <p style={{ fontSize: 13, opacity: 0.75 }}>
                  Stake inicial: {currentStake} · Prêmio potencial:{" "}
                  {currentStake * (multiplierFor(score) || 0)}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={handleCashOut}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #059669",
                      background: "#10b981",
                      color: "white",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Sacar {multiplierFor(score)}x
                  </button>
                  {canContinue(score) && (
                    <button
                      onClick={handleContinue}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid #0369a1",
                        background: "#0ea5e9",
                        color: "white",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Continuar
                    </button>
                  )}
                </div>
                {!canContinue(score) && (
                  <p
                    style={{ fontSize: 12, opacity: 0.7, textAlign: "center" }}
                  >
                    Você atingiu o limite máximo. Saque para finalizar.
                  </p>
                )}
                {score > 10 && canContinue(score) && (
                  <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                    Atenção: se errar antes do próximo nível você perde a stake.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Dica: também funciona com a tecla <kbd>Space</kbd>. Cashout nos níveis
          10 · 20 · 30 · 40.
        </p>
      </div>
    </main>
  );
}

// ZoneOverlay agora importado de components/ZoneOverlay

// Formulário inline para escolher nome
function LoginForm({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = name.trim().length >= 3;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!valid) return;
        onLogin(name.trim());
      }}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
          Nome do jogador
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Ex: AstroPlayer"
          maxLength={40}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            fontSize: 14,
            outline: "none",
          }}
        />
      </label>
      {touched && !valid && (
        <div style={{ fontSize: 12, color: "#dc2626" }}>
          Use pelo menos 3 caracteres.
        </div>
      )}
      <button
        type="submit"
        disabled={!valid}
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          background: valid ? "#0ea5e9" : "#7dd3fc",
          color: "white",
          fontWeight: 600,
          cursor: valid ? "pointer" : "not-allowed",
        }}
      >
        Entrar
      </button>
    </form>
  );
}
