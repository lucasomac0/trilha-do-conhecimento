"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImgOpcional from "@/components/ImgOpcional";
import { Confete, Numero } from "@/components/Efeitos";

type Linha = { nome: string; pontos: number; meu: boolean };

const MEDALHA = ["🥇", "🥈", "🥉"];

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
    <main className="relative flex min-h-dvh flex-col overflow-hidden px-[4vw] py-[4vh]">
      {/* Clarão e confete quando o astronauta pousa */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 animate-piscar bg-yellow-200/50"
        style={{ animationDelay: "2.5s" }}
      />
      <Confete n={50} atraso={2.5} repetir />

      <div className="relative z-10 grid flex-1 items-center gap-[4vw] pb-[14rem] lg:grid-cols-2">
        <div className="text-center">
          <h1 className="animate-pop font-pixel text-[clamp(20px,2.8vw,50px)] leading-snug">
            Parabéns, você ajudou o astronauta a chegar na estrela!
          </h1>
          <p className="mt-[4vh] font-pixel text-[clamp(12px,1.4vw,24px)] text-white/80">PONTUAÇÃO FINAL</p>
          <Numero
            alvo={pontos}
            ms={1800}
            atraso={2600}
            sufixo=" pts"
            className="font-pixel text-[clamp(44px,8vw,150px)] text-yellow-300"
            style={{ textShadow: "0 0 40px rgba(253,224,71,0.8)" }}
          />
          <div className="mt-[4vh]">
            <Link href="/mapa" className="btn-pixel text-[clamp(12px,1.2vw,20px)]">VOLTAR AO MAPA</Link>
          </div>
        </div>

        <div className="painel animate-surgir p-[2vw]" style={{ animationDelay: "0.6s" }}>
          <p className="mb-3 text-center font-pixel text-[clamp(14px,1.6vw,28px)]">RANKING</p>
          <ol className="space-y-1 text-[clamp(16px,1.8vw,32px)]">
            {ranking.map((r, i) => (
              <li
                key={i}
                className={`flex animate-surgir justify-between rounded-lg px-3 py-1 ${
                  r.meu ? "bg-yellow-300/15 font-bold text-yellow-300" : ""
                }`}
                style={{ animationDelay: `${2.8 + i * 0.12}s` }}
              >
                <span>{MEDALHA[i] ?? `${i + 1}.`} {r.nome}</span>
                <span>{r.pontos}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Sol: disco pulsante com raios girando */}
      <div className="pointer-events-none absolute -bottom-[40rem] left-1/2 z-0 h-[56rem] w-[56rem] -translate-x-1/2">
        <div
          className="absolute -inset-[60%] animate-raios"
          style={{
            background:
              "repeating-conic-gradient(rgba(253,224,71,0.30) 0deg 6deg, transparent 6deg 18deg)",
            maskImage: "radial-gradient(circle, #000 22%, transparent 66%)",
            WebkitMaskImage: "radial-gradient(circle, #000 22%, transparent 66%)",
          }}
        />
        <div
          className="absolute inset-0 animate-sol rounded-full"
          style={{
            background: "radial-gradient(circle, #fff7c2 0%, #fde047 35%, #f59e0b 65%, #ea580c 100%)",
            boxShadow: "0 0 120px 40px rgba(253,224,71,0.55)",
          }}
        />
      </div>

      {/* Astronauta pousando no Sol */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[15rem] z-20 flex justify-center">
        <div className="w-[clamp(110px,11vw,210px)] animate-pousar">
          <div className="animate-flutuar drop-shadow-[0_0_14px_rgba(255,255,255,0.5)]" style={{ animationDelay: "2.6s" }}>
            <ImgOpcional src="/img/astronauta.png" className="h-auto w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}