import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function HtmlLangSync() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const languageCode = i18n.language.split('-')[0] ?? 'ru'
    document.documentElement.lang = languageCode
    document.title = i18n.t('meta.title')
  }, [i18n, i18n.language])

  return null
}
