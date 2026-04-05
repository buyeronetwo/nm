/**
 * Показать getWebhookInfo для бота из .env — если задан webhook, long polling (npm run bot) не получает апдейты.
 * Запуск: npx tsx scripts/telegram-webhook-info.ts
 */
import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRootDirectory = path.resolve(scriptDirectory, '..')

config({ path: path.join(projectRootDirectory, '.env') })
config({ path: path.join(projectRootDirectory, '.env.local'), override: true })

const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
if (!botToken) {
  console.error('Нужен TELEGRAM_BOT_TOKEN в .env или .env.local')
  process.exit(1)
}

type TelegramWebhookInfoResponse = {
  ok?: boolean
  result?: {
    url?: string
    has_custom_certificate?: boolean
    pending_update_count?: number
    last_error_date?: number
    last_error_message?: string
    max_connections?: number
    allowed_updates?: string[]
  }
}

const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
const payload = (await response.json()) as TelegramWebhookInfoResponse

if (!payload.ok) {
  console.error('Telegram API ответил не ok:', JSON.stringify(payload, null, 2))
  process.exit(1)
}

const webhookUrl = payload.result?.url ?? ''
console.info('--- getWebhookInfo ---')
console.info('url:', webhookUrl.length > 0 ? webhookUrl : '(пусто — апдейты можно забирать через getUpdates / npm run bot)')
console.info('pending_update_count:', payload.result?.pending_update_count ?? 0)
if (payload.result?.last_error_message) {
  console.info('last_error_message:', payload.result.last_error_message)
}

if (webhookUrl.length > 0) {
  console.info('')
  console.info(
    'Задан webhook: long polling в vacancies-боте не увидит команды, пока webhook не снят.',
  )
  console.info('Запустите npm run bot (он вызывает deleteWebhook) или вручную:')
  console.info(`  curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook"`)
}
