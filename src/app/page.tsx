import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[radial-gradient(circle_at_50%_0%,_rgba(14,165,233,0.08),transparent_70%)]">
      {/* Header */}
      <header className="w-full border-b border-black/5 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-black/30 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight">SkillPlay</div>
          <nav className="hidden md:flex gap-6 text-sm">
            <Link
              href="#como-funciona"
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Como funciona
            </Link>
            <Link
              href="#features"
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="#roadmap"
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Roadmap
            </Link>
            <Link
              href="/blackpool"
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Jogar
            </Link>
          </nav>
          <Link
            href="/blackpool"
            className="md:hidden text-sm font-medium px-3 py-1.5 border rounded-lg border-sky-500 text-sky-600 dark:text-sky-300"
          >
            Jogar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-20 gap-8">
        <h1 className="text-4xl md:text-5xl font-extrabold max-w-3xl leading-tight tracking-tight">
          Jogos de habilidade. Pontos reais. Competição justa.
        </h1>
        <p className="text-lg md:text-xl max-w-2xl text-black/70 dark:text-white/70">
          Uma plataforma onde o resultado depende da sua destreza, não da sorte.
          Entre, jogue a versão inicial e ajude a moldar a economia de pontos
          que evoluirá para recompensas reais.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/blackpool"
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-600/30 transition-colors"
          >
            Jogar Agora (MVP)
          </Link>
          <Link
            href="#roadmap"
            className="px-6 py-3 rounded-xl border border-black/10 dark:border-white/15 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300 font-medium transition-colors"
          >
            Ver Roadmap
          </Link>
        </div>
        <div className="text-xs uppercase tracking-wider font-medium text-black/60 dark:text-white/50">
          MVP em validação — partilhe feedback
        </div>
      </section>

      {/* Como funciona */}
      <section
        id="como-funciona"
        className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10"
      >
        <div className="md:col-span-3 mb-2">
          <h2 className="text-2xl font-bold mb-2">Como funciona</h2>
          <p className="text-sm text-black/70 dark:text-white/60 max-w-3xl">
            Você recebe pontos iniciais ao entrar. Jogue partidas de habilidade
            — seu desempenho ajusta seu saldo. No futuro: compra e saque de
            pontos, afiliados e ranking global duradouro.
          </p>
        </div>
        {[
          {
            title: "Skill‑Based",
            desc: "Sem azar: apenas reflexo, precisão e estratégia definem o resultado.",
          },
          {
            title: "Saldo Unificado",
            desc: "Um único saldo de pontos compartilhado entre todos os jogos integrados.",
          },
          {
            title: "Economia Evolutiva",
            desc: "Começa virtual. Depois: pagamentos reais, saques e programa de afiliados.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="p-5 rounded-xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur-sm shadow-sm flex flex-col gap-2"
          >
            <h3 className="font-semibold text-sky-700 dark:text-sky-300">
              {f.title}
            </h3>
            <p className="text-sm text-black/70 dark:text-white/60 leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Features rápidas */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Recursos do MVP</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            "Jogo de reflexo inicial (Block Loop)",
            "Persistência de melhor pontuação local",
            "UX responsiva e mobile‑friendly",
            "Base preparada para multi‑jogos",
            "Arquitetura escalável (hooks/lib/components)",
            "Planejamento para leaderboard e contas",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <span className="text-black/75 dark:text-white/70">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Roadmap resumido */}
      <section id="roadmap" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Roadmap</h2>
        <ol className="relative border-s border-black/10 dark:border-white/15 ml-3 pl-6 space-y-6">
          {(
            [
              { label: "Guest + saldo inicial", status: "done" },
              { label: "Estrutura de partidas + score cliente", status: "wip" },
              { label: "Leaderboard básico", status: "next" },
              { label: "Auth real (magic link)", status: "later" },
              { label: "Pagamentos & saques", status: "later" },
              { label: "Afiliados", status: "later" },
            ] as const
          ).map((step) => {
            const badgeClasses: Record<typeof step.status, string> = {
              done: "px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold tracking-wide",
              wip: "px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-semibold",
              next: "px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-300 text-[10px] font-semibold",
              later:
                "px-1.5 py-0.5 rounded bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold",
            };
            return (
              <li key={step.label} className="group">
                <div className="absolute -left-[9px] top-1.5 h-3 w-3 rounded-full border border-white/70 dark:border-black/40 bg-gradient-to-br from-sky-400 to-sky-600 shadow-sm"></div>
                <div className="font-medium text-sm flex items-center gap-2">
                  {step.label}
                  <span className={badgeClasses[step.status]}>
                    {step.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent to-sky-50 dark:to-sky-950/20 mt-auto">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Pronto para testar sua habilidade?
          </h2>
          <p className="text-base md:text-lg text-black/70 dark:text-white/60 max-w-2xl mx-auto">
            Entre agora no primeiro jogo e envie feedback para ajudar a
            priorizar os próximos recursos da plataforma.
          </p>
          <Link
            href="/blackpool"
            className="self-center px-8 py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/30 transition-colors"
          >
            Jogar Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-xs text-center py-6 border-t border-black/5 dark:border-white/10 mt-4">
        <p className="text-black/60 dark:text-white/50">
          &copy; {new Date().getFullYear()} SkillPlay — Plataforma de Jogos de
          Habilidade (MVP). Roadmap sujeito a mudança.
        </p>
      </footer>
    </div>
  );
}
