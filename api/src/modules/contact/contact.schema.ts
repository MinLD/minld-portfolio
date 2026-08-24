import { z } from 'zod'

export const contactCategories = [
  'GENERAL_INQUIRY',
  'BUSINESS_OPPORTUNITY',
  'TECHNICAL_SUPPORT',
  'FEEDBACK',
] as const

export const createContactMessageSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(80),
    email: z.email().max(120),
    phone: z.string().trim().max(30).optional().or(z.literal('')),
    company: z.string().trim().max(120).optional().or(z.literal('')),
    category: z.enum(contactCategories).default('GENERAL_INQUIRY'),
    subject: z.string().trim().min(1).max(160),
    message: z.string().trim().min(10).max(3000),
  }),
})

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>['body']
