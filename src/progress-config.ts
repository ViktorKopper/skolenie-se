// Spoločné nastavenie pre evidenciu absolvovania (klient aj server)
export const ALLOWED_EMAIL_DOMAIN = (
  process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || 'vicepremier.gov.sk'
).toLowerCase()

export function isAllowedEmail(email: string): boolean {
  const e = email.trim().toLowerCase()
  const at = e.lastIndexOf('@')
  if (at < 1) return false
  const local = e.slice(0, at)
  const domain = e.slice(at + 1)
  return domain === ALLOWED_EMAIL_DOMAIN && /^[a-z0-9._%+-]+$/.test(local)
}
