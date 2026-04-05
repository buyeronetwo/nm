/// <reference types="vite/client" />

declare module '*.mp4' {
  const sourceUrl: string
  export default sourceUrl
}

interface ImportMetaEnv {
  readonly VITE_LEAD_API_URL?: string
  /** Публичный GET JSON вакансий (если не задан — `/api/vacancies` на dev/preview) */
  readonly VITE_VACANCIES_API_URL?: string
  /** Supabase: публичный URL проекта (anon + RLS для vacancies) */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase: anon key (только то, что разрешено RLS) */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Прямой URL mp4/webm для фона hero (опционально) */
  readonly VITE_HERO_VIDEO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
