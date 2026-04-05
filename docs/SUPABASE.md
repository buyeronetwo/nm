# Архитектура без VPS: Supabase + статический фронт + Netlify

Цель: **ни одного своего сервера**. Данные и API — у [Supabase](https://supabase.com/), сайт — Netlify (или другой статический хостинг), лиды — Netlify Function + Telegram, опционально запись в Supabase.

## Схема

```text
[Браузер] --anon key + RLS--> [Supabase Postgres]  таблица vacancies (SELECT публично)
[Браузер] --POST--> [Netlify Function lead] --HTTPS--> [Telegram sendMessage]
[Netlify Function lead] --service role--> [Supabase]     таблица leads (INSERT)
[Локально / CI] --service role--> [Supabase]             INSERT/DELETE vacancies (бот или скрипт)
[Опционально] [Telegram] --webhook--> [Supabase Edge Function]  (заготовка в repo)
```

## 1. Проект Supabase

1. Создай проект в Supabase.
2. В **SQL Editor** по очереди выполни миграции из `supabase/migrations/` (или `supabase db push` при локальном CLI):
   - `20260405140000_vacancies_leads_sessions.sql` — таблицы и RLS
   - `20260405150000_seed_default_vacancy.sql` — стартовая вакансия **Affiliate Manager** (как на сайте; при повторном запуске не дублируется)
3. В **Project Settings → API** скопируй:
   - **Project URL**
   - **anon public** key
   - **service_role** key (только серверы/скрипты, никогда в клиент и не в Git)

## 2. Переменные окружения

### Фронт (Netlify / Vite build)

| Переменная | Описание |
|------------|----------|
| `VITE_SUPABASE_URL` | URL проекта |
| `VITE_SUPABASE_ANON_KEY` | anon key (виден в бандле — только RLS-разрешённые операции) |

Если эти две заданы, блок «Вакансии» **читает из Supabase**. Иначе — как раньше (`VITE_VACANCIES_API_URL` или `/api/vacancies` / `/vacancies.json`).

**Важно:** в `netlify.toml` по умолчанию задано `VITE_VACANCIES_API_URL=/vacancies.json` — это **статический** файл со сборки. Бот с `SUPABASE_SERVICE_ROLE_KEY` пишет в **Postgres**, а не в этот JSON: на проде добавь в панели Netlify **`VITE_SUPABASE_URL`** и **`VITE_SUPABASE_ANON_KEY`**, чтобы блок вакансий ходил в Supabase. Локально `npm run dev`: если в `.env` есть URL + service role, но **нет** anon, маршрут **`/api/vacancies`** всё равно подтянет список из БД (через service role на сервере Vite); в браузере без `VITE_SUPABASE_*` по-прежнему нужен этот dev-эндпоинт или anon в env.

### Netlify Function `lead` (секреты в UI)

| Переменная | Описание |
|------------|----------|
| `TELEGRAM_BOT_TOKEN` | как раньше |
| `TELEGRAM_CHAT_ID` | как раньше |
| `SUPABASE_URL` | тот же URL (без префикса VITE_) |
| `SUPABASE_SERVICE_ROLE_KEY` | service role — для `INSERT` в `leads` после успешной отправки в Telegram |

Если `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` **не** заданы, лиды только уходят в Telegram (как раньше).

### Локальный Node-бот вакансий (`npm run bot`)

| Переменная | Описание |
|------------|----------|
| `SUPABASE_URL` | URL проекта |
| `SUPABASE_SERVICE_ROLE_KEY` | запись в `vacancies` |
| Остальное | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_IDS` |

При наличии service role бот пишет в **Supabase**, а не в `data/vacancies.json`. Если Supabase не настроен — поведение прежнее (файл).

## 3. Импорт начальных вакансий

После применения миграции:

```bash
# в .env.local: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npx tsx scripts/seed-vacancies-to-supabase.ts
```

Берёт `data/vacancies.json` или `data/vacancies.seed.json`, делает `upsert` по `id`.

## 4. Telegram без VPS (следующий шаг)

В репозитории есть заготовка **`supabase/functions/telegram-webhook/index.ts`**. План:

1. Задеплоить функцию (`supabase functions deploy`).
2. Указать в BotFather / `setWebhook` URL функции и секрет.
3. Портировать сценарии бота с long polling на **webhook** и хранить FSM в таблице **`bot_sessions`** (уже в миграции).

До этого бот можно запускать **локально** или из CI с `SUPABASE_SERVICE_ROLE_KEY` — VPS не нужен, но нужен процесс с интернетом.

## 5. RLS (кратко)

- **`vacancies`**: `SELECT` для `anon` — сайт читает список; `INSERT/UPDATE/DELETE` только через **service_role** (бот, скрипты, Edge Function).
- **`leads`**: политик для `anon` нет — вставка только **service_role** (Netlify Function).
- **`bot_sessions`**: только **service_role** под будущий webhook.

## 6. Netlify

См. [NETLIFY.md](./NETLIFY.md). При переходе на Supabase для вакансий в панели Netlify добавь `VITE_SUPABASE_*`; `VITE_VACANCIES_API_URL` можно не задавать — приоритет у Supabase в коде `fetchVacanciesForCareersSection`.
