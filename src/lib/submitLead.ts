import type { LeadFormValues } from '@/lib/leadSchema'

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; errorCode: 'network' | 'server' }

const leadApiUrl = import.meta.env.VITE_LEAD_API_URL as string | undefined

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}

/**
 * Отправка лида. Если задан `VITE_LEAD_API_URL` — POST JSON на endpoint.
 * Иначе — демо-заглушка (лог в консоль + задержка).
 */
export async function submitLead(payload: LeadFormValues): Promise<SubmitLeadResult> {
  if (leadApiUrl && leadApiUrl.length > 0) {
    try {
      const response = await fetch(leadApiUrl, {
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

  await delay(650)
  console.info('[submitLead demo]', payload)
  return { ok: true }
}
