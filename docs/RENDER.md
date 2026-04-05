# Деплой на Render (один репозиторий)

Один **Web Service** отдаёт **статический фронт** из `dist`, **`GET /api/vacancies`**, **`POST /api/lead`** (как Netlify Function) и при `RUN_TELEGRAM_VACANCIES_BOT=true` поднимает **второй процесс** `npm run bot` (Telegram long polling).

## Быстрый старт

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Подключите GitHub/GitLab и выберите репозиторий с этим проектом.
3. Укажите путь к **`render.yaml`** (в корне) → применить.
4. В созданном сервисе **Environment** добавьте секреты (см. таблицу ниже). Для **Supabase на фронте** задайте `VITE_*` до первой сборки или сделайте **Clear build cache & deploy** после добавления переменных.

## Переменные окружения

### Обязательно для формы и бота

| Переменная | Описание |
|------------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен бота (@BotFather) |
| `TELEGRAM_CHAT_ID` | Куда слать лиды с формы |
| `TELEGRAM_ADMIN_IDS` | Через запятую: числовые user id для команд `/list`, `/add` |

### Рекомендуется для вакансий на проде

Диск Render **эфемерный**: файл `data/vacancies.json` не сохраняется между деплоями. Для вакансий задайте Supabase (см. [SUPABASE.md](SUPABASE.md)):

| Переменная | Описание |
|------------|----------|
| `VITE_SUPABASE_URL` | URL проекта (вшивается в сборку) |
| `VITE_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_URL` | Тот же URL (сервер) |
| `SUPABASE_SERVICE_ROLE_KEY` | Запись лидов в `leads`, бот — в `vacancies` |

### Опционально

| Переменная | Описание |
|------------|----------|
| `SUPABASE_ANON_KEY` | Если нужен без префикса `VITE_` |
| `RUN_TELEGRAM_VACANCIES_BOT` | `true` / `false` — запускать ли `npm run bot` вместе с веб-сервисом (в blueprint уже `true`) |

`VITE_LEAD_API_URL` и `VITE_VACANCIES_API_URL` в **`render.yaml`** заданы как **`/api/lead`** и **`/api/vacancies`** (тот же origin).

## Локальная проверка как на Render

```bash
npm install
npm run build
npm run start:render
```

Откройте `http://localhost:8787` (или `PORT` из env). Для бота задайте `RUN_TELEGRAM_VACANCIES_BOT=true` в `.env`.

## Ограничения free Web Service

Инстанс может **засыпать** при отсутствии HTTP-трафика. Пока сервис спит, **long polling бота не работает**. Варианты: платный план **Always on**, внешний пинг (осторожно с правилами Render) или держать бота отдельно (другой сервис/VPS). Форма и статика после пробуждения снова доступны.

## Netlify

Старый деплой через **`netlify.toml`** и функцию **`netlify/functions/lead.ts`** можно продолжать использовать параллельно; для Render используется **`server/renderServer.ts`**.
