"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImgOpcional from "@/components/ImgOpcional";

type Linha = { nome: string; pontos: number; meu: boolean };

export default function Final() {
  const router = useRouter();
  const [pontos, setPontos] = useState<number | null>(null);
  const [ranking, setRanking] = useState<Linha[]>([]);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/state");
      if (r.status === 401) return router.replace("/");
      const s = await r.json();
      if (!s.finalizada) return router.replace("/mapa");
      setPontos(s.pontos);
      setRanking((await (await fetch("/api/ranking")).json()).ranking);
    })();
  }, [router]);

  if (pontos === null) return <p className="p-10 text-center">Carregando…</p>;

  return (
    <main className="relative flex min-h-screen flex-col items-center gap-6 overflow-hidden p-6 text-center">
      <h1 className="max-w-3xl font-pixel text-xl leading-loose">
        Parabéns, você ajudou o astronauta a chegar na estrela
      </h1>
      <p className="font-pixel text-2xl text-yellow-300">{pontos} pts</p>

      <div className="relative z-10 w-full max-w-md">
        <div className="painel p-4">
          <p className="mb-2 font-pixel text-xs">RANKING</p>
          <ol className="space-y-1 text-left">
            {ranking.map((r, i) => (
              <li key={i} className={`flex justify-between ${r.meu ? "font-bold text-yellow-300" : ""}`}>
                <span>{i + 1}. {r.nome}</span><span>{r.pontos}</span>
              </li>
            ))}
          </ol>
        </div>
        <Link href="/mapa" className="btn-pixel mt-5 text-xs">VOLTAR AO MAPA</Link>
      </div>

      <div className="pointer-events-none absolute -bottom-72 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-yellow-300 shadow-[0_0_80px_20px_rgba(253,224,71,0.5)]" />
      <ImgOpcional src="/img/astronauta.png" className="pointer-events-none absolute bottom-48 left-1/2 w-40 -translate-x-1/2" />
    </main>
  );
}
