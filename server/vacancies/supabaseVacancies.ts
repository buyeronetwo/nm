import type { SupabaseClient } from '@supabase/supabase-js'

import {
  createSupabaseBrowserLikeClient,
  createSupabaseServiceRoleClient,
  isSupabaseVacanciesReadConfigured,
  isSupabaseVacanciesWriteConfigured,
  resolveSupabaseAnonKey,
  resolveSupabaseServiceRoleKey,
  resolveSupabaseUrl,
} from '../supabase/clientFactory'
import { type Vacancy, isVacancy } from './types'

type VacancyRow = {
  id: string
  created_at: string
  title: unknown
  requirements: unknown
}

function rowToVacancy(row: VacancyRow): Vacancy | null {
  const candidate = {
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    requirements: row.requirements,
  }
  return isVacancy(candidate) ? candidate : null
}

export async function readVacanciesFromSupabaseAnon(
  environment: Record<string, string | undefined>,
): Promise<Vacancy[]> {
  const url = resolveSupabaseUrl(environment)
  const anonKey = resolveSupabaseAnonKey(environment)
  if (!url || !anonKey) {
    return []
  }
  const client = createSupabaseBrowserLikeClient(url, anonKey)
  const { data, error } = await client
    .from('vacancies')
    .select('id, created_at, title, requirements')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[supabase vacancies read]', error.message)
    return []
  }
  const rows = (data ?? []) as VacancyRow[]
  return rows.map(rowToVacancy).filter((item): item is Vacancy => item !== null)
}

function getServiceClient(environment: Record<string, string | undefined>): SupabaseClient | null {
  const url = resolveSupabaseUrl(environment)
  const serviceKey = resolveSupabaseServiceRoleKey(environment)
  if (!url || !serviceKey) {
    return null
  }
  return createSupabaseServiceRoleClient(url, serviceKey)
}

export async function appendVacancyToSupabase(
  environment: Record<string, string | undefined>,
  vacancy: Vacancy,
): Promise<void> {
  const client = getServiceClient(environment)
  if (!client) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase vacancy writes')
  }
  const { error } = await client.from('vacancies').insert({
    id: vacancy.id,
    created_at: vacancy.createdAt,
    title: vacancy.title,
    requirements: vacancy.requirements,
  })
  if (error) {
    throw new Error(error.message)
  }
}

export async function removeVacancyFromSupabase(
  environment: Record<string, string | undefined>,
  vacancyId: string,
): Promise<boolean> {
  const client = getServiceClient(environment)
  if (!client) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase vacancy writes')
  }
  const { data, error } = await client.from('vacancies').delete().eq('id', vacancyId).select('id')
  if (error) {
    throw new Error(error.message)
  }
  return Array.isArray(data) && data.length > 0
}

export async function readVacanciesFromSupabaseService(
  environment: Record<string, string | undefined>,
): Promise<Vacancy[]> {
  const client = getServiceClient(environment)
  if (!client) {
    return []
  }
  const { data, error } = await client
    .from('vacancies')
    .select('id, created_at, title, requirements')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[supabase vacancies read service]', error.message)
    return []
  }
  const rows = (data ?? []) as VacancyRow[]
  return rows.map(rowToVacancy).filter((item): item is Vacancy => item !== null)
}

export { isSupabaseVacanciesReadConfigured, isSupabaseVacanciesWriteConfigured }
