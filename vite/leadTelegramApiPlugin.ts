import type { Connect } from 'vite'
import type { Plugin } from 'vite'

import { parseLeadBody, submitLeadToTelegram } from '../server/api/leadTelegram'
import { readVacanciesUnified } from '../server/vacancies/unifiedStore'

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

function attachVacanciesReadHandler(
  middlewares: Connect.Server,
  environment: Record<string, string>,
  projectRootDir: string,
): void {
  middlewares.use(async (request, response, next) => {
    const requestPath = request.url?.split('?')[0] ?? ''
    if (requestPath !== '/api/vacancies' || request.method !== 'GET') {
      next()
      return
    }
    try {
      const vacanciesList = await readVacanciesUnified(projectRootDir, environment)
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.setHeader('Cache-Control', 'no-store')
      response.end(JSON.stringify(vacanciesList))
    } catch (error) {
      console.error('[api/vacancies]', error)
      response.statusCode = 500
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.end(JSON.stringify({ ok: false, error: 'vacancies_read_failed' }))
    }
  })
}

function attachLeadTelegramHandler(middlewares: Connect.Server, environment: Record<string, string>): void {
  middlewares.use(async (request, response, next) => {
    const requestPath = request.url?.split('?')[0] ?? ''
    if (requestPath !== '/api/lead' || request.method !== 'POST') {
      next()
      return
    }

    const sendJson = (statusCode: number, body: Record<string, unknown>) => {
      response.statusCode = statusCode
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(body))
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

    const result = await submitLeadToTelegram(environment, parsedLead.data)
    if (!result.ok) {
      const payload: Record<string, unknown> = { ok: false, error: result.error }
      if (result.hint) {
        payload.hint = result.hint
      }
      sendJson(result.httpStatus, payload)
      return
    }

    sendJson(200, { ok: true })
  })
}

export function leadTelegramApiPlugin(
  environment: Record<string, string>,
  projectRootDir: string,
): Plugin {
  return {
    name: 'lead-telegram-api',
    configureServer(server) {
      attachVacanciesReadHandler(server.middlewares, environment, projectRootDir)
      attachLeadTelegramHandler(server.middlewares, environment)
    },
    configurePreviewServer(server) {
      attachVacanciesReadHandler(server.middlewares, environment, projectRootDir)
      attachLeadTelegramHandler(server.middlewares, environment)
    },
  }
}
