"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImgOpcional from "@/components/ImgOpcional";

type Estado = "bloqueado" | "desbloqueado" | "concluido" | "indisponivel";
type Planeta = { slug: string; nome: string; cor: string; estado: Estado };
type Estatus = { equipe: string; finalizada: boolean; pontos: number; planetas: Planeta[] };

const ROTULO: Record<Estado, string> = {
  bloqueado: "Bloqueado",
  desbloqueado: "Em andamento",
  concluido: "Concluído",
  indisponivel: "Em breve",
};

const PONTO = {
  planeta: { fx: 0.72, fy: 0.85 },
  base: { fx: 0.5, fy: 0.5 },
  sol: { fx: 0.12, fy: 0.75 },
};

// Textura equirretangular: duas cópias lado a lado deslizando = rotação contínua.
function Textura({ slug, atraso }: { slug: string; atraso: number }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <div className="absolute inset-0 overflow-hidden rounded-full">
      <div className="flex h-full w-[400%] animate-girar" style={{ animationDelay: `-${atraso}s` }}>
        {[0, 1].map((k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={k}
            src={`/img/planetas/${slug}.png`}
            alt=""
            onError={() => setOk(false)}
            className="h-full w-1/2 max-w-none object-cover"
          />
        ))}
      </div>
    </div>
  );
}

function PlanetaNo({
  p,
  i,
  registrar,
  aoPassar,
  aoClicar,
}: {
  p: Planeta;
  i: number;
  registrar: (slug: string, el: HTMLDivElement | null) => void;
  aoPassar: (slug: string | null) => void;
  aoClicar: (slug: string) => void;
}) {
  const bloqueado = p.estado === "bloqueado";
  const andamento = p.estado === "desbloqueado";
  const concluido = p.estado === "concluido";

  const classes = "group flex min-h-0 flex-col items-center justify-center animate-entrar";
  const estilo = { animationDelay: `${i * 90}ms` };

  const corpo = (
    <>
      <div
        ref={(el) => registrar(p.slug, el)}
        className="relative size-[min(17vh,13vw)] transition-transform duration-300 group-hover:scale-110"
      >
        {andamento && (
          <>
            <span
              className="absolute inset-0 animate-onda rounded-full border-[3px]"
              style={{ borderColor: p.cor }}
            />
            <span
              className="absolute inset-0 animate-onda rounded-full border-[3px]"
              style={{ borderColor: p.cor, animationDelay: "1.2s" }}
            />
            <span
              className="absolute -inset-[25%] animate-respirar rounded-full blur-2xl"
              style={{ background: p.cor }}
            />
          </>
        )}
        {concluido && (
          <span className="absolute -inset-[15%] rounded-full bg-green-400/25 blur-2xl" />
        )}

        <div className="h-full w-full animate-flutuar" style={{ animationDelay: `${i * 0.45}s` }}>
          <div
            className={[
              "relative h-full w-full overflow-hidden rounded-full transition-[filter] duration-500",
              bloqueado ? "brightness-50 grayscale" : "",
              concluido ? "ring-2 ring-green-300/30" : "",
            ].join(" ")}
            style={{ background: `radial-gradient(circle at 35% 30%, #fff8, ${p.cor} 55%, #000)` }}
          >
            <Textura slug={p.slug} atraso={i * 13} />
            {/* Sombreamento de esfera */}
            <span
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,0.8) 100%)",
                boxShadow: "inset -6px -8px 18px rgba(0,0,0,0.6)",
              }}
            />
          </div>
          {bloqueado && (
            <span className="absolute inset-0 grid place-items-center text-[clamp(20px,3vw,56px)]">
              🔒
            </span>
          )}
          {concluido && (
            <span className="absolute right-0 top-0 rounded-full border-2 border-black/50 bg-green-600/90 px-[0.6vw] font-pixel text-[clamp(10px,1.2vw,22px)]">
              OK
            </span>
          )}
        </div>
      </div>

      <div className="mt-[1.2vh] text-center">
        <p className="font-pixel text-[clamp(10px,1.2vw,22px)]">Planeta {p.nome}</p>
        <p
          className={`mt-1 text-[clamp(10px,1vw,18px)] ${
            andamento ? "font-semibold text-amber-300" : "text-white/70"
          }`}
        >
          {ROTULO[p.estado]}
        </p>
      </div>
    </>
  );

  return p.estado === "indisponivel" ? (
    <div className={`${classes} opacity-40 grayscale`} style={estilo}>
      {corpo}
    </div>
  ) : (
    <Link
      href={`/planeta/${p.slug}`}
      className={classes}
      style={estilo}
      onMouseEnter={() => aoPassar(p.slug)}
      onMouseLeave={() => aoPassar(null)}
      onFocus={() => aoPassar(p.slug)}
      onBlur={() => aoPassar(null)}
      onClick={() => aoClicar(p.slug)}
    >
      {corpo}
    </Link>
  );
}

