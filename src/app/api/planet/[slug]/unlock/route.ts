import { db } from "@/lib/supabase";
import { getTeam, norm, unauthorized } from "@/lib/team";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const team = await getTeam();
  if (!team) return unauthorized();
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const { data: pl } = await db.from("planets").select("id,senha,ativo").eq("slug", slug).maybeSingle();
  if (!pl || !pl.ativo) return Response.json({ erro: "Planeta indisponível" }, { status: 404 });
  if (norm(String(body.senha ?? "")) !== norm(pl.senha))
    return Response.json({ erro: "Código incorreto. Procure o papel na sala!" }, { status: 400 });
  await db.from("planet_progress").upsert(
    { team_id: team.id, planet_id: pl.id },
    { onConflict: "team_id,planet_id", ignoreDuplicates: true }
  );
  return Response.json({ ok: true });
}
