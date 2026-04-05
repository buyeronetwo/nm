import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { Bot, InlineKeyboard, type Context } from 'grammy'

import { resolveSupabaseUrl } from '../server/supabase/clientFactory'
import { type Vacancy } from '../server/vacancies/types'
import { isSupabaseVacanciesWriteConfigured } from '../server/vacancies/supabaseVacancies'
import {
  appendVacancyUnified,
  readVacanciesForBot,
  removeVacancyByIdUnified,
} from '../server/vacancies/unifiedStore'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRootDirectory = path.resolve(scriptDirectory, '..')

// Сначала база .env, затем .env.local с override — иначе пустые ключи в local блокируют значения из .env.
config({ path: path.join(projectRootDirectory, '.env') })
config({ path: path.join(projectRootDirectory, '.env.local'), override: true })

const environment = process.env as Record<string, string | undefined>

function parseAdministratorIds(raw: string | undefined): Set<number> {
  if (!raw?.trim()) {
    return new Set()
  }
  const identifiers = new Set<number>()
  for (const segment of raw.split(',')) {
    const trimmed = segment.trim()
    if (!trimmed) {
      continue
    }
    const parsed = Number(trimmed)
    if (!Number.isNaN(parsed)) {
      identifiers.add(parsed)
    }
  }
  return identifiers
}

const administratorIds = parseAdministratorIds(process.env.TELEGRAM_ADMIN_IDS)
const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim()

if (!botToken) {
  console.error('TELEGRAM_BOT_TOKEN is required')
  process.exit(1)
}

if (administratorIds.size === 0) {
  console.error('TELEGRAM_ADMIN_IDS must list at least one numeric Telegram user id')
  process.exit(1)
}

console.info(
  `Админы бота (TELEGRAM_ADMIN_IDS): ${[...administratorIds].sort((left, right) => left - right).join(', ')}`,
)

if (isSupabaseVacanciesWriteConfigured(environment)) {
  const supabaseHost = (() => {
    try {
      return new URL(resolveSupabaseUrl(environment) ?? '').host || '(invalid URL)'
    } catch {
      return '(invalid URL)'
    }
  })()
  console.info(`Vacancies: writing to Supabase (${supabaseHost})`)
} else {
  console.info(
    'Vacancies: writing to local file (нет пары SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY — в Postgres бот не пишет)',
  )
}

const bot = new Bot(botToken)

type AddDraft = {
  titleEn: string
  reqEn: string
  titleRu?: string
  reqRu?: string
  titleUk?: string
  reqUk?: string
}

type WizardState =
  | { kind: 'add'; phase: 'title_en' }
  | { kind: 'add'; phase: 'req_en'; titleEn: string }
  | { kind: 'add'; phase: 'title_ru'; draft: Pick<AddDraft, 'titleEn' | 'reqEn'> }
  | { kind: 'add'; phase: 'req_ru'; draft: Pick<AddDraft, 'titleEn' | 'reqEn' | 'titleRu'> }
  | { kind: 'add'; phase: 'title_uk'; draft: Pick<AddDraft, 'titleEn' | 'reqEn' | 'titleRu' | 'reqRu'> }
  | { kind: 'add'; phase: 'req_uk'; draft: Pick<AddDraft, 'titleEn' | 'reqEn' | 'titleRu' | 'reqRu' | 'titleUk'> }

const wizardByChatId = new Map<number, WizardState>()

function clearWizard(userId: number): void {
  wizardByChatId.delete(userId)
}

function isAdministrator(userId: number | undefined): userId is number {
  return userId !== undefined && administratorIds.has(userId)
}

const wizardSkipWords = new Set(['skip', 'скип', 'пропустить', 'пропуск'])

/**
 * Пропуск шага RU/UK: обычное слово без / (Telegram часто криво обрабатывает /skip как команду).
 * Считается пропуском только первое «слово» сообщения (без хвостовой пунктуации).
 */
