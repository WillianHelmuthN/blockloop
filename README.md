# Plataforma de Jogos de Habilidade — README (Draft)

> **Status:** r1 (refinado para clareza de produto). Este README agora explica melhor a proposta da plataforma para orientar também o design da Home.

---

## 1) Visão Geral do Produto

A **Plataforma de Jogos de Habilidade** é um ambiente on‑line onde usuários podem jogar jogos simples e divertidos que **dependem de habilidade**, não de sorte, para vencer. O objetivo é que os jogadores usem seus pontos (ou saldo) para disputar partidas e acumular recompensas, que futuramente poderão ser convertidas em dinheiro real.

Diferentemente de cassinos ou jogos de azar, aqui:

- O resultado depende exclusivamente da destreza do jogador.
- Há **transparência** nas regras de pontuação e prêmios.
- Existe uma **economia interna de pontos** que simula dinheiro, evoluindo depois para integração com pagamentos reais.

A plataforma será composta por:

- **Landing Page/Home:** Apresentação clara da proposta, call‑to‑action para jogar, ranking de jogadores e informações de segurança.
- **Área do Jogador:** saldo, histórico de partidas, resultados e regras.
- **Jogos Integrados:** cada jogo utiliza o mesmo saldo global de pontos.
- **Sistema de Afiliados:** influenciadores poderão divulgar links e receber comissão.
- **Pagamentos e Saques:** compra de pontos e cash‑out com segurança e compliance.

---

## 2) Objetivos do MVP

O primeiro passo é lançar rapidamente uma versão mínima para validar a proposta com usuários reais:

- Um jogo simples já existente em Next.js.
- Cadastro leve: usuário informa nome → recebe 100 pontos iniciais.
- Persistência de pontos em banco de dados, aplicável a toda a plataforma.
- Atualização do saldo ao final de cada partida.
- Tela de histórico e ranking básico (opcional mas recomendado).

A meta é coletar dados de engajamento para avaliar o potencial do produto antes de evoluir para pagamentos reais.

---

## 3) Escopo por Fases

### Fase 0 — MVP Técnico

- Landing mínima (branding + CTA).
- Onboarding guest com 100 pontos.
- Persistência de saldo e histórico.
- Estrutura de partida e cálculo de pontos no servidor.
- Painel simples do usuário.

### Fase 1 — Contas & Segurança

- Login real (e‑mail + magic link / OAuth).
- Migração de guest → conta.
- Servidor autoritativo de score (anti‑cheat).
- Ledger de pontos robusto e auditável.

### Fase 2 — Pagamentos & Economia Real

- Compra de pontos via PIX/cartão.
- Saques com revisão manual e KYC.
- Limites e reconciliação de pagamentos.

### Fase 3 — Afiliados & Crescimento

- Links de afiliado e atribuição.
- Dashboard para influenciadores.
- Materiais de campanha e tracking de conversão.

---

## 4) Arquitetura e Stack

- **Frontend:** Next.js + Tailwind + shadcn/ui.
- **Backend:** rotas /api (REST ou tRPC), PostgreSQL + Prisma.
- **Auth:** Auth.js com magic link.
- **Infra:** Vercel (frontend) + banco gerenciado (Supabase/Neon).
- **Cache:** Redis (para leaderboard e rate‑limit).

---

## 5) Experiência do Usuário (UX)

A plataforma deve transmitir **confiança** e **clareza** logo na Home:

- **Explicação simples:** “Jogue, mostre sua habilidade e ganhe pontos”.
- **Destaque para skill‑based:** deixar claro que não é jogo de azar.
- **Ranking:** mostrar top jogadores para estimular competição.
- **Botão Jogar Agora:** onboarding em 1 clique.
- **Transparência:** link para regras, termos e política anti‑fraude.

---

## 6) Roadmap Resumido

1. Onboarding guest + 100 pontos persistidos globalmente.
2. Sistema de partida + envio de score (server‑authoritative).
3. Painel do usuário + leaderboard.
4. Autenticação real e migração de contas.
5. Admin mínimo + auditoria.
6. Afiliados v0 (tracking + painel simples).
7. Pagamentos v0 (compra de pontos) → v1 (saques + KYC).

---

## 7) Perguntas em Aberto

- Modelo de monetização final (pay‑to‑play, patrocínios ou ambos).
- Regras de premiação e tabela de pontuação por jogo.
- Design visual da Home (hero, call‑to‑action, ranking).
- Política de prêmios e comunicação legal.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

---

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
```
