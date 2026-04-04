import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/cn'
import { type LeadFormValues, leadFormSchema } from '@/lib/leadSchema'
import { submitLead } from '@/lib/submitLead'

export function ContactSection() {
  const { t } = useTranslation()
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      telegram: '',
      message: '',
    },
  })

  async function onSubmit(values: LeadFormValues) {
    setFormStatus('idle')
    const result = await submitLead(values)
    if (result.ok) {
      setFormStatus('success')
      reset()
      return
    }
    setFormStatus('error')
  }

  function translateFieldError(messageKey: string | undefined) {
    if (!messageKey) {
      return undefined
    }
    return t(`contact.errors.${messageKey}`)
  }

  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-border pt-16"
      aria-labelledby="contact-heading"
    >
      <ScrollReveal>
        <h2
          id="contact-heading"
          className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          {t('contact.title')}
        </h2>
        <p className="mt-2 text-muted">{t('contact.subtitle')}</p>
      </ScrollReveal>

      <ScrollReveal className="mt-10" delaySeconds={0.06}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto max-w-xl space-y-5 rounded-2xl border border-white/8 bg-card/90 p-6 text-card-foreground shadow-lg shadow-black/40 backdrop-blur-xl md:p-8"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium text-foreground" htmlFor="lead-name">
              {t('contact.name')} <span className="text-accent">*</span>
            </label>
            <input
              id="lead-name"
              autoComplete="name"
              className={cn(
                'mt-1.5 w-full rounded-lg border bg-black/35 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
                errors.name ? 'border-accent' : 'border-white/10',
              )}
              {...register('name')}
            />
            {errors.name?.message ? (
              <p className="mt-1 text-xs text-accent" role="alert">
                {translateFieldError(errors.name.message)}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground" htmlFor="lead-phone">
              {t('contact.phone')}{' '}
              <span className="text-muted-foreground">({t('contact.optional')})</span>
            </label>
            <input
              id="lead-phone"
              type="tel"
              autoComplete="tel"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
              {...register('phone')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground" htmlFor="lead-telegram">
              {t('contact.telegram')} <span className="text-accent">*</span>
            </label>
            <input
              id="lead-telegram"
              autoComplete="username"
              placeholder="@username"
              className={cn(
                'mt-1.5 w-full rounded-lg border bg-black/35 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
                errors.telegram ? 'border-accent' : 'border-white/10',
              )}
              {...register('telegram')}
            />
            {errors.telegram?.message ? (
              <p className="mt-1 text-xs text-accent" role="alert">
                {translateFieldError(errors.telegram.message)}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground" htmlFor="lead-message">
              {t('contact.message')} <span className="text-accent">*</span>
            </label>
            <textarea
              id="lead-message"
              rows={4}
              className={cn(
                'mt-1.5 w-full resize-y rounded-lg border bg-black/35 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
                errors.message ? 'border-accent' : 'border-white/10',
              )}
              {...register('message')}
            />
            {errors.message?.message ? (
              <p className="mt-1 text-xs text-accent" role="alert">
                {translateFieldError(errors.message.message)}
              </p>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">{t('contact.consent')}</p>

          <PrimaryButton type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? t('contact.sending') : t('contact.submit')}
          </PrimaryButton>

          {formStatus === 'success' ? (
            <div
              className="rounded-lg border border-white/8 bg-black/30 p-4 text-sm text-foreground"
              role="status"
            >
              <p className="font-medium">{t('contact.success')}</p>
              <p className="mt-1 text-muted-foreground">{t('contact.successNote')}</p>
            </div>
          ) : null}

          {formStatus === 'error' ? (
            <p className="text-sm text-accent" role="alert">
              {t('contact.errorGeneric')}
            </p>
          ) : null}
        </form>
      </ScrollReveal>
    </section>
  )
}
