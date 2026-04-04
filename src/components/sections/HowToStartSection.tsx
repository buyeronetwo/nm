import { useTranslation } from 'react-i18next'

import { ShepherdMascot } from '@/components/illustrations/ShepherdMascot'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const stepTranslationKeys = ['step1', 'step2', 'step3', 'step4'] as const

export function HowToStartSection() {
  const { t } = useTranslation()

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="start" className="scroll-mt-24" aria-labelledby="start-heading">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-start">
        <div>
          <ScrollReveal className="mb-8 flex justify-center lg:hidden">
            <div className="w-32">
              <ShepherdMascot className="h-auto w-full" />
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <h2
              id="start-heading"
              className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
            >
              {t('start.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-lg text-muted">{t('start.lead')}</p>
          </ScrollReveal>
          <ol className="mt-10 space-y-6">
            {stepTranslationKeys.map((stepKey, index) => (
              <ScrollReveal key={stepKey} delaySeconds={index * 0.06}>
                <li className="flex gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-black tabular-nums text-accent-foreground shadow-lg shadow-accent/35 ring-2 ring-white/20"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-muted md:text-base">
                    {t(`start.${stepKey}`)}
                  </p>
                </li>
              </ScrollReveal>
            ))}
          </ol>
          <ScrollReveal className="mt-10" delaySeconds={0.2}>
            <p className="max-w-2xl text-pretty text-muted">{t('start.closing')}</p>
            <PrimaryButton className="mt-6" onClick={scrollToContact}>
              {t('cta.leaveRequest')}
            </PrimaryButton>
          </ScrollReveal>
        </div>
        <ScrollReveal className="hidden justify-center lg:flex" delaySeconds={0.12}>
          <div className="sticky top-28 w-40">
            <ShepherdMascot className="h-auto w-full" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
