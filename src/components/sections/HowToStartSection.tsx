import { useTranslation } from 'react-i18next'

import startSectionImage from '@/assets/work.png'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

/** Натуральный размер src/assets/work.png */
const startPhotoNaturalWidth = 1024
const startPhotoNaturalHeight = 1536

const stepIndexKeys = [1, 2, 3, 4] as const

export function HowToStartSection() {
  const { t } = useTranslation()

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="start" className="scroll-mt-24" aria-labelledby="start-heading">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
        <div className="min-w-0 flex-1">
          <ScrollReveal>
            <h2
              id="start-heading"
              className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
            >
              {t('start.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted lg:mt-5">
              {t('start.lead')}
            </p>
          </ScrollReveal>

          <ScrollReveal className="mt-8 flex justify-center lg:hidden">
            <figure className="mx-auto w-full max-w-[min(88vw,300px)] sm:max-w-[320px]">
              <div className="relative aspect-2/3 w-full overflow-hidden">
                <img
                  src={startSectionImage}
                  alt={t('start.imageAlt')}
                  width={startPhotoNaturalWidth}
                  height={startPhotoNaturalHeight}
                  decoding="async"
                  loading="lazy"
                  sizes="(min-width: 640px) 320px, min(88vw, 300px)"
                  className="h-full w-full object-cover object-[50%_18%]"
                />
              </div>
            </figure>
          </ScrollReveal>

          <ol className="mt-10 space-y-8">
            {stepIndexKeys.map((stepNumber, index) => (
              <ScrollReveal key={stepNumber} delaySeconds={index * 0.06}>
                <li className="flex gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-black tabular-nums text-accent-foreground shadow-lg shadow-accent/35 ring-2 ring-white/10"
                    aria-hidden
                  >
                    {stepNumber}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-base font-semibold leading-snug text-foreground md:text-lg">
                      {t(`start.step${stepNumber}Question`)}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                      {t(`start.step${stepNumber}Answer`)}
                    </p>
                  </div>
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

        <ScrollReveal
          className="hidden w-full shrink-0 justify-center lg:flex lg:max-w-[300px] xl:max-w-[320px]"
          delaySeconds={0.1}
        >
          <figure className="sticky top-28 w-full">
            <div className="relative aspect-2/3 w-full overflow-hidden">
              <img
                src={startSectionImage}
                alt={t('start.imageAlt')}
                width={startPhotoNaturalWidth}
                height={startPhotoNaturalHeight}
                decoding="async"
                loading="lazy"
                sizes="(min-width: 1280px) 320px, 300px"
                className="h-full w-full object-cover object-[50%_18%]"
              />
            </div>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  )
}
