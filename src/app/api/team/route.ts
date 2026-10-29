import { cookies } from "next/headers";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nome = String(body.nome ?? "").trim().slice(0, 30);
  if (nome.length < 2)
    return Response.json({ erro: "Informe o nome da equipe (mín. 2 letras)" }, { status: 400 });
  const { data, error } = await db.from("teams").insert({ nome }).select("token").single();
  if (error || !data)
    return Response.json({ erro: "Falha ao criar a equipe" }, { status: 500 });
  (await cookies()).set("team_token", data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return Response.json({ ok: true });
}
