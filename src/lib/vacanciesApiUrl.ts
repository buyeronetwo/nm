/**
 * URL списка вакансий: продакшен может задать `VITE_VACANCIES_API_URL`, иначе dev/preview `/api/vacancies`.
 */
export function getVacanciesRequestUrl(): string {
  const explicitUrl = import.meta.env.VITE_VACANCIES_API_URL?.trim()
  if (explicitUrl && explicitUrl.length > 0) {
    return explicitUrl
  }
  return '/api/vacancies'
}