function isWizardSkipMessage(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) {
    return false
  }

  const firstSegment = (trimmed.split(/\s+/)[0] ?? '').toLowerCase()
  if (firstSegment === '/skip' || firstSegment.startsWith('/skip@')) {
    return true
  }

  const firstWord = firstSegment.replace(/^[^\p{L}\p{N}]+/gu, '').replace(/[.,!?;:…]+$/gu, '')
  if (wizardSkipWords.has(firstWord)) {
    return true
  }

  const wholeMessage = trimmed.toLowerCase().replace(/[.,!?;:…]+$/gu, '')
  if (wizardSkipWords.has(wholeMessage)) {
    return true
  }

  return false
}

function chunkTelegramText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) {
    return [text]
  }
  const parts: string[] = []
  for (let index = 0; index < text.length; index += maxLength) {
    parts.push(text.slice(index, index + maxLength))
  }
  return parts
}

/** Снимает «крутилку» на inline-кнопке сразу; иначе при медленном Supabase кажется, что бот завис. */
async function acknowledgeCallbackQuery(context: Context): Promise<void> {
  try {
    await context.answerCallbackQuery()
  } catch {
    /* дубликат ответа или устаревший callback */
  }
}

bot.use(async (context, next) => {
  const update = context.update
  const isHandledUpdateKind =
    update.message !== undefined ||
    update.edited_message !== undefined ||
    update.callback_query !== undefined
  if (!isHandledUpdateKind) {
    await next()
    return
  }

  const userId = context.from?.id
  if (!isAdministrator(userId)) {
    const userIdLabel = userId !== undefined ? String(userId) : 'не определён (пишите боту в личку, не в группу)'
    await context.reply(
      [
        'Нет доступа.',
        '',
        `Ваш Telegram user id: <code>${userIdLabel}</code>`,
        'Добавьте это число в TELEGRAM_ADMIN_IDS в .env или .env.local и перезапустите <code>npm run bot</code>.',
      ].join('\n'),
      { parse_mode: 'HTML' },
    )
    return
  }
  await next()
})

function requireUserId(context: Context): number {
  const userId = context.from?.id
  if (userId === undefined) {
    throw new Error('Missing user on authenticated update')
  }
  return userId
}

bot.command('start', async (context) => {
  clearWizard(requireUserId(context))
  await context.reply(
    [
      '<b>Vacancies bot</b>',
      '',
      '/list — список вакансий',
      '/show &lt;id&gt; — полный текст',
      '/add — добавить (EN обязателен, RU/UK по шагам)',
      '/cancel — отменить сценарий /add',
      '',
      'Полная инструкция: docs/TELEGRAM_VACANCIES_BOT.md',
    ].join('\n'),
    { parse_mode: 'HTML' },
  )
})

bot.command('cancel', async (context) => {
  clearWizard(requireUserId(context))
  await context.reply('Сценарий добавления сброшен.')
})

const telegramMessageSafeMaxLength = 3800

bot.command('list', async (context) => {
  clearWizard(requireUserId(context))
  let vacancies: Awaited<ReturnType<typeof readVacanciesForBot>>
  try {
    vacancies = await readVacanciesForBot(projectRootDirectory, environment)
  } catch (readError) {
    const detail = readError instanceof Error ? readError.message : String(readError)
    await context.reply(`Не удалось загрузить вакансии: ${detail}`)
    return
  }
  if (vacancies.length === 0) {
    await context.reply('Список пуст.')
    return
  }
  const keyboard = new InlineKeyboard()
  const lines: string[] = ['<b>Вакансии</b>']
  vacancies.forEach((vacancy, index) => {
    const shortTitle =
      vacancy.title.en.length > 48 ? `${vacancy.title.en.slice(0, 45)}…` : vacancy.title.en
    lines.push(`${index + 1}. ${escapeHtml(shortTitle)}`)
    lines.push(`   <code>${vacancy.id}</code> · ${escapeHtml(vacancy.createdAt.slice(0, 10))}`)
    keyboard.text(`Удалить ${index + 1}`, `dreq:${vacancy.id}`).row()
  })
  const body = lines.join('\n')
  if (body.length > telegramMessageSafeMaxLength) {
    await context.reply(
      `Слишком много вакансий для одного сообщения (${vacancies.length} шт.). Используйте /show &lt;id&gt; по UUID из таблицы Supabase или сократите список.`,
      { parse_mode: 'HTML' },
    )
    return
  }
  try {
    await context.reply(body, { parse_mode: 'HTML', reply_markup: keyboard })
  } catch (sendError) {
    const detail = sendError instanceof Error ? sendError.message : String(sendError)
    await context.reply(`Не удалось отправить список (Telegram): ${detail}`)
  }
})

