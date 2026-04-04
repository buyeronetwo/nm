import type { VacancyLocaleBlock } from '@/lib/vacancyTypes'

/**
 * Текущий язык i18n → значение поля; для ru/uk при отсутствии — fallback на en.
 */
export function pickLocalizedBlock(block: VacancyLocaleBlock, activeLanguage: string): string {
  const languageCode = activeLanguage.split('-')[0] ?? 'en'
  if (languageCode === 'ru') {
    const localized = block.ru?.trim()
    if (localized && localized.length > 0) {
      return localized
    }
  }
  if (languageCode === 'uk') {
    const localized = block.uk?.trim()
    if (localized && localized.length > 0) {
      return localized
    }
  }
  return block.en.trim()
}
