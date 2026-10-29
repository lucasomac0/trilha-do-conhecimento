import { db } from "@/lib/supabase";
import { getTeam } from "@/lib/team";

export async function GET() {
  const team = await getTeam();
  const { data } = await db.from("planet_progress").select("team_id,pontos,teams(nome)");
  const soma = new Map<string, { nome: string; pontos: number }>();
  for (const r of data ?? []) {
    const t = soma.get(r.team_id) ?? { nome: (r.teams as any)?.nome ?? "?", pontos: 0 };
    t.pontos += r.pontos;
    soma.set(r.team_id, t);
  }
  const ranking = [...soma.entries()]
    .map(([id, t]) => ({ nome: t.nome, pontos: t.pontos, meu: id === team?.id }))
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 10);
  return Response.json({ ranking });
}
