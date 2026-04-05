export type LeadPayload = {
  name: string
  telegram: string
  message: string
}

export type LeadSubmitResult =
  | { ok: true }
  | { ok: false; httpStatus: number; error: string; hint?: string }

function escapeHtmlForTelegram(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function parseLeadBody(body: unknown): { ok: true; data: LeadPayload } | { ok: false } {
  if (!body || typeof body !== 'object') {
    return { ok: false }
  }
  const record = body as Record<string, unknown>
  if (!isNonEmptyString(record.name) || !isNonEmptyString(record.telegram) || !isNonEmptyString(record.message)) {
    return { ok: false }
  }
  return {
    ok: true,
    data: {
      name: record.name.trim(),
      telegram: record.telegram.trim(),
      message: record.message.trim(),
    },
  }
}

export function formatTelegramMessage(lead: LeadPayload): string {
  return [
    '<b>Новая заявка с сайта</b>',
    '',
    `<b>Имя:</b> ${escapeHtmlForTelegram(lead.name)}`,
    `<b>Telegram:</b> ${escapeHtmlForTelegram(lead.telegram)}`,
    '',
    '<b>Сообщение:</b>',
    escapeHtmlForTelegram(lead.message),
  ].join('\n')
}

export async function submitLeadToTelegram(
  environment: Record<string, string | undefined>,
  lead: LeadPayload,
): Promise<LeadSubmitResult> {
  const botToken = environment.TELEGRAM_BOT_TOKEN?.trim()
  const chatIdRaw = environment.TELEGRAM_CHAT_ID?.trim()

  if (!botToken || !chatIdRaw) {
    return {
      ok: false,
      httpStatus: 503,
      error: 'missing_telegram_config',
      hint: 'Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (Netlify: Site settings → Environment variables).',
    }
  }

  const chatId = /^-?\d+$/.test(chatIdRaw) ? Number(chatIdRaw) : chatIdRaw
  const messageText = formatTelegramMessage(lead)

  let telegramResponse: Response
  try {
    telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
  } catch {
    return { ok: false, httpStatus: 502, error: 'telegram_unreachable' }
  }

  const telegramJson = (await telegramResponse.json()) as { ok?: boolean; description?: string }

  if (!telegramResponse.ok || telegramJson.ok !== true) {
    console.error('[lead-telegram]', telegramJson.description ?? telegramResponse.statusText)
    return { ok: false, httpStatus: 502, error: 'telegram_api_error' }
  }

  return { ok: true }
}
