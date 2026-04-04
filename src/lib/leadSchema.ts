import { z } from 'zod'

export const leadFormSchema = z.object({
  name: z.string().trim().min(1, 'nameRequired'),
  telegram: z.string().trim().min(1, 'telegramRequired'),
  message: z.string().trim().min(1, 'messageRequired'),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>
