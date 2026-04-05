# Деплой на Netlify

Альтернатива без отдельной функции на Edge: **[Render + один Web Service](RENDER.md)** (`render.yaml` в корне).

Репозиторий уже содержит **`netlify.toml`**, **функцию** `netlify/functions/lead.ts` и скрипт **`prebuild`**, который копирует вакансии в **`public/vacancies.json`** (из `data/vacancies.json` или из `data/vacancies.seed.json`).

## Подключение репозитория

1. [Netlify](https://app.netlify.com/) → **Add new site** → **Import an existing project** → выбрать Git (GitHub/GitLab/Bitbucket).
2. Выбрать репозиторий с этим проектом.
3. Сборка подхватится из **`netlify.toml`**:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Дождитесь первого деплоя.

Список вакансий на сайте можно перевести на **Supabase** (без VPS): задайте в Netlify **`VITE_SUPABASE_URL`** и **`VITE_SUPABASE_ANON_KEY`** — см. **[SUPABASE.md](./SUPABASE.md)**. Тогда статический **`/vacancies.json`** не используется.

## Переменные окружения (обязательно для формы)

В **Site configuration → Environment variables** добавьте:

| Имя | Описание |
|-----|----------|
| `TELEGRAM_BOT_TOKEN` | Токен от @BotFather |
| `TELEGRAM_CHAT_ID` | Числовой id чата для лидов |
| `SUPABASE_URL` | Опционально: URL проекта Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Опционально: запись лидов в таблицу `leads` после Telegram |

Они **не** с префиксом `VITE_`: используются только серверной функцией `lead`, секреты не попадают в клиентский бандл.

Переменные **`VITE_LEAD_API_URL`** и **`VITE_VACANCIES_API_URL`** уже заданы в **`netlify.toml`** в секции `[build.environment]` и вшиваются при сборке на Netlify.

## Как устроено

- **`POST /api/lead`** → rewrite на **Netlify Function** `lead` (как локальный Vite middleware).
- **Список вакансий** → статический **`/vacancies.json`** в корне сайта (копируется перед `vite build`).
- После изменения вакансий в **`data/vacancies.json`** (локально или в репозитории, если файл не в `.gitignore`) сделайте **новый деплой**, чтобы обновился `public/vacancies.json`.

## Telegram-бот вакансий

Бот по-прежнему пишет в **локальный файл** `data/vacancies.json`. На Netlify сайт **не** читает этот файл в рантайме: на проде показывается то, что попало в **`vacancies.json` при последней сборке**.

Варианты:

- Обновлять `data/vacancies.json` в репозитории (если решите его коммитить) и пересобирать сайт; или
- Вынести вакансии в БД / API и задать **`VITE_VACANCIES_API_URL`** в настройках Netlify (переопределит значение из `netlify.toml` для следующих сборок).

## Локальная проверка как на Netlify

```bash
npm install
npm run build
npx netlify-cli deploy --prod --dir=dist
```

(при первом запуске CLI попросит авторизацию; для функций нужен полный деплой, не только `dist`.)

Проще: подключить репозиторий и править переменные в UI Netlify.
