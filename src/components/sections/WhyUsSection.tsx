import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import whySectionImage from '@/assets/image.png'
import { AnimatedGlassCard } from '@/components/ui/AnimatedGlassCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { usePrefersReducedMotion } from '@/hooks'

/** Натуральный размер src/assets/image.png — под него подстраиваем рамку 2:3 */
const whyPhotoNaturalWidth = 1024
const whyPhotoNaturalHeight = 1536

const cardKeys = [
  'stability',
  'quality',
  'support',
  'professionalism',
  'transparency',
  'scaling',
] as const

export function WhyUsSection() {
  const { t } = useTranslation()
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <section
      id="why"
      className="scroll-mt-24"
      aria-labelledby="why-heading"
    >
      <div className="flex flex-col gap-10 lg:gap-12">
        <ScrollReveal>
          <h2
            id="why-heading"
            className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
          >
            {t('why.title')}
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted lg:mt-5 lg:max-w-3xl lg:text-xl">
            {t('why.lead')}
          </p>
        </ScrollReveal>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-14">
          <ScrollReveal className="flex w-full shrink-0 justify-center lg:max-w-[400px] lg:justify-start xl:max-w-[420px]">
            <figure className="mx-auto w-full max-w-[min(88vw,320px)] sm:max-w-[340px] lg:mx-0 lg:max-w-none">
              <div className="relative aspect-2/3 w-full max-lg:mx-auto max-lg:max-w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 shadow-2xl shadow-black/50 sm:max-w-[340px] sm:rounded-3xl lg:max-w-full">
                <img
                  src={whySectionImage}
                  alt={t('why.imageAlt')}
                  width={whyPhotoNaturalWidth}
                  height={whyPhotoNaturalHeight}
                  decoding="async"
                  loading="lazy"
                  sizes="(min-width: 1280px) 440px, (min-width: 1024px) min(42vw, 420px), (min-width: 640px) 360px, min(88vw, 340px)"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </figure>
          </ScrollReveal>

          <ul className="grid min-w-0 flex-1 grid-cols-1 items-start gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-4">
            {cardKeys.map((key, index) => (
              <li key={key} className="min-h-0 w-full">
                <AnimatedGlassCard
                  className="w-full"
                  delaySeconds={index * 0.04}
                  innerClassName="flex flex-col p-4 sm:p-5"
                >
                  <motion.h3
                    className="text-base font-bold leading-tight tracking-tight text-accent sm:text-[1.05rem]"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{
                      duration: 0.42,
                      delay: index * 0.05 + 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {t(`why.${key}.title`)}
                  </motion.h3>
                  <motion.p
                    className="mt-2 text-sm leading-snug text-muted"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{
                      duration: 0.42,
                      delay: index * 0.05 + 0.16,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {t(`why.${key}.body`)}
                  </motion.p>
                </AnimatedGlassCard>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
