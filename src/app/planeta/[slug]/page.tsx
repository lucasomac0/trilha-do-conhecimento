"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Confete, Estouro, Numero } from "@/components/Efeitos";

type Opcao = { id: number; texto: string };
type Questao = { id: number; enunciado: string; opcoes: Opcao[] };
type Dados = {
  estado: "bloqueado" | "desbloqueado" | "concluido";
  planeta: { nome: string; disciplina: string };
  pontos?: number;
  questoes?: Questao[];
  respondidas?: number[];
};
type Feedback = {
  optId: number; correta: boolean; corretaId: number; explicacao: string | null;
  concluiu: boolean; pontos: number; fim: boolean;
};

const PTS_ACERTO = 10; // mesmo valor de /api/answer

const post = (url: string, body: unknown) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export default function Planeta() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [d, setD] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");
  const [senha, setSenha] = useState("");
  const [ok, setOk] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [idx, setIdx] = useState(0);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [resultado, setResultado] = useState<Feedback | null>(null);
  const t0 = useRef(0);

  const carregar = useCallback(async () => {
    const r = await fetch(`/api/planet/${slug}`);
    if (r.status === 401) return router.replace("/");
    const j = await r.json();
    if (!r.ok) return setErro(j.erro);
    setD(j);
    const pend = (j.questoes ?? []).findIndex((q: Questao) => !j.respondidas.includes(q.id));
    setIdx(Math.max(pend, 0));
    t0.current = Date.now();
  }, [slug, router]);

  useEffect(() => { carregar(); }, [carregar]);

  async function desbloquear() {
    setErro("");
    const r = await post(`/api/planet/${slug}/unlock`, { senha });
    const j = await r.json();
    if (!r.ok) {
      setTentativa((t) => t + 1);
      return setErro(j.erro ?? "Erro");
    }
    setOk(true);
    // Mantém a animação até as questões estarem carregadas.
    setTimeout(async () => { await carregar(); setOk(false); }, 1300);
  }

  async function responder(optId: number) {
    const q = d?.questoes?.[idx];
    if (fb || !q) return;
    const r = await post("/api/answer", { questionId: q.id, optionId: optId, tempoMs: Date.now() - t0.current });
    const j = await r.json();
    if (!r.ok) return setErro(j.erro ?? "Erro");
    setFb({ optId, ...j });
  }

  function proxima() {
    if (fb?.concluiu) return setResultado(fb);
    setFb(null);
    setIdx((i) => i + 1);
    t0.current = Date.now();
  }

  const voltar = <Link href="/mapa" className="btn-pixel text-[clamp(12px,1.3vw,22px)]">VOLTAR AO MAPA</Link>;
  const centro = "flex min-h-dvh flex-col items-center justify-center gap-[4vh] p-6 text-center";
  const titulo = "max-w-5xl font-pixel text-[clamp(18px,2.4vw,42px)] leading-loose";

  if (!d) return <p className={centro}>{erro || "Carregando…"}{erro && voltar}</p>;

  /* ---------- Planeta concluído ---------- */
  if (resultado || d.estado === "concluido") {
    const pts = resultado?.pontos ?? d.pontos ?? 0;
    const bonus = pts % 10 === 5;
    return (
      <main className={centro}>
        <Confete n={40} />
        <h1 className={`${titulo} animate-pop`}>
          Planeta {d.planeta.nome}<br />concluído!
        </h1>
        <Numero
          alvo={pts}
          prefixo="+"
          sufixo=" pts"
          atraso={500}
          className="animate-pop font-pixel text-[clamp(40px,7vw,120px)] text-yellow-300"
          style={{ textShadow: "0 0 30px rgba(253,224,71,0.7)" }}
        />
        {bonus && (
          <p className="animate-surgir text-[clamp(16px,1.8vw,32px)] text-amber-300" style={{ animationDelay: "1.2s" }}>
            ★ Bônus de planeta sem erros: +5
          </p>
        )}
        <div className="flex animate-surgir flex-wrap justify-center gap-6" style={{ animationDelay: "1.4s" }}>
          {voltar}
          {resultado?.fim && (
            <Link href="/final" className="btn-pixel animate-respirar text-[clamp(12px,1.3vw,22px)]">
              CHEGAR AO SOL
            </Link>
          )}
        </div>
      </main>
    );
  }

  /* ---------- Senha ---------- */
  if (d.estado === "bloqueado") {
    return (
      <main className={centro}>
        {ok && (
          <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-hidden">
            <div
              className="size-40 animate-clarao rounded-full"
              style={{ background: "radial-gradient(circle, #fff 0%, rgba(147,197,253,0.8) 40%, transparent 70%)" }}
            />
          </div>
        )}
        <h1 className={titulo}>Digite o código de desbloqueio do planeta {d.planeta.nome}</h1>
        {ok ? (
          <div
            className="btn-pixel animate-pop font-pixel text-[clamp(18px,2.4vw,42px)]"
            style={{
              background: "linear-gradient(#10a43f, #065f26)",
              boxShadow: "0 0 60px 14px rgba(74,222,128,0.7)",
            }}
          >
            ✔ CÓDIGO CORRETO
          </div>
        ) : (
          <>
            <input
              key={tentativa}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && desbloquear()}
              autoFocus
              className={`w-[min(90vw,30rem)] rounded-xl border-4 bg-white/10 px-4 py-4 text-center font-pixel text-[clamp(20px,2.2vw,38px)] outline-none focus:bg-white/20 ${
                erro ? "animate-tremer border-red-500" : "border-black"
              }`}
            />
            <button className="btn-pixel text-[clamp(12px,1.3vw,22px)]" onClick={desbloquear}>ENVIAR</button>
            {erro && <p className="text-[clamp(16px,1.6vw,28px)] text-red-300">{erro}</p>}
          </>
        )}
        {!ok && voltar}
      </main>
    );
  }

  /* ---------- Questões ---------- */
  const q = d.questoes?.[idx];
  if (!q) return <main className={centro}>{voltar}</main>;
  const total = d.questoes?.length ?? 0;

  return (
    <main className={`mx-auto flex min-h-dvh max-w-6xl flex-col justify-center gap-[2.5vh] p-[3vw] ${fb ? "pb-64" : ""}`}>
      {/* Brilho nas bordas da tela ao responder */}
      {fb && (
        <div
          key={`${idx}-${fb.optId}`}
          className={`pointer-events-none fixed inset-0 z-40 animate-piscar ${
            fb.correta
              ? "shadow-[inset_0_0_200px_60px_rgba(34,197,94,0.55)]"
              : "shadow-[inset_0_0_200px_60px_rgba(239,68,68,0.6)]"
          }`}
        />
      )}

      <section key={`q${idx}`} className="painel animate-surgir p-[2.5vw] text-center">
        <p className="mb-2 text-[clamp(12px,1.2vw,20px)] text-white/70">{d.planeta.disciplina}</p>
        <h1 className="font-pixel text-[clamp(18px,2vw,34px)]">QUESTÃO {idx + 1}/{total}</h1>
        <p className="mt-4 text-[clamp(20px,2.4vw,42px)] leading-snug">{q.enunciado}</p>
      </section>

      <div className="mx-auto flex w-full flex-col gap-[2vh]">
        {q.opcoes.map((o, k) => {
          const cls = !fb ? "" : o.id === fb.corretaId ? "certa" : o.id === fb.optId ? "errada" : "";
          const acertou = !!fb && fb.correta && o.id === fb.corretaId;
          return (
            <button
              key={`${q.id}-${o.id}`}
              className={`opcao animate-surgir ${cls}`}
              style={!fb ? { animationDelay: `${150 + k * 90}ms` } : undefined}
              disabled={!!fb}
              onClick={() => responder(o.id)}
            >
              {o.texto}
              {acertou && (
                <>
                  <span className="absolute right-12 top-1/2">
                    <Estouro />
                  </span>
                  <span className="pointer-events-none absolute right-6 top-1/2 -mt-5 animate-subir font-pixel text-[clamp(18px,2vw,34px)] text-yellow-300">
                    +{PTS_ACERTO}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {erro && <p className="text-center text-[clamp(16px,1.6vw,28px)] text-red-300">{erro}</p>}

      {fb && (
        <div className="fixed inset-x-0 bottom-0 z-30 p-[2vw]">
          <div
            className={`painel mx-auto w-full max-w-5xl animate-pop p-[1.5vw] text-center ${
              fb.correta ? "!border-green-400" : "!border-red-400"
            }`}
          >
            <p
              className={`font-pixel text-[clamp(18px,2.2vw,38px)] ${fb.correta ? "text-green-300" : "text-red-300"}`}
            >
              {fb.correta ? `ACERTOU! +${PTS_ACERTO}` : "NÃO FOI DESSA VEZ"}
            </p>
            {fb.explicacao && <p className="mt-2 text-[clamp(14px,1.5vw,26px)]">{fb.explicacao}</p>}
            <button className="btn-pixel mt-4 text-[clamp(12px,1.2vw,20px)]" onClick={proxima}>
              {fb.concluiu ? "VER RESULTADO" : "PRÓXIMA"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}