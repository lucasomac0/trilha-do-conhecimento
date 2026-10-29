"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

const post = (url: string, body: unknown) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export default function Planeta() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [d, setD] = useState<Dados | null>(null);
  const [erro, setErro] = useState("");
  const [senha, setSenha] = useState("");
  const [ok, setOk] = useState(false);
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
    if (!r.ok) return setErro(j.erro ?? "Erro");
    setOk(true);
    setTimeout(() => { setOk(false); carregar(); }, 900);
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

  const voltar = <Link href="/mapa" className="btn-pixel text-sm">VOLTAR AO MAPA</Link>;
  const centro = "flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center";

  if (!d) return <p className={centro}>{erro || "Carregando…"}{erro && voltar}</p>;

  if (resultado || d.estado === "concluido") {
    const pts = resultado?.pontos ?? d.pontos ?? 0;
    return (
      <main className={centro}>
        <h1 className="font-pixel text-xl leading-loose">Planeta {d.planeta.nome}<br />concluído!</h1>
        <p className="font-pixel text-2xl text-yellow-300">+{pts} pts</p>
        <div className="flex flex-wrap justify-center gap-4">
          {voltar}
          {resultado?.fim && <Link href="/final" className="btn-pixel text-sm">CHEGAR AO SOL</Link>}
        </div>
      </main>
    );
  }

  if (d.estado === "bloqueado") {
    return (
      <main className={centro}>
        <h1 className="max-w-2xl font-pixel text-xl leading-loose">
          Digite o código de desbloqueio do planeta {d.planeta.nome}
        </h1>
        {ok ? (
          <div className="btn-pixel font-pixel text-lg">CÓDIGO CORRETO</div>
        ) : (
          <>
            <input
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && desbloquear()}
              autoFocus
              className="w-80 rounded-xl border-4 border-black bg-white/10 px-4 py-3 text-center font-pixel text-lg outline-none focus:bg-white/20"
            />
            <button className="btn-pixel text-sm" onClick={desbloquear}>ENVIAR</button>
            {erro && <p className="text-red-300">{erro}</p>}
          </>
        )}
        {!ok && voltar}
      </main>
    );
  }

  const q = d.questoes?.[idx];
  if (!q) return <main className={centro}>{voltar}</main>;
  const total = d.questoes?.length ?? 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <section className="painel p-6 text-center">
        <p className="mb-1 text-xs text-white/70">{d.planeta.disciplina}</p>
        <h1 className="font-pixel text-2xl">QUESTÃO {idx + 1}/{total}</h1>
        <p className="mt-3 text-lg">{q.enunciado}</p>
      </section>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {q.opcoes.map((o) => {
          const cls = !fb ? "" : o.id === fb.corretaId ? "certa" : o.id === fb.optId ? "errada" : "";
          return (
            <button key={o.id} className={`opcao ${cls}`} disabled={!!fb} onClick={() => responder(o.id)}>
              {o.texto}
            </button>
          );
        })}
      </div>

      {erro && <p className="text-center text-red-300">{erro}</p>}
      {fb && (
        <div className="painel mx-auto w-full max-w-3xl p-5 text-center">
          <p className="font-pixel text-sm">{fb.correta ? "ACERTOU!" : "NÃO FOI DESSA VEZ"}</p>
          {fb.explicacao && <p className="mt-2">{fb.explicacao}</p>}
          <button className="btn-pixel mt-4 text-xs" onClick={proxima}>
            {fb.concluiu ? "VER RESULTADO" : "PRÓXIMA"}
          </button>
        </div>
      )}
    </main>
  );
}
