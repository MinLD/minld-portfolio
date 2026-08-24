import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'
import type { MailMessage } from './mail.types.js'
import { resetPasswordTemplate } from './templates/reset-password.template.js'
import { verifyEmailTemplate } from './templates/verify-email.template.js'

export const mailOutbox: MailMessage[] = []

async function sendMail(message: MailMessage) {
  if (!env.SMTP_HOST) {
    mailOutbox.push(message)
    return
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  })

  await transporter.sendMail({ from: env.MAIL_FROM, ...message })
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function verificationUrl(token: string) {
  return `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`
}

export function passwordResetUrl(token: string) {
  return `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = verificationUrl(token)
  await sendMail({ to, subject: 'Verify your email', html: verifyEmailTemplate(url) })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = passwordResetUrl(token)
  await sendMail({ to, subject: 'Reset your password', html: resetPasswordTemplate(url) })
}

export async function sendContactEmail(input: {
  name: string
  email: string
  phone?: string
  company?: string
  category: string
  subject: string
  message: string
}) {
  const rows = [
    ['Name', input.name],
    ['Email', input.email],
    ['Phone', input.phone || '-'],
    ['Company', input.company || '-'],
    ['Category', input.category],
    ['Subject', input.subject],
  ]

  const html = `
    <h2>New portfolio contact message</h2>
    ${rows.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join('')}
    <hr />
    <p>${escapeHtml(input.message).replaceAll('\n', '<br />')}</p>
  `

  await sendMail({
    to: env.CONTACT_TO_EMAIL,
    subject: `[Portfolio Contact] ${input.subject}`,
    html,
  })
}
