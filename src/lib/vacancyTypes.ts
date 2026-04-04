export type VacancyLocaleBlock = {
  en: string
  ru?: string
  uk?: string
}

export type Vacancy = {
  id: string
  createdAt: string
  title: VacancyLocaleBlock
  requirements: VacancyLocaleBlock
}

export function isVacancyRecord(value: unknown): value is Vacancy {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.createdAt !== 'string') {
    return false
  }
  if (!record.title || typeof record.title !== 'object' || !record.requirements || typeof record.requirements !== 'object') {
    return false
  }
  const title = record.title as Record<string, unknown>
  const requirements = record.requirements as Record<string, unknown>
  return typeof title.en === 'string' && typeof requirements.en === 'string'
}

export function parseVacanciesResponse(value: unknown): Vacancy[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter(isVacancyRecord)
}
