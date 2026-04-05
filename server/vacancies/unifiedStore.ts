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
 * Чтение: при настроенном Supabase (URL + anon) — из БД; иначе из JSON-файла.
 * Для бота при записи используется service role; чтение для бота — service (если есть) иначе anon.
 */
export async function readVacanciesUnified(
  projectRoot: string,
  environment: Record<string, string | undefined>,
): Promise<Vacancy[]> {
  if (isSupabaseVacanciesReadConfigured(environment)) {
    return readVacanciesFromSupabaseAnon(environment)
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
