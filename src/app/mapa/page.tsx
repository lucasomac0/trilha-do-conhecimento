"use client";
import { useEffect, useState } from "react";
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

export default function Mapa() {
  const router = useRouter();
  const [s, setS] = useState<Estatus | null>(null);

  useEffect(() => {
    fetch("/api/state").then(async (r) => {
      if (r.status === 401) return router.replace("/");
      setS(await r.json());
    });
  }, [router]);

  if (!s) return <p className="p-10 text-center">Carregando…</p>;
  const ativos = s.planetas.filter((p) => p.estado !== "indisponivel");
  const feitos = ativos.filter((p) => p.estado === "concluido").length;

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 font-pixel text-xs">
        <span>{s.equipe}</span>
        <span>{feitos}/{ativos.length} planetas · {s.pontos} pts</span>
      </header>

      <div className="grid grid-cols-3 gap-x-4 gap-y-8">
        {s.planetas.map((p) => {
          const corpo = (
            <div className={`flex flex-col items-center gap-2 ${p.estado === "indisponivel" ? "opacity-30 grayscale" : ""}`}>
              <div
                className="relative aspect-square w-full max-w-44 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.9)]"
                style={{ background: `radial-gradient(circle at 35% 30%, #fff8, ${p.cor} 55%, #000)` }}
              >
                <ImgOpcional src={`/img/planetas/${p.slug}.png`} className="absolute inset-0 h-full w-full object-contain" />
                {p.estado === "concluido" && (
                  <span className="absolute right-0 top-0 rounded-full border-4 border-black bg-green-600 px-2 font-pixel text-sm">OK</span>
                )}
              </div>
              <span className="font-pixel text-[10px]">Planeta {p.nome}</span>
              <span className="text-xs text-white/70">{ROTULO[p.estado]}</span>
            </div>
          );
          return p.estado === "indisponivel" ? (
            <div key={p.slug}>{corpo}</div>
          ) : (
            <Link key={p.slug} href={`/planeta/${p.slug}`} className="transition-transform hover:scale-105">
              {corpo}
            </Link>
          );
        })}
      </div>

      {s.finalizada && (
        <div className="mt-10 text-center">
          <Link href="/final" className="btn-pixel text-sm">CHEGAR AO SOL</Link>
        </div>
      )}
      <ImgOpcional src="/img/astronauta.png" className="pointer-events-none fixed bottom-0 left-0 w-32" />
    </main>
  );
}
