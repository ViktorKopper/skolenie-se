import { createHmac, timingSafeEqual } from 'crypto'

// Podpísaný odkaz na potvrdenie o absolvovaní (len server).
// Bez prihlásenia nikto nevie zobraziť cudzie potvrdenie, lebo nepozná token.
// Po zavedení prihlásenia cez AD sa overí aj vlastník.

export function certToken(id: string | number): string {
  return createHmac('sha256', process.env.PAYLOAD_SECRET || '')
    .update(`cert:${id}`)
    .digest('hex')
    .slice(0, 32)
}

export function verifyCertToken(id: string | number, token: unknown): boolean {
  if (typeof token !== 'string' || token.length !== 32) return false
  const a = Buffer.from(certToken(id))
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function certNumber(id: string | number, completedAt: string): string {
  const year = new Date(completedAt).getFullYear()
  return `UPPVL-KB-${year}-${String(id).padStart(5, '0')}`
}
