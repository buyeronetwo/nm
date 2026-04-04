import type { LeadFormValues } from '@/lib/leadSchema'

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; errorCode: 'network' | 'server' }

const explicitLeadApiUrl = (import.meta.env.VITE_LEAD_API_URL as string | undefined)?.trim()

/**
 * POST JSON на `VITE_LEAD_API_URL`, если задан; иначе на относительный `/api/lead`
 * (обрабатывается Vite в `npm run dev` и `npm run preview` при настроенном `.env.local`).
 * На статическом хостинге без бэкенда задайте `VITE_LEAD_API_URL` на свой сервер.
 */
function resolveLeadSubmitUrl(): string {
  if (explicitLeadApiUrl && explicitLeadApiUrl.length > 0) {
    return explicitLeadApiUrl
  }
  return '/api/lead'
}

export async function submitLead(payload: LeadFormValues): Promise<SubmitLeadResult> {
  const targetUrl = resolveLeadSubmitUrl()

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return { ok: false, errorCode: 'server' }
    }

    return { ok: true }
  } catch {
    return { ok: false, errorCode: 'network' }
  }
}
