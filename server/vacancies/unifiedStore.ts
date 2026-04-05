import {
  appendVacancyToSupabase,
  isSupabaseVacanciesReadConfigured,
  isSupabaseVacanciesWriteConfigured,
  readVacanciesFromSupabaseAnon,
  readVacanciesFromSupabaseService,
  removeVacancyFromSupabase,
} from './supabaseVacancies'
import { type Vacancy } from './types'
import { appendVacancy, readVacancies, removeVacancyById } from './store'

/**
 * Чтение для dev/preview `/api/vacancies`: сначала anon (как у браузера с VITE_SUPABASE_*).
 * Если задан только service role (бот пишет в БД, anon в .env не положили) — читаем через service,
 * иначе список на сайте оставался бы из файла, а бот — в Supabase.
 */
export async function readVacanciesUnified(
  projectRoot: string,
  environment: Record<string, string | undefined>,
): Promise<Vacancy[]> {
  if (isSupabaseVacanciesReadConfigured(environment)) {
    return readVacanciesFromSupabaseAnon(environment)
  }
  if (isSupabaseVacanciesWriteConfigured(environment)) {
    return readVacanciesFromSupabaseService(environment)
  }
  return readVacancies(projectRoot, environment as Record<string, string>)
}

export async function readVacanciesForBot(
  projectRoot: string,
  environment: Record<string, string | undefined>,
): Promise<Vacancy[]> {
  if (isSupabaseVacanciesWriteConfigured(environment)) {
    return readVacanciesFromSupabaseService(environment)
  }
  if (isSupabaseVacanciesReadConfigured(environment)) {
    return readVacanciesFromSupabaseAnon(environment)
  }
  return readVacancies(projectRoot, environment as Record<string, string>)
}

export async function appendVacancyUnified(
  projectRoot: string,
  environment: Record<string, string | undefined>,
  vacancy: Vacancy,
): Promise<void> {
  if (isSupabaseVacanciesWriteConfigured(environment)) {
    await appendVacancyToSupabase(environment, vacancy)
    return
  }
  await appendVacancy(projectRoot, environment as Record<string, string>, vacancy)
}

export async function removeVacancyByIdUnified(
  projectRoot: string,
  environment: Record<string, string | undefined>,
  vacancyId: string,
): Promise<boolean> {
  if (isSupabaseVacanciesWriteConfigured(environment)) {
    return removeVacancyFromSupabase(environment, vacancyId)
  }
  return removeVacancyById(projectRoot, environment as Record<string, string>, vacancyId)
}
