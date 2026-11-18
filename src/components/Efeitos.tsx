"use client";
import { useEffect, useState, type CSSProperties } from "react";

// Número que sobe de 0 até o valor final.
export function Numero({
  alvo, ms = 1400, atraso = 0, prefixo = "", sufixo = "", className = "", style,
}: {
  alvo: number; ms?: number; atraso?: number; prefixo?: string; sufixo?: string;
  className?: string; style?: CSSProperties;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t = setTimeout(() => {
      const ini = performance.now();
      const passo = (agora: number) => {
        const k = Math.min((agora - ini) / ms, 1);
        setV(Math.round(alvo * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(passo);
      };
      raf = requestAnimationFrame(passo);
    }, atraso);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [alvo, ms, atraso]);
  return <span className={className} style={style}>{prefixo}{v}{sufixo}</span>;
}

// Estouro de partículas a partir do ponto onde é colocado (use dentro de um elemento relative).
export function Estouro({ n = 14, dist = 110 }: { n?: number; dist?: number }) {
  const cores = ["#fde047", "#4ade80", "#ffffff", "#86efac"];
  return (
    <span aria-hidden className="pointer-events-none absolute">
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = dist * (i % 2 ? 0.65 : 1);
        return (
          <span
            key={i}
            className="absolute left-0 top-0 size-3 animate-estouro rounded-full"
            style={{
              background: cores[i % cores.length],
              "--dx": `${Math.cos(a) * d}px`,
              "--dy": `${Math.sin(a) * d}px`,
            } as CSSProperties}
          />
        );
      })}
    </span>
  );
}

// Confete caindo pela tela inteira.
export function Confete({ n = 36, atraso = 0, repetir = false }: { n?: number; atraso?: number; repetir?: boolean }) {
  const cores = ["#fde047", "#f97316", "#60a5fa", "#a78bfa", "#4ade80", "#f472b6"];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: n }, (_, i) => {
        const r = (k: number) => {
          const x = Math.sin((i + 1) * k) * 10000;
          return x - Math.floor(x);
        };
        return (
          <span
            key={i}
            className="absolute -top-6 animate-cair rounded-sm"
            style={{
              left: `${r(12.9898) * 100}%`,
              width: `${6 + r(78.233) * 8}px`,
              height: `${10 + r(39.346) * 10}px`,
              background: cores[i % cores.length],
              animationDelay: `${atraso + r(11.135) * 2.5}s`,
              animationDuration: `${3 + r(93.989) * 3}s`,
              animationIterationCount: repetir ? "infinite" : 1,
            }}
          />
        );
      })}
    </div>
  );
}