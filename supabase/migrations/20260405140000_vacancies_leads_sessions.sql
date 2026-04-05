-- Вакансии: публичное чтение (anon), запись только service_role (бот / админ-скрипты)
create table public.vacancies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title jsonb not null,
  requirements jsonb not null,
  constraint vacancies_title_en check (
    title ? 'en'
    and length(trim(title ->> 'en')) > 0
  ),
  constraint vacancies_requirements_en check (
    requirements ? 'en'
    and length(trim(requirements ->> 'en')) > 0
  )
);

create index vacancies_created_at_idx on public.vacancies (created_at desc);

alter table public.vacancies enable row level security;

create policy vacancies_select_public on public.vacancies for select to anon, authenticated using (true);

comment on table public.vacancies is 'Сайт читает через anon; CRUD — service_role (Node-бот или Edge Function).';

-- Заявки с формы: только service_role (Netlify Function и т.п.)
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  telegram text not null,
  message text not null
);

create index leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

comment on table public.leads is 'Без публичных политик — insert только с service_role.';

-- Резерв под FSM бота в Edge Function (webhook), без публичного доступа
create table public.bot_sessions (
  telegram_user_id bigint primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.bot_sessions enable row level security;

comment on table public.bot_sessions is 'Состояние сценариев Telegram-бота; только service_role.';
