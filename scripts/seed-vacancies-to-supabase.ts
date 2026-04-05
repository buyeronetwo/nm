/**
 * Однократный импорт вакансий в Supabase (service role).
 * Требует в .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Запуск: npx tsx scripts/seed-vacancies-to-supabase.ts
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'

import { createSupabaseServiceRoleClient, resolveSupabaseServiceRoleKey, resolveSupabaseUrl } from '../server/supabase/clientFactory'
import { parseVacanciesJson } from '../server/vacancies/types'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(scriptDirectory, '..')

config({ path: join(projectRoot, '.env') })
config({ path: join(projectRoot, '.env.local'), override: true })

async function main(): Promise<void> {
  const environment = process.env as Record<string, string | undefined>
  const url = resolveSupabaseUrl(environment)
  const serviceKey = resolveSupabaseServiceRoleKey(environment)

  if (!url || !serviceKey) {
    console.error('Нужны SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env / .env.local')
    process.exit(1)
  }

  const dataPath = existsSync(join(projectRoot, 'data', 'vacancies.json'))
    ? join(projectRoot, 'data', 'vacancies.json')
    : join(projectRoot, 'data', 'vacancies.seed.json')

  const raw = readFileSync(dataPath, 'utf8')
  const vacancies = parseVacanciesJson(raw)

  if (vacancies.length === 0) {
    console.info('Нет записей для импорта.')
    return
  }

  const client = createSupabaseServiceRoleClient(url, serviceKey)
  const rows = vacancies.map((vacancy) => ({
    id: vacancy.id,
    created_at: vacancy.createdAt,
    title: vacancy.title,
    requirements: vacancy.requirements,
  }))

  const { error } = await client.from('vacancies').upsert(rows, { onConflict: 'id' })

  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  console.info(`Импортировано ${rows.length} вакансий из ${dataPath}`)
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
