import { createHmac, timingSafeEqual } from 'crypto'

// Session po prihlásení cez AD: podpísaný token v httpOnly cookie. Len server.
// sessionVersion na používateľovi umožní zneplatniť všetky jeho session (napr. po deaktivácii v AD).

export const SESSION_COOKIE = 'skolenie-session'
export const SESSION_MAX_AGE = 8 * 60 * 60 // 8 hodín
// „Zapamätať si ma“ – trvalá cookie (predvolene 7 dní, SESSION_REMEMBER_DAYS v .env)
export const REMEMBER_MAX_AGE = (Number(process.env.SESSION_REMEMBER_DAYS) || 7) * 24 * 60 * 60

const sign = (data: string) =>
  createHmac('sha256', process.env.PAYLOAD_SECRET || '').update(`session:${data}`).digest('base64url')

export function createSessionToken(uid: string | number, sv: number, maxAge = SESSION_MAX_AGE) {
  const data = Buffer.from(
    JSON.stringify({ uid: String(uid), sv, exp: Math.floor(Date.now() / 1000) + maxAge }),
  ).toString('base64url')
  return `${data}.${sign(data)}`
}

export function readSessionToken(token: string | null | undefined): { uid: string; sv: number } | null {
  if (!token || token.length > 1000) return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = Buffer.from(sign(data))
  const got = Buffer.from(sig)
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null
  try {
    const p = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    if (!p.uid || typeof p.exp !== 'number' || p.exp < Date.now() / 1000) return null
    return { uid: String(p.uid), sv: Number(p.sv) || 0 }
  } catch {
    return null
  }
}

export function getCookie(headers: Headers, name: string): string | null {
  const raw = headers.get('cookie') || ''
  for (const part of raw.split(/;\s*/)) {
    const i = part.indexOf('=')
    if (i > 0 && part.slice(0, i) === name) {
      try {
        return decodeURIComponent(part.slice(i + 1))
      } catch {
        return null
      }
    }
  }
  return null
}

// maxAge nezadané = cookie len do zatvorenia prehliadača
export function sessionCookie(token: string | null, maxAge?: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return token
    ? `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${maxAge ? `; Max-Age=${maxAge}` : ''}${secure}`
    : `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}

// bezpečný návrat po prihlásení – len relatívna cesta v rámci webu
export function safeNext(v: unknown, fallback = '/moje-skolenie') {
  return typeof v === 'string' && /^\/(?![\/\\])/.test(v) && v.length < 300 && !v.startsWith('/prihlasenie')
    ? v
    : fallback
}