bot.command('show', async (context) => {
  clearWizard(requireUserId(context))
  const text = context.message?.text ?? ''
  const identifier = text.split(/\s+/).slice(1).join(' ').trim()
  if (!identifier) {
    await context.reply('Укажите id: /show &lt;uuid&gt;')
    return
  }
  const vacancies = await readVacanciesForBot(projectRootDirectory, environment)
  const vacancy = vacancies.find((item) => item.id === identifier)
  if (!vacancy) {
    await context.reply('Вакансия не найдена.')
    return
  }
  const body = formatVacancyForTelegram(vacancy)
  const chunks = chunkTelegramText(body, 4000)
  for (const chunk of chunks) {
    await context.reply(chunk, { parse_mode: 'HTML' })
  }
})

bot.command('add', async (context) => {
  try {
    wizardByChatId.set(requireUserId(context), { kind: 'add', phase: 'title_en' })
    await context.reply(
      'Шаг 1/6: отправьте <b>заголовок вакансии на английском</b> (обязательно).',
      { parse_mode: 'HTML' },
    )
  } catch (sendError) {
    const detail = sendError instanceof Error ? sendError.message : String(sendError)
    await context.reply(`Не удалось начать /add: ${detail}`)
  }
})

bot.callbackQuery(/^dreq:(.+)$/, async (context) => {
  const vacancyId = context.match[1]
  await acknowledgeCallbackQuery(context)
  try {
    const vacancies = await readVacanciesForBot(projectRootDirectory, environment)
    const vacancy = vacancies.find((item) => item.id === vacancyId)
    const titlePreview = vacancy ? vacancy.title.en.slice(0, 80) : vacancyId
    const confirmKeyboard = new InlineKeyboard()
      .text('Да, удалить', `dyes:${vacancyId}`)
      .text('Отмена', `dno:${vacancyId}`)
    await context.reply(`Удалить вакансию?\n<b>${escapeHtml(titlePreview)}</b>`, {
      parse_mode: 'HTML',
      reply_markup: confirmKeyboard,
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    await context.reply(`Не удалось открыть подтверждение удаления: ${detail}`)
  }
})

bot.callbackQuery(/^dyes:(.+)$/, async (context) => {
  const vacancyId = context.match[1]
  await acknowledgeCallbackQuery(context)
  let removed = false
  try {
    removed = await removeVacancyByIdUnified(projectRootDirectory, environment, vacancyId)
  } catch (removeError) {
    const detail = removeError instanceof Error ? removeError.message : String(removeError)
    await context.reply(`Не удалось удалить вакансию: ${detail}`)
    return
  }
  const messageText = removed
    ? `Вакансия <code>${vacancyId}</code> удалена.`
    : 'Запись не найдена.'
  try {
    await context.editMessageText(messageText, { parse_mode: 'HTML' })
  } catch {
    await context.reply(messageText, { parse_mode: 'HTML' })
  }
})

bot.callbackQuery(/^dno:/, async (context) => {
  await acknowledgeCallbackQuery(context)
  try {
    await context.editMessageText('Удаление отменено.')
  } catch {
    await context.reply('Удаление отменено.')
  }
})

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatVacancyForTelegram(vacancy: Vacancy): string {
  const blocks = [
    `<b>ID</b> <code>${vacancy.id}</code>`,
    `<b>Created</b> ${escapeHtml(vacancy.createdAt)}`,
    '',
    '<b>Title EN</b>',
    escapeHtml(vacancy.title.en),
  ]
  if (vacancy.title.ru) {
    blocks.push('', '<b>Title RU</b>', escapeHtml(vacancy.title.ru))
  }
  if (vacancy.title.uk) {
    blocks.push('', '<b>Title UK</b>', escapeHtml(vacancy.title.uk))
  }
  blocks.push('', '<b>Requirements EN</b>', escapeHtml(vacancy.requirements.en))
  if (vacancy.requirements.ru) {
    blocks.push('', '<b>Requirements RU</b>', escapeHtml(vacancy.requirements.ru))
  }
  if (vacancy.requirements.uk) {
    blocks.push('', '<b>Requirements UK</b>', escapeHtml(vacancy.requirements.uk))
  }
  return blocks.join('\n')
}

async function handleWizardSkipIfApplicable(context: Context): Promise<boolean> {
  const userId = context.from?.id
  if (userId === undefined) {
    return false
  }
  const wizard = wizardByChatId.get(userId)
  if (!wizard || wizard.kind !== 'add') {
    return false
  }
  const rawText = context.message?.text?.trim() ?? ''
  if (!isWizardSkipMessage(rawText)) {
    return false
  }
  if (wizard.phase === 'title_ru') {
    wizardByChatId.set(userId, {
      kind: 'add',
      phase: 'title_uk',
      draft: { titleEn: wizard.draft.titleEn, reqEn: wizard.draft.reqEn },
    })
    await context.reply(
      'Шаг 5/6: <b>заголовок на украинском</b> или напишите слово <b>skip</b> или <b>скип</b> (без слэша), чтобы пропустить UK.',
      { parse_mode: 'HTML' },
    )
    return true
  }
  if (wizard.phase === 'title_uk') {
    const saved = await saveVacancyFromDraft(context, wizard.draft)
    if (saved) {
      clearWizard(userId)
    }
    return true
  }
  return false
}

bot.command('skip', async (context) => {
  const handled = await handleWizardSkipIfApplicable(context)
  if (!handled) {
    await context.reply(
      'Пропуск только на шагах <b>3</b> и <b>5</b> (заголовок RU или UK). Обычным текстом: <b>skip</b> или <b>скип</b> (без слэша).',
      { parse_mode: 'HTML' },
    )
  }
})

bot.on('message:text', async (context, next) => {
  const userId = context.from?.id
  if (userId === undefined) {
    return next()
  }
  const wizard = wizardByChatId.get(userId)
  if (!wizard || wizard.kind !== 'add') {
    return next()
  }
  const rawText = context.message.text.trim()
  if (wizard.phase === 'title_ru' || wizard.phase === 'title_uk') {
    const skipHandled = await handleWizardSkipIfApplicable(context)
    if (skipHandled) {
      return
    }
  }
  if (rawText.startsWith('/')) {
    return next()
  }

  if (wizard.phase === 'title_en') {
    if (!rawText) {
      await context.reply('Заголовок не может быть пустым.')
      return
    }
    wizardByChatId.set(userId, { kind: 'add', phase: 'req_en', titleEn: rawText })
    await context.reply(
      'Шаг 2/6: отправьте <b>требования на английском</b> (можно несколько строк).',
      { parse_mode: 'HTML' },
    )
    return
  }

  if (wizard.phase === 'req_en') {
    if (!rawText) {
      await context.reply('Требования EN не могут быть пустыми.')
      return
    }
    wizardByChatId.set(userId, {
      kind: 'add',
      phase: 'title_ru',
      draft: { titleEn: wizard.titleEn, reqEn: rawText },
    })
    await context.reply(
      'Шаг 3/6: <b>заголовок на русском</b> или напишите слово <b>skip</b> или <b>скип</b> (без слэша), чтобы пропустить RU.',
      { parse_mode: 'HTML' },
    )
    return
  }

  if (wizard.phase === 'title_ru') {
    wizardByChatId.set(userId, {
      kind: 'add',
      phase: 'req_ru',
      draft: { ...wizard.draft, titleRu: rawText },
    })
    await context.reply('Шаг 4/6: отправьте <b>требования на русском</b>.', { parse_mode: 'HTML' })
    return
  }

  if (wizard.phase === 'req_ru') {
    if (!rawText) {
      await context.reply('Требования RU не могут быть пустыми, если задан русский заголовок.')
      return
    }
    wizardByChatId.set(userId, {
      kind: 'add',
      phase: 'title_uk',
      draft: { ...wizard.draft, reqRu: rawText },
    })
    await context.reply(
      'Шаг 5/6: <b>заголовок на украинском</b> или напишите слово <b>skip</b> или <b>скип</b> (без слэша), чтобы пропустить UK.',
      { parse_mode: 'HTML' },
    )
    return
  }

  if (wizard.phase === 'title_uk') {
    wizardByChatId.set(userId, {
      kind: 'add',
      phase: 'req_uk',
      draft: { ...wizard.draft, titleUk: rawText },
    })
    await context.reply('Шаг 6/6: отправьте <b>требования на украинском</b>.', { parse_mode: 'HTML' })
    return
  }

  if (wizard.phase === 'req_uk') {
    if (!rawText) {
      await context.reply('Требования UK не могут быть пустыми, если задан украинский заголовок.')
      return
    }
    const saved = await saveVacancyFromDraft(context, { ...wizard.draft, reqUk: rawText })
    if (saved) {
      clearWizard(userId)
    }
  }
})

async function saveVacancyFromDraft(context: Context, draft: AddDraft): Promise<boolean> {
  const vacancy: Vacancy = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    title: {
      en: draft.titleEn.trim(),
      ...(draft.titleRu ? { ru: draft.titleRu.trim() } : {}),
      ...(draft.titleUk ? { uk: draft.titleUk.trim() } : {}),
    },
    requirements: {
      en: draft.reqEn.trim(),
      ...(draft.reqRu ? { ru: draft.reqRu.trim() } : {}),
      ...(draft.reqUk ? { uk: draft.reqUk.trim() } : {}),
    },
  }
  try {
    await appendVacancyUnified(projectRootDirectory, environment, vacancy)
    await context.reply(`Сохранено. ID: <code>${vacancy.id}</code>`, { parse_mode: 'HTML' })
    return true
  } catch (error) {
    console.error('saveVacancyFromDraft', error)
    const usingSupabase = isSupabaseVacanciesWriteConfigured(environment)
    const detail = error instanceof Error ? error.message : String(error)
    const hint = usingSupabase
      ? 'Проверьте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY, миграции таблицы public.vacancies и что ключ service_role не истёк.'
      : 'Проверьте папку data, права на запись и VACANCIES_FILE.'
    const text = `Не удалось сохранить вакансию (${usingSupabase ? 'Supabase' : 'файл'}). ${hint}\n\n${detail}`
    await context.reply(text.length > 3800 ? `${text.slice(0, 3790)}…` : text)
    return false
  }
}

bot.catch(async (botError) => {
  const rootCause = botError.error
  console.error('Vacancies bot: ошибка в обработчике', rootCause)
  if (rootCause instanceof Error && rootCause.stack) {
    console.error(rootCause.stack)
  }
  const chatId = botError.ctx?.chat?.id
  if (chatId === undefined) {
    return
  }
  try {
    const hint =
      rootCause instanceof Error ? rootCause.message.slice(0, 500) : String(rootCause).slice(0, 500)
    await botError.ctx.reply(
      `Ошибка бота (см. консоль, где запущен npm run bot). Кратко: ${hint}`,
    )
  } catch {
    /* reply может упасть (чат недоступен и т.д.) */
  }
})

await bot.start({
  onStart: (botInformation) => {
    const username = botInformation.username ?? '(no username)'
    console.info(`Vacancies bot @${username} running (long polling)`)
  },
})
