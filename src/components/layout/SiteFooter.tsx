import { useTranslation } from 'react-i18next'

export function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">{t('brand.name')}</p>
            <p className="mt-2 max-w-sm text-sm text-muted">{t('footer.tagline')}</p>
            <p className="mt-4 text-xs text-muted-foreground">{t('messages.core')}</p>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted">Email: </span>
              <a
                className="text-foreground underline-offset-4 hover:underline"
                href={`mailto:${t('footer.email')}`}
              >
                {t('footer.email')}
              </a>
            </p>
            <p>
              <span className="text-muted">Telegram: </span>
              <a
                className="text-foreground underline-offset-4 hover:underline"
                href={`https://t.me/${t('footer.telegram').replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
              >
                {t('footer.telegram')}
              </a>
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-4">
            <span className="cursor-default text-muted-foreground">{t('footer.privacy')}</span>
            <span className="cursor-default text-muted-foreground">{t('footer.terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
