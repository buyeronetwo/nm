import { createSupabaseServiceRoleClient, resolveSupabaseServiceRoleKey, resolveSupabaseUrl } from '../supabase/clientFactory'

import type { LeadPayload } from '../api/leadTelegram'

export function isSupabaseLeadsConfigured(environment: Record<string, string | undefined>): boolean {
  return Boolean(resolveSupabaseUrl(environment) && resolveSupabaseServiceRoleKey(environment))
}

export async function insertLeadToSupabaseIfConfigured(
  environment: Record<string, string | undefined>,
  lead: LeadPayload,
): Promise<void> {
  const url = resolveSupabaseUrl(environment)
  const serviceKey = resolveSupabaseServiceRoleKey(environment)
  if (!url || !serviceKey) {
    return
  }
  const client = createSupabaseServiceRoleClient(url, serviceKey)
  const { error } = await client.from('leads').insert({
    name: lead.name,
    telegram: lead.telegram,
    message: lead.message,
  })
  if (error) {
    console.error('[supabase leads insert]', error.message)
    throw new Error(error.message)
  }
}
