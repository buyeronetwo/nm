import { useTranslation } from 'react-i18next'

import { ShepherdMascot } from '@/components/illustrations/ShepherdMascot'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const cardKeys = ['stability', 'quality', 'support', 'professionalism', 'transparency'] as const

export function WhyUsSection() {
  const { t } = useTranslation()

  return (
    <section
      id="why"
      className="scroll-mt-24"
      aria-labelledby="why-heading"
    >
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-14">
        <ScrollReveal className="md:w-2/5">
          <div className="mx-auto flex max-w-[140px] justify-center md:mx-0 md:max-w-[160px]">
            <ShepherdMascot className="h-auto w-full" />
          </div>
        </ScrollReveal>
        <div className="flex-1 space-y-8">
          <ScrollReveal>
            <h2
              id="why-heading"
              className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
            >
              {t('why.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-lg text-muted">{t('why.lead')}</p>
          </ScrollReveal>
          <ul className="grid gap-4 sm:grid-cols-2">
            {cardKeys.map((key, index) => (
              <ScrollReveal key={key} delaySeconds={index * 0.05}>
                <li className="h-full rounded-2xl border border-white/10 bg-card/70 p-6 text-card-foreground shadow-lg shadow-black/15 backdrop-blur-xl">
                  <h3 className="text-base font-semibold text-foreground">{t(`why.${key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t(`why.${key}.body`)}
                  </p>
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
