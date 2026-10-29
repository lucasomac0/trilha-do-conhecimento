# Trilha do Conhecimento

Next.js (App Router) + TypeScript + Tailwind v4 + Supabase (PostgreSQL), deploy na Vercel.

## Rodar
1. Crie um projeto no Supabase e execute `supabase/schema.sql` e depois `supabase/seed.sql` (SQL Editor).
2. `cp .env.example .env.local` e preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. `npm install && npm run dev` e abra http://localhost:3000.

## Imagens do Canva (opcionais; sem elas o site usa fallbacks em CSS)
- `public/img/fundo.jpg`: fundo estrelado sem texto
- `public/img/astronauta.png`: astronauta com fundo transparente
- `public/img/planetas/<slug>.png`: guimaraes, goldwasser, von-neumann, johnson, wilson, santos, west, lamarr, hawking (sem o texto do nome)

## Deploy
Importe o repositório na Vercel e cadastre as duas variáveis de ambiente.

## Conteúdo
Planetas, senhas e questões ficam nas tabelas `planets`, `questions` e `options`
(`planets.ativo = true` liga um planeta). Pontos: 10 por acerto + 5 de bônus sem erros.
