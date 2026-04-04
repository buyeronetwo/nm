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

export function isVacancyLocaleBlock(value: unknown): value is VacancyLocaleBlock {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return typeof record.en === 'string' && record.en.trim().length > 0
}

export function isVacancy(value: unknown): value is Vacancy {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.createdAt === 'string' &&
    isVacancyLocaleBlock(record.title) &&
    isVacancyLocaleBlock(record.requirements)
  )
}

export function parseVacanciesJson(raw: string): Vacancy[] {
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    return []
  }
  return parsed.filter(isVacancy)
}
