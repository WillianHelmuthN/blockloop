"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Tipos
export interface UserProfile {
  name: string;
  points: number; // saldo global
  createdAt: string; // ISO
  lastUpdatedAt: string; // ISO
}

interface Ctx {
  user: UserProfile | null;
  loading: boolean;
  login: (name: string) => void; // cria usuário (se não existir) ou troca nome (mantendo saldo)
  addPoints: (delta: number, reason?: string) => void; // delta pode ser negativo
  setPoints: (value: number, reason?: string) => void;
  reset: () => void;
}

const UserPointsContext = createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = "skillplay_user_v1";
const INITIAL_POINTS = 100; // pontos iniciais ao primeiro login

export const UserPointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar de localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile;
        setUser(parsed);
      }
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((u: UserProfile | null) => {
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const login = useCallback(
    (name: string) => {
      setUser((prev) => {
        const trimmed = name.trim().slice(0, 40);
        if (!trimmed) return prev; // ignora
        if (prev == null) {
          const now = new Date().toISOString();
            const created: UserProfile = {
              name: trimmed,
              points: INITIAL_POINTS,
              createdAt: now,
              lastUpdatedAt: now,
            };
          persist(created);
          return created;
        }
        // troca nome mantendo saldo
        const updated: UserProfile = {
          ...prev,
          name: trimmed,
          lastUpdatedAt: new Date().toISOString(),
        };
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const addPoints = useCallback<Ctx["addPoints"]>((delta) => {
    if (!delta) return;
    setUser((prev) => {
      if (!prev) return prev;
      const next: UserProfile = {
        ...prev,
        points: Math.max(0, prev.points + delta),
        lastUpdatedAt: new Date().toISOString(),
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const setPoints = useCallback<Ctx["setPoints"]>((value) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: UserProfile = {
        ...prev,
        points: Math.max(0, value),
        lastUpdatedAt: new Date().toISOString(),
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const reset = useCallback(() => {
    setUser(null);
    persist(null);
  }, [persist]);

  const value = useMemo<Ctx>(() => ({ user, loading, login, addPoints, setPoints, reset }), [user, loading, login, addPoints, setPoints, reset]);

  return <UserPointsContext.Provider value={value}>{children}</UserPointsContext.Provider>;
};

export function useUserPoints() {
  const ctx = useContext(UserPointsContext);
  if (!ctx) throw new Error("useUserPoints deve ser usado dentro de UserPointsProvider");
  return ctx;
}

// Utilitário para jogos: registrar score -> converte score em pontos (estratégia simples MVP)
export function awardScorePoints(score: number): number {
  // Estratégia provisional: cada ponto de score vale 1 ponto global.
  // Futuro: escala não-linear, custo de entrada, etc.
  return Math.max(0, Math.floor(score));
}
