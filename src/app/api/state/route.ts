import { db } from "@/lib/supabase";
import { getTeam, unauthorized } from "@/lib/team";

export async function GET() {
  const team = await getTeam();
  if (!team) return unauthorized();
  const [{ data: planets }, { data: prog }] = await Promise.all([
    db.from("planets").select("id,slug,nome,disciplina,cor,ativo").order("ordem"),
    db.from("planet_progress").select("planet_id,concluido_em,pontos").eq("team_id", team.id),
  ]);
  const mapa = new Map((prog ?? []).map((p) => [p.planet_id, p]));
  const planetas = (planets ?? []).map((pl) => {
    const p = mapa.get(pl.id);
    const estado = !pl.ativo ? "indisponivel" : !p ? "bloqueado" : p.concluido_em ? "concluido" : "desbloqueado";
    return { slug: pl.slug, nome: pl.nome, disciplina: pl.disciplina, cor: pl.cor, estado };
  });
  const pontos = (prog ?? []).reduce((s, p) => s + p.pontos, 0);
  return Response.json({ equipe: team.nome, finalizada: !!team.finalizada_em, pontos, planetas });
}
