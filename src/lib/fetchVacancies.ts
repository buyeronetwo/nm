import { createClient } from '@supabase/supabase-js'

import { getVacanciesRequestUrl } from '@/lib/vacanciesApiUrl'
import { type Vacancy, parseVacanciesResponse } from '@/lib/vacancyTypes'

function mapSupabaseVacancyRows(
  rows: Array<{
    id: string
    created_at: string
    title: unknown
    requirements: unknown
  }>,
): unknown[] {
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    requirements: row.requirements,
  }))
}

/**
 * Сайт: при наличии VITE_SUPABASE_* — чтение из Supabase (RLS, anon).
 * Иначе — прежний HTTP (локальный /api/vacancies, Netlify /vacancies.json и т.д.).
 */
export async function fetchVacanciesForCareersSection(): Promise<Vacancy[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (supabaseUrl && supabaseAnonKey) {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await client
      .from('vacancies')
      .select('id, created_at, title, requirements')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }
    return parseVacanciesResponse(mapSupabaseVacancyRows(data ?? []))
  }

  const response = await fetch(getVacanciesRequestUrl(), {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`vacancies_http_${response.status}`)
  }
  const jsonUnknown: unknown = await response.json()
  return parseVacanciesResponse(jsonUnknown)
}
