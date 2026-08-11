import { z } from 'zod'

const passwordSchema = z.string().min(8)
const tokenSchema = z.string().min(32)

export const registerSchema = z.object({
  body: z.object({
    displayName: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: passwordSchema,
  }),
})

export const verifyEmailSchema = z.object({ body: z.object({ token: tokenSchema }) })
export const resendVerificationSchema = z.object({ body: z.object({ email: z.string().trim().toLowerCase().pipe(z.email()) }) })

export const loginSchema = z.object({
  body: z.object({ email: z.string().trim().toLowerCase().pipe(z.email()), password: z.string().min(1) }),
})

export const forgotPasswordSchema = z.object({ body: z.object({ email: z.string().trim().toLowerCase().pipe(z.email()) }) })
export const resetPasswordSchema = z.object({ body: z.object({ token: tokenSchema, newPassword: passwordSchema }) })
export const changePasswordSchema = z.object({ body: z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema }) })
export const revokeSessionSchema = z.object({ params: z.object({ sessionId: z.uuid() }) })
export const updateProfileSchema = z.object({ body: z.object({ displayName: z.string().trim().min(1) }) })
