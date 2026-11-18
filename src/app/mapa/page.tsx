"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImgOpcional from "@/components/ImgOpcional";

type Estado = "bloqueado" | "desbloqueado" | "concluido" | "indisponivel";
type Planeta = { slug: string; nome: string; cor: string; estado: Estado };
type Estatus = { equipe: string; finalizada: boolean; pontos: number; planetas: Planeta[] };
type Visual = "atual" | "aberto" | "bloqueado" | "concluido" | "indisponivel";

const ROTULO: Record<Estado, string> = {
  bloqueado: "Bloqueado",
  desbloqueado: "Em andamento",
  concluido: "Concluído",
  indisponivel: "Em breve",
};

// Trajeto em serpentina (% do mapa): começa embaixo à esquerda e sobe até o Sol.
const POS = [
  { x: 14, y: 80 }, { x: 47, y: 80 }, { x: 80, y: 80 },
  { x: 80, y: 50 }, { x: 47, y: 50 }, { x: 14, y: 50 },
  { x: 14, y: 20 }, { x: 47, y: 20 }, { x: 80, y: 20 },
];
const SOL = { x: 93, y: 7 };
const posDe = (i: number) => POS[Math.min(i, POS.length - 1)];

function PlanetaNo({ p, i, visual }: { p: Planeta; i: number; visual: Visual }) {
  const { x, y } = posDe(i);
  const apagado = visual === "bloqueado" || visual === "indisponivel";

  const classes =
    "group absolute z-10 w-[12%] -translate-x-1/2 -translate-y-1/2 animate-entrar";
  const estilo = { left: `${x}%`, top: `${y}%`, animationDelay: `${i * 90}ms` };

  const corpo = (
    <div className="relative transition-transform duration-300 group-hover:scale-110">
      {/* Planeta atual: ondas pulsantes e halo "respirando" */}
      {visual === "atual" && (
        <>
          <span
            className="absolute inset-0 animate-onda rounded-full border-2"
            style={{ borderColor: p.cor }}
          />
          <span
            className="absolute inset-0 animate-onda rounded-full border-2"
            style={{ borderColor: p.cor, animationDelay: "1.2s" }}
          />
          <span
            className="absolute -inset-[25%] animate-respirar rounded-full blur-xl"
            style={{ background: p.cor }}
          />
        </>
      )}
      {/* Concluído: halo verde fixo */}
      {visual === "concluido" && (
        <span className="absolute -inset-[18%] rounded-full bg-green-400 opacity-40 blur-lg" />
      )}

      <div className="animate-flutuar" style={{ animationDelay: `${i * 0.45}s` }}>
        <div
          className={[
            "relative aspect-square rounded-full transition-[filter,opacity] duration-500",
            apagado ? "opacity-70 brightness-[.55] grayscale" : "",
            visual === "concluido" ? "ring-4 ring-green-400/80" : "",
          ].join(" ")}
          style={{
            background: `radial-gradient(circle at 35% 30%, #fff8, ${p.cor} 55%, #000)`,
          }}
        >
          <ImgOpcional
            src={`/img/planetas/${p.slug}.png`}
            className="absolute inset-0 h-full w-full object-contain"
          />
          {visual === "bloqueado" && (
            <span className="absolute inset-0 grid place-items-center text-[clamp(14px,2vw,28px)]">
              🔒
            </span>
          )}
          {visual === "concluido" && (
            <span className="absolute right-0 top-0 rounded-full border-4 border-black bg-green-600 px-2 font-pixel text-sm">
              OK
            </span>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-center">
        <p className="font-pixel text-[clamp(8px,1vw,11px)]">Planeta {p.nome}</p>
        <p className="mt-1 text-[clamp(9px,0.9vw,12px)] text-white/70">{ROTULO[p.estado]}</p>
      </div>
    </div>
  );

  return p.estado === "indisponivel" ? (
    <div className={`${classes} opacity-40`} style={estilo}>
      {corpo}
    </div>
  ) : (
    <Link href={`/planeta/${p.slug}`} className={classes} style={estilo}>
      {corpo}
    </Link>
  );
}

function Astronauta({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="transicao-astro pointer-events-none absolute z-20 w-[8%] -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-[2400ms] ease-in-out"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="animate-astro drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]">
        <ImgOpcional src="/img/astronauta.png" className="h-auto w-full" />
      </div>
    </div>
  );
}

export default function Mapa() {
  const router = useRouter();
  const [s, setS] = useState<Estatus | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    fetch("/api/state", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) return router.replace("/");
        if (!r.ok) throw new Error("falha");
        setS(await r.json());
      })
      .catch(() => setErro(true));
  }, [router]);

  const info = useMemo(() => {
    const lista = s?.planetas ?? [];
    const n = lista.length;
    // Planeta atual: o primeiro em andamento; se não houver, o primeiro bloqueado.
    let atualIdx = lista.findIndex((p) => p.estado === "desbloqueado");
    if (atualIdx === -1) atualIdx = lista.findIndex((p) => p.estado === "bloqueado");
    const final = Boolean(s?.finalizada);
    const alvo = atualIdx === -1 ? n : atualIdx;

    const nos = [...lista.map((_, i) => posDe(i)), SOL];
    const segmentos = nos.slice(0, -1).map((a, k) => {
      let tipo: "feito" | "fluxo" | "futuro" = "futuro";
      if (final) tipo = "feito";
      else if (k === alvo - 1) tipo = "fluxo";
      else if (lista[k]?.estado === "concluido") tipo = "feito";
      return { a, b: nos[k + 1], tipo };
    });

    const noSol = final || alvo >= n;
    const astro = noSol
      ? { x: SOL.x - 9, y: SOL.y + 11 }
      : { x: posDe(alvo).x - 8, y: posDe(alvo).y - 11 };

    return { lista, atualIdx, segmentos, astro };
  }, [s]);

  if (erro)
    return (
      <div className="mx-auto mt-24 max-w-sm rounded-xl bg-white/10 p-6 text-center backdrop-blur">
        <p className="mb-4">Não foi possível carregar o mapa.</p>
        <button onClick={() => location.reload()} className="btn-pixel text-sm">
          TENTAR DE NOVO
        </button>
      </div>
    );
  if (!s) return <p className="p-10 text-center">Carregando…</p>;

  const ativos = s.planetas.filter((p) => p.estado !== "indisponivel");
  const feitos = ativos.filter((p) => p.estado === "concluido").length;

  const visualDe = (p: Planeta, i: number): Visual =>
    p.estado === "indisponivel"
      ? "indisponivel"
      : p.estado === "concluido"
        ? "concluido"
        : i === info.atualIdx
          ? "atual"
          : p.estado === "desbloqueado"
            ? "aberto"
            : "bloqueado";

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3 font-pixel text-xs">
        <span>{s.equipe}</span>
        <span>
          {feitos}/{ativos.length} planetas · {s.pontos} pts
        </span>
      </header>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-amber-300 transition-[width] duration-1000"
          style={{ width: `${ativos.length ? (feitos / ativos.length) * 100 : 0}%` }}
        />
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10">
        {/* Sol */}
        <div
          className="absolute z-0 aspect-square w-[30%] -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${SOL.x}%`, top: `${SOL.y}%` }}
        >
          <div
            className={`h-full w-full animate-sol rounded-full transition-opacity duration-1000 ${
              s.finalizada ? "opacity-100" : "opacity-55"
            }`}
            style={{
              background:
                "radial-gradient(circle, #fff7c2 0%, #fbbf24 22%, #f97316 42%, rgba(249,115,22,0) 70%)",
            }}
          />
        </div>

        {/* Trilha */}
        <svg
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {info.segmentos.map((seg, k) => (
            <line
              key={k}
              x1={seg.a.x}
              y1={seg.a.y}
              x2={seg.b.x}
              y2={seg.b.y}
              className={`trilha-linha ${seg.tipo === "fluxo" ? "animate-fluxo" : ""}`}
              stroke={seg.tipo === "futuro" ? "rgba(255,255,255,0.25)" : "#fbbf24"}
              strokeWidth={seg.tipo === "futuro" ? 1.5 : 2.5}
              strokeLinecap="round"
              strokeDasharray={seg.tipo === "feito" ? undefined : "8 10"}
              opacity={seg.tipo === "feito" ? 0.9 : 1}
            />
          ))}
        </svg>

        {/* Planetas */}
        {info.lista.map((p, i) => (
          <PlanetaNo key={p.slug} p={p} i={i} visual={visualDe(p, i)} />
        ))}

        <Astronauta x={info.astro.x} y={info.astro.y} />

        {s.finalizada && (
          <Link
            href="/final"
            className="btn-pixel absolute bottom-4 left-1/2 z-30 -translate-x-1/2 animate-respirar text-sm"
          >
            CHEGAR AO SOL
          </Link>
        )}
      </div>
    </main>
  );
}
