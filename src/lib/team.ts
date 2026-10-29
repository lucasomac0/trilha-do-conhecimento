import { cookies } from "next/headers";
import { db } from "./supabase";

export async function getTeam() {
  const token = (await cookies()).get("team_token")?.value;
  if (!token) return null;
  const { data } = await db
    .from("teams")
    .select("id,nome,finalizada_em")
    .eq("token", token)
    .maybeSingle();
  return data;
}

export const norm = (s: string) => s.trim().toLowerCase();
export const unauthorized = () =>
  Response.json({ erro: "Equipe não encontrada" }, { status: 401 });
