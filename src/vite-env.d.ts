/// <reference types="vite/client" />

declare module '*.mp4' {
  const sourceUrl: string
  export default sourceUrl
}

interface ImportMetaEnv {
  readonly VITE_LEAD_API_URL?: string
  /** Прямой URL mp4/webm для фона hero (опционально) */
  readonly VITE_HERO_VIDEO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
