import type { Connect } from 'vite'
import type { Plugin } from 'vite'

type LeadPayload = {
  name: string
  telegram: string
  message: string
}

function escapeHtmlForTelegram(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function parseLeadBody(body: unknown): { ok: true; data: LeadPayload } | { ok: false } {
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

async function readJsonBody(request: Connect.IncomingMessage): Promise<unknown> {
  const bodyBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    request.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    request.on('error', reject)
  })
  const raw = bodyBuffer.toString('utf8')
  if (!raw.trim()) {
    return {}
  }
  return JSON.parse(raw) as unknown
}

function formatTelegramMessage(lead: LeadPayload): string {
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

function attachLeadTelegramHandler(
  middlewares: Connect.Server,
  environment: Record<string, string>,
): void {
  middlewares.use(async (request, response, next) => {
    const requestPath = request.url?.split('?')[0] ?? ''
    if (requestPath !== '/api/lead' || request.method !== 'POST') {
      next()
      return
    }

    const botToken = environment.TELEGRAM_BOT_TOKEN?.trim()
    const chatIdRaw = environment.TELEGRAM_CHAT_ID?.trim()

    const sendJson = (statusCode: number, body: Record<string, unknown>) => {
      response.statusCode = statusCode
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(body))
    }

    if (!botToken || !chatIdRaw) {
      sendJson(503, {
        ok: false,
        error: 'missing_telegram_config',
        hint: 'Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local (see .env.example).',
      })
      return
    }

    let parsedBody: unknown
    try {
      parsedBody = await readJsonBody(request)
    } catch {
      sendJson(400, { ok: false, error: 'invalid_json' })
      return
    }

    const parsedLead = parseLeadBody(parsedBody)
    if (!parsedLead.ok) {
      sendJson(422, { ok: false, error: 'invalid_payload' })
      return
    }

    const chatId = /^-?\d+$/.test(chatIdRaw) ? Number(chatIdRaw) : chatIdRaw
    const messageText = formatTelegramMessage(parsedLead.data)

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
      sendJson(502, { ok: false, error: 'telegram_unreachable' })
      return
    }

    const telegramJson = (await telegramResponse.json()) as { ok?: boolean; description?: string }

    if (!telegramResponse.ok || telegramJson.ok !== true) {
      console.error('[lead-telegram]', telegramJson.description ?? telegramResponse.statusText)
      sendJson(502, { ok: false, error: 'telegram_api_error' })
      return
    }

    sendJson(200, { ok: true })
  })
}

export function leadTelegramApiPlugin(environment: Record<string, string>): Plugin {
  return {
    name: 'lead-telegram-api',
    configureServer(server) {
      attachLeadTelegramHandler(server.middlewares, environment)
    },
    configurePreviewServer(server) {
      attachLeadTelegramHandler(server.middlewares, environment)
    },
  }
}
