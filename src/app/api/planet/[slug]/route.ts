import { db } from "@/lib/supabase";
import { getTeam, unauthorized } from "@/lib/team";

// Nunca envia a alternativa correta ao navegador.
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const team = await getTeam();
  if (!team) return unauthorized();
  const { slug } = await params;
  const { data: pl } = await db
    .from("planets").select("id,nome,disciplina,cor,ativo").eq("slug", slug).maybeSingle();
  if (!pl || !pl.ativo) return Response.json({ erro: "Planeta indisponível" }, { status: 404 });
  const planeta = { nome: pl.nome, disciplina: pl.disciplina, cor: pl.cor };

  const { data: pr } = await db
    .from("planet_progress").select("concluido_em,pontos")
    .eq("team_id", team.id).eq("planet_id", pl.id).maybeSingle();
  if (!pr) return Response.json({ estado: "bloqueado", planeta });
  if (pr.concluido_em) return Response.json({ estado: "concluido", planeta, pontos: pr.pontos });

  const { data: qs } = await db
    .from("questions").select("id,enunciado,options(id,texto)")
    .eq("planet_id", pl.id).order("posicao");
  const ids = (qs ?? []).map((q) => q.id);
  const { data: ans } = await db
    .from("answers").select("question_id").eq("team_id", team.id).in("question_id", ids);

  // Embaralhamento determinístico (estável entre recarregamentos).
  const mix = (n: number) => (n * 2654435761) % 1000;
  const questoes = (qs ?? []).map((q) => ({
    id: q.id,
    enunciado: q.enunciado,
    opcoes: [...q.options].sort((a, b) => mix(a.id + q.id) - mix(b.id + q.id)),
  }));
  return Response.json({
    estado: "desbloqueado", planeta, questoes,
    respondidas: (ans ?? []).map((a) => a.question_id),
  });
}
