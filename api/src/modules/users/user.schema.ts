import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({ displayName: z.string().trim().min(1) }),
})
