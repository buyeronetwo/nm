import { useTranslation } from 'react-i18next'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export function CareersSection() {
  const { t } = useTranslation()

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const telegramHandle = t('footer.telegram')
  const telegramPath = telegramHandle.replace(/^@/, '')

  return (
    <section id="careers" className="scroll-mt-24" aria-labelledby="careers-heading">
      <ScrollReveal>
        <h2
          id="careers-heading"
          className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          {t('careers.title')}
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-lg text-muted">{t('careers.lead')}</p>
      </ScrollReveal>

      <ScrollReveal className="mt-10" delaySeconds={0.06}>
        <article className="rounded-2xl border border-white/8 bg-card/85 p-6 shadow-lg shadow-black/40 backdrop-blur-xl md:p-8">
          <h3 className="text-accent-volume text-xl font-bold tracking-tight md:text-2xl">
            {t('careers.roleTitle')}
          </h3>
          <p className="mt-3 text-sm font-medium text-foreground">{t('careers.roleRequirementsLabel')}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t('careers.roleRequirements')}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted">{t('careers.applyIntro')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <PrimaryButton onClick={scrollToContact}>{t('cta.leaveRequest')}</PrimaryButton>
            <a
              className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
              href={`https://t.me/${telegramPath}`}
              target="_blank"
              rel="noreferrer"
            >
              {t('careers.applyTelegram')}
            </a>
          </div>
        </article>
      </ScrollReveal>
    </section>
  )
}
