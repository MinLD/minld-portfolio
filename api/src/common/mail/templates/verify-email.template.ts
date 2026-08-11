export function verifyEmailTemplate(url: string) {
  return `<p>Verify your email: <a href="${url}">${url}</a></p>`
}
