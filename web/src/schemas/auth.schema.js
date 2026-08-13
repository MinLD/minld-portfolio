import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Invalid email address')),

  password: z.string().min(8, 'Password must be at least 8 characters long'),
})
