import { db } from "@/lib/supabase";
import { getTeam, unauthorized } from "@/lib/team";

const PTS_ACERTO = 10;
const PTS_BONUS = 5; // planeta sem nenhum erro

export async function POST(req: Request) {
  const team = await getTeam();
  if (!team) return unauthorized();
  const { questionId, optionId, tempoMs } = await req.json().catch(() => ({}));

  const { data: q } = await db
    .from("questions").select("id,planet_id,explicacao,options(id,correta)")
    .eq("id", questionId).maybeSingle();
  const opt = q?.options.find((o) => o.id === optionId);
  if (!q || !opt) return Response.json({ erro: "Resposta inválida" }, { status: 400 });

  const { data: pr } = await db
    .from("planet_progress").select("concluido_em")
    .eq("team_id", team.id).eq("planet_id", q.planet_id).maybeSingle();
  if (!pr || pr.concluido_em)
    return Response.json({ erro: "Planeta não está em andamento" }, { status: 403 });

  const { error } = await db.from("answers").insert({
    team_id: team.id, question_id: q.id, option_id: opt.id,
    correta: opt.correta, tempo_ms: Number.isFinite(tempoMs) ? Math.round(tempoMs) : null,
  });
  if (error) return Response.json({ erro: "Questão já respondida" }, { status: 409 });

  const corretaId = q.options.find((o) => o.correta)?.id;
  let concluiu = false, pontos = 0, fim = false;

  const { data: qs } = await db.from("questions").select("id").eq("planet_id", q.planet_id);
  const { data: ans } = await db
    .from("answers").select("correta").eq("team_id", team.id)
    .in("question_id", (qs ?? []).map((x) => x.id));
  if ((ans?.length ?? 0) >= (qs?.length ?? 0)) {
    const acertos = (ans ?? []).filter((a) => a.correta).length;
    pontos = acertos * PTS_ACERTO + (acertos === qs?.length ? PTS_BONUS : 0);
    await db.from("planet_progress")
      .update({ concluido_em: new Date().toISOString(), pontos })
      .eq("team_id", team.id).eq("planet_id", q.planet_id);
    concluiu = true;

    const { data: ativos } = await db.from("planets").select("id").eq("ativo", true);
    const { count } = await db.from("planet_progress")
      .select("*", { count: "exact", head: true })
      .eq("team_id", team.id).not("concluido_em", "is", null);
    if ((count ?? 0) >= (ativos?.length ?? 1)) {
      fim = true;
      await db.from("teams").update({ finalizada_em: new Date().toISOString() }).eq("id", team.id);
    }
  }
  return Response.json({ correta: opt.correta, corretaId, explicacao: q.explicacao, concluiu, pontos, fim });
}
