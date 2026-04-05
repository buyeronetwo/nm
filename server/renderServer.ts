import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import express from 'express'

import { parseLeadBody, submitLeadToTelegram } from './api/leadTelegram'
import { insertLeadToSupabaseIfConfigured, isSupabaseLeadsConfigured } from './leads/insertLeadToSupabase'
import { readVacanciesUnified } from './vacancies/unifiedStore'

const serverFileDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRootDirectory = path.resolve(serverFileDirectory, '..')

config({ path: path.join(projectRootDirectory, '.env') })
config({ path: path.join(projectRootDirectory, '.env.local'), override: true })

const environment = process.env as Record<string, string | undefined>
const distDirectory = path.join(projectRootDirectory, 'dist')
const portNumber = Number.parseInt(process.env.PORT ?? '8787', 10)

const application = express()
application.use(express.json({ limit: '64kb' }))

application.get('/health', (_request, response) => {
  response.status(200).json({ ok: true })
})

application.get('/api/vacancies', async (_request, response) => {
  try {
    const vacanciesList = await readVacanciesUnified(projectRootDirectory, environment)
    response.setHeader('Cache-Control', 'no-store')
    response.status(200).json(vacanciesList)
  } catch {
    response.status(500).json({ ok: false, error: 'vacancies_read_failed' })
  }
})

application.post('/api/lead', async (request, response) => {
  const parsedLead = parseLeadBody(request.body)
  if (!parsedLead.ok) {
    response.status(422).json({ ok: false, error: 'invalid_payload' })
    return
  }
  const submitResult = await submitLeadToTelegram(environment, parsedLead.data)
  if (!submitResult.ok) {
    const payload: Record<string, unknown> = { ok: false, error: submitResult.error }
    if (submitResult.hint) {
      payload.hint = submitResult.hint
    }
    response.status(submitResult.httpStatus).json(payload)
    return
  }
  if (isSupabaseLeadsConfigured(environment)) {
    try {
      await insertLeadToSupabaseIfConfigured(environment, parsedLead.data)
    } catch (error) {
      console.error('[renderServer] Supabase insert after Telegram', error)
    }
  }
  response.status(200).json({ ok: true })
})

application.use(express.static(distDirectory, { index: false }))

application.use((request, response, next) => {
  if (request.method !== 'GET' || request.path.startsWith('/api/')) {
    next()
    return
  }
  response.sendFile(path.join(distDirectory, 'index.html'), (sendFileError) => {
    if (sendFileError) {
      next(sendFileError)
    }
  })
})

application.use((request, response) => {
  if (request.path.startsWith('/api/')) {
    response.status(404).json({ ok: false, error: 'not_found' })
    return
  }
  response.status(404).type('text/plain').send('Not found')
})

application.listen(portNumber, () => {
  console.info(`[renderServer] listening on port ${portNumber}`)
  startVacanciesBotSidecarIfEnabled()
})

function startVacanciesBotSidecarIfEnabled(): void {
  const flag = environment.RUN_TELEGRAM_VACANCIES_BOT?.trim().toLowerCase()
  if (flag !== 'true' && flag !== '1' && flag !== 'yes') {
    console.info('[renderServer] vacancies bot sidecar disabled (set RUN_TELEGRAM_VACANCIES_BOT=true to enable)')
    return
  }
  const childProcess = spawn('npm', ['run', 'bot'], {
    cwd: projectRootDirectory,
    env: process.env,
    stdio: 'inherit',
  })
  childProcess.on('exit', (exitCode, exitSignal) => {
    console.error('[renderServer] vacancies bot child exited', { exitCode, exitSignal })
  })
  console.info('[renderServer] started vacancies Telegram bot sidecar (npm run bot)')
}