export default function Mapa() {
  const router = useRouter();
  const [s, setS] = useState<Estatus | null>(null);
  const [erro, setErro] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [ultimo, setUltimo] = useState<string | null>(null);

  const raiz = useRef<HTMLElement>(null);
  const planetaEls = useRef<Record<string, HTMLDivElement | null>>({});
  const baseEl = useRef<HTMLSpanElement>(null);
  const solEl = useRef<HTMLDivElement>(null);

  const registrar = useCallback((slug: string, el: HTMLDivElement | null) => {
    planetaEls.current[slug] = el;
  }, []);

  const aoClicar = useCallback((slug: string) => {
    try {
      sessionStorage.setItem("trilha:alvo", slug);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      setUltimo(sessionStorage.getItem("trilha:alvo"));
    } catch {}
    fetch("/api/state", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) return router.replace("/");
        if (!r.ok) throw new Error("falha");
        setS(await r.json());
      })
      .catch(() => setErro(true));
  }, [router]);

  useEffect(() => {
    if (!s) return;
    const t = setTimeout(() => setPronto(true), 150);
    return () => clearTimeout(t);
  }, [s]);

  const emAndamento = s?.planetas.find((p) => p.estado === "desbloqueado")?.slug ?? null;
  const alvoUltimo =
    ultimo && s?.planetas.some((p) => p.slug === ultimo && p.estado !== "concluido" && p.estado !== "indisponivel")
      ? ultimo
      : null;

  const destino = !pronto
    ? "base"
    : s?.finalizada
      ? "sol"
      : (hover ?? emAndamento ?? alvoUltimo ?? "base");

  useLayoutEffect(() => {
    if (!s) return;
    const medir = () => {
      const area = raiz.current?.getBoundingClientRect();
      if (!area) return;
      let el: Element | null | undefined;
      let ponto = PONTO.base;
      if (destino === "sol") {
        el = solEl.current;
        ponto = PONTO.sol;
      } else if (destino === "base") {
        el = baseEl.current;
      } else {
        el = planetaEls.current[destino];
        ponto = PONTO.planeta;
      }
      const r = el?.getBoundingClientRect();
      if (!r) return;
      setPos({
        x: r.left - area.left + r.width * ponto.fx,
        y: r.top - area.top + r.height * ponto.fy,
      });
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [s, destino]);

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
  const n = ativos.length;
  const pct = !pronto ? 0 : s.finalizada ? 100 : n ? (feitos / n) * 100 : 0;

  return (
    <main ref={raiz} className="relative flex h-dvh flex-col overflow-hidden px-[2.5vw] py-[2vh]">
      <header className="mb-[1.5vh] flex shrink-0 flex-wrap items-center justify-between gap-3 font-pixel text-[clamp(12px,1.5vw,28px)]">
        <span>{s.equipe}</span>
        <span>
          {feitos}/{n} planetas · {s.pontos} pts
        </span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-3 place-items-center gap-x-[2vw]">
        {s.planetas.map((p, i) => (
          <PlanetaNo
            key={p.slug}
            p={p}
            i={i}
            registrar={registrar}
            aoPassar={setHover}
            aoClicar={aoClicar}
          />
        ))}
      </div>

      <div className="mt-[1.5vh] flex h-[clamp(90px,11vh,140px)] shrink-0 items-center gap-[3vw]">
        <div className="relative ml-[4vw] h-full flex-1">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/15" />
          <div
            className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-indigo-400 to-amber-300 transition-[width] duration-[2400ms] ease-in-out"
            style={{ width: `${pct}%` }}
          />
          {Array.from({ length: n }, (_, k) => (
            <span
              key={k}
              className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-1000 ${
                k + 1 <= feitos ? "bg-amber-300" : "bg-white/30"
              }`}
              style={{ left: `${((k + 1) / n) * 100}%` }}
            />
          ))}
          <span
            ref={baseEl}
            className="absolute left-0 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60 bg-white/20"
          />
          {s.finalizada && (
            <div className="absolute inset-0 z-20 grid place-items-center">
              <Link href="/final" className="btn-pixel animate-respirar text-sm">
                CHEGAR AO SOL
              </Link>
            </div>
          )}
        </div>

        <div ref={solEl} className="relative aspect-square h-[130%] shrink-0">
          <div
            className={`h-full w-full animate-sol rounded-full transition-opacity duration-1000 ${
              s.finalizada ? "opacity-100" : "opacity-50"
            }`}
            style={{
              background:
                "radial-gradient(circle, #fff7c2 0%, #fbbf24 22%, #f97316 42%, rgba(249,115,22,0) 70%)",
            }}
          />
        </div>
      </div>

      {pos && (
        <div
          className="transicao-astro pointer-events-none absolute z-30 w-[clamp(48px,5vw,96px)] -translate-x-1/2 -translate-y-full transition-[left,top] duration-[1800ms] ease-in-out"
          style={{ left: pos.x, top: pos.y }}
        >
          <div className="animate-flutuar drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]">
            <ImgOpcional src="/img/astronauta.png" className="h-auto w-full" />
          </div>
        </div>
      )}
    </main>
  );
}