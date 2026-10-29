create table teams (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  nome text not null,
  criada_em timestamptz not null default now(),
  finalizada_em timestamptz
);
create table planets (
  id serial primary key,
  slug text unique not null,
  nome text not null,
  disciplina text not null default 'A definir',
  ordem int not null,
  senha text not null,
  cor text not null default '#6366f1',
  ativo boolean not null default false
);
create table questions (
  id serial primary key,
  planet_id int not null references planets on delete cascade,
  enunciado text not null,
  explicacao text,
  posicao int not null default 0
);
create table options (
  id serial primary key,
  question_id int not null references questions on delete cascade,
  texto text not null,
  correta boolean not null default false
);
create table planet_progress (
  team_id uuid references teams on delete cascade,
  planet_id int references planets on delete cascade,
  desbloqueado_em timestamptz not null default now(),
  concluido_em timestamptz,
  pontos int not null default 0,
  primary key (team_id, planet_id)
);
create table answers (
  team_id uuid references teams on delete cascade,
  question_id int references questions on delete cascade,
  option_id int not null references options on delete cascade,
  correta boolean not null,
  tempo_ms int,
  respondida_em timestamptz not null default now(),
  primary key (team_id, question_id)
);
-- RLS ligado e sem políticas: só o servidor (service_role) acessa os dados.
alter table teams enable row level security;
alter table planets enable row level security;
alter table questions enable row level security;
alter table options enable row level security;
alter table planet_progress enable row level security;
alter table answers enable row level security;
