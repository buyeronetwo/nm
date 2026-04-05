import type { Handler } from '@netlify/functions'

import { parseLeadBody, submitLeadToTelegram } from '../../server/api/leadTelegram'
import { insertLeadToSupabaseIfConfigured, isSupabaseLeadsConfigured } from '../../server/leads/insertLeadToSupabase'

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' }

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: jsonHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, error: 'method_not_allowed' }),
    }
  }

  let parsedBody: unknown
  try {
    parsedBody = event.body ? (JSON.parse(event.body) as unknown) : {}
  } catch {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, error: 'invalid_json' }),
    }
  }

  const parsedLead = parseLeadBody(parsedBody)
  if (!parsedLead.ok) {
    return {
      statusCode: 422,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, error: 'invalid_payload' }),
    }
  }

  const environment = process.env as Record<string, string | undefined>
  const result = await submitLeadToTelegram(environment, parsedLead.data)

  if (!result.ok) {
    const body: Record<string, unknown> = { ok: false, error: result.error }
    if (result.hint) {
      body.hint = result.hint
    }
    return {
      statusCode: result.httpStatus,
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }
  }

  if (isSupabaseLeadsConfigured(environment)) {
    try {
      await insertLeadToSupabaseIfConfigured(environment, parsedLead.data)
    } catch (error) {
      console.error('[lead] Supabase insert after Telegram', error)
    }
  }

  return {
    statusCode: 200,
    headers: jsonHeaders,
    body: JSON.stringify({ ok: true }),
  }
}
