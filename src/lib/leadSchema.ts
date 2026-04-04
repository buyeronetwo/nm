import { z } from 'zod'

export const leadFormSchema = z.object({
  name: z.string().trim().min(1, 'nameRequired'),
  phone: z.string().trim().optional(),
  telegram: z.string().trim().min(1, 'telegramRequired'),
  email: z.string().trim().email('emailInvalid'),
  message: z.string().trim().min(1, 'messageRequired'),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>
