import { sendContactEmail } from '../../common/mail/mailer.js'
import type { CreateContactMessageInput } from './contact.schema.js'

export async function createContactMessage(input: CreateContactMessageInput) {
  await sendContactEmail({
    ...input,
    phone: input.phone || undefined,
    company: input.company || undefined,
  })

  return { message: 'Message sent.' }
}
