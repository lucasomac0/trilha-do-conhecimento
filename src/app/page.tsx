"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImgOpcional from "@/components/ImgOpcional";

export default function Inicio() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function iniciar() {
    setCarregando(true);
    setErro("");
    try {
      const r = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      if (r.ok) return router.push("/mapa");
      setErro((await r.json()).erro ?? "Erro ao iniciar");
    } catch {
      setErro("Sem conexão com o servidor");
    }
    setCarregando(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && iniciar()}
        maxLength={30}
        placeholder="Nome da equipe"
        className="w-72 rounded-xl border-4 border-black bg-white/10 px-4 py-3 text-center text-lg outline-none placeholder:text-white/50 focus:bg-white/20"
      />
      <div className="relative">
        <ImgOpcional src="/img/astronauta.png" className="absolute -top-20 -left-10 w-28 -rotate-12" />
        <button className="btn-pixel text-3xl" onClick={iniciar} disabled={carregando}>
          INICIAR
        </button>
      </div>
      {erro && <p className="text-red-300">{erro}</p>}
      <h1 className="mt-6 max-w-3xl font-pixel text-lg leading-loose">
        Jornada nas estrelas:
        <br />
        ajude o astronauta a chegar na estrela usando seus conhecimentos em tecnologia
      </h1>
    </main>
  );
}
