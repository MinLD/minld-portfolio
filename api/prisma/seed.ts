import { z } from 'zod'
import { hashPassword } from '../src/common/auth/password.js'
import { authRepository } from '../src/modules/auth/auth.repository.js'
import { runTransaction } from '../src/database/transaction.js'

const seedEnvSchema = z.object({
  ADMIN_EMAIL: z.string().trim().toLowerCase().pipe(z.email()),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_NAME: z.string().trim().min(1),
})

const seedEnv = seedEnvSchema.parse(process.env)

await runTransaction(async (tx) => {
  await authRepository.createAdmin(
    {
      email: seedEnv.ADMIN_EMAIL,
      displayName: seedEnv.ADMIN_NAME,
      passwordHash: await hashPassword(seedEnv.ADMIN_PASSWORD),
    },
    tx,
  )
})
