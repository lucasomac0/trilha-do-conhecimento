import { createClient } from "@supabase/supabase-js";

// Somente servidor (rotas /api). A chave service_role nunca vai ao navegador.
export const db = createClient(
  process.env.SUPABASE_URL ?? "http://localhost:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "missing",
  { auth: { persistSession: false } }
);
