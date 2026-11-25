import { createHmac, timingSafeEqual } from 'crypto'
import type { Payload } from 'payload'

// Osvedčenia o absolvovaní školenia. Len server.
// Číslo: UPPVL-KB-YYYY-MM-DD-NNN (dátum vydania v čase Bratislavy + poradie v daný deň).
// Platnosť 12 mesiacov. Jeden človek má naraz najviac jedno platné osvedčenie.

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

export const COURSE_TITLE = 'Školenie o kyberbezpečnosti – sociálne inžinierstvo'
export const VALID_MONTHS = 12
export const EXPIRING_DAYS = 30
const TZ = 'Europe/Bratislava'

export const fmtSkDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString('sk-SK', { timeZone: TZ, day: 'numeric', month: 'numeric', year: 'numeric' }) : '–'

export type CertStatus = 'valid' | 'expiring' | 'expired' | 'revoked'

export const CERT_STATUS_LABEL: Record<CertStatus, string> = {
  valid: 'Platné',
  expiring: 'Platnosť končí',
  expired: 'Platnosť vypršala',
  revoked: 'Zrušené',
}

export function certStatus(c: { revoked?: boolean | null; validUntil?: string | null }, now = new Date()): CertStatus {
  if (c.revoked) return 'revoked'
  const until = c.validUntil ? new Date(c.validUntil).getTime() : 0
  if (until <= now.getTime()) return 'expired'
  if (until - now.getTime() <= EXPIRING_DAYS * 86400000) return 'expiring'
  return 'valid'
}

export const isActiveCert = (c: AnyDoc, now = new Date()) => {
  const s = certStatus(c, now)
  return s === 'valid' || s === 'expiring'
}

// ───────── podpísaný odkaz na overenie (QR)
export function certVerifyToken(number: string): string {
  return createHmac('sha256', process.env.PAYLOAD_SECRET || '').update(`certificate:${number}`).digest('hex').slice(0, 32)
}

export function checkCertVerifyToken(number: string, token: unknown): boolean {
  if (typeof token !== 'string' || token.length !== 32) return false
  const a = Buffer.from(certVerifyToken(number))
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}

// verejná adresa aplikácie: APP_URL, inak z hlavičiek požiadavky (za nginx: Host + X-Forwarded-Proto)
export function appBaseUrl(h: Headers): string {
  const env = (process.env.APP_URL || '').replace(/\/+$/, '')
  if (env) return env
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  const proto = (h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')).split(',')[0].trim()
  return `${proto}://${host}`
}

export const certPdfPath = (number: string) => `/osvedcenie/${encodeURIComponent(number)}`
export const certVerifyUrl = (base: string, number: string) =>
  `${base}/overenie/${encodeURIComponent(number)}?t=${certVerifyToken(number)}`

// ───────── vydanie
const dayKey = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d) // 2026-11-24

function addMonths(d: Date, m: number) {
  const x = new Date(d)
  x.setMonth(x.getMonth() + m)
  return x
}

async function nextNumber(payload: Payload, day: string) {
  const last = await payload.find({
    collection: 'certificates',
    where: { issuedDay: { equals: day } },
    sort: '-number',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const prev = last.docs[0] ? Number(String((last.docs[0] as AnyDoc).number).split('-').pop()) || 0 : 0
  return `UPPVL-KB-${day}-${String(prev + 1).padStart(3, '0')}`
}

async function departmentName(payload: Payload, ou: string) {
  if (!ou) return ''
  const d = await payload.find({ collection: 'departments', where: { ou: { equals: ou } }, limit: 1, depth: 0, overrideAccess: true })
  return ((d.docs[0] as AnyDoc | undefined)?.name as string) || ou
}

export async function activeCertificate(payload: Payload, userId: string | number): Promise<AnyDoc | null> {
  const res = await payload.find({
    collection: 'certificates',
    where: { and: [{ user: { equals: userId } }, { revoked: { not_equals: true } }, { validUntil: { greater_than: new Date().toISOString() } }] },
    sort: '-issuedAt',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return (res.docs[0] as AnyDoc) || null
}

export async function latestCertificate(payload: Payload, userId: string | number): Promise<AnyDoc | null> {
  const res = await payload.find({
    collection: 'certificates',
    where: { user: { equals: userId } },
    sort: '-issuedAt',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return (res.docs[0] as AnyDoc) || null
}

/**
 * Vydá osvedčenie za úspešný test. Ak má používateľ platné osvedčenie, vráti ho (nové nevznikne).
 * Ak už za tento test osvedčenie existuje (aj zrušené), nové nevydá.
 */
export async function issueCertificate(payload: Payload, user: AnyDoc, result: AnyDoc): Promise<AnyDoc | null> {
  if (!result?.passed) return null

  const active = await activeCertificate(payload, user.id)
  if (active) return active

  const forResult = await payload.find({
    collection: 'certificates',
    where: { testResult: { equals: result.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (forResult.docs[0]) return null

  const issuedAt = new Date(result.completedAt || Date.now())
  const validUntil = addMonths(issuedAt, VALID_MONTHS)
  if (validUntil.getTime() <= Date.now()) return null // starý test – osvedčenie by už neplatilo

  const day = dayKey(issuedAt)
  const topics = await payload.count({ collection: 'topics', where: { published: { equals: true } } })
  const ou = String(user.department || '')
  const data = {
    user: user.id,
    name: String(user.name || user.email || ''),
    email: String(user.email || '').toLowerCase(),
    departmentOu: ou,
    departmentName: await departmentName(payload, ou),
    testResult: result.id,
    percent: Number(result.percent) || 0,
    topicCount: topics.totalDocs,
    questionCount: Number(result.total) || 0,
    issuedAt: issuedAt.toISOString(),
    validUntil: validUntil.toISOString(),
    issuedDay: day,
    revoked: false,
  }

  // poradové číslo – pri súbehu dvoch vydaní v tú istú chvíľu skúsi ďalšie (number je unikátne)
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = await nextNumber(payload, day)
    try {
      return (await payload.create({ collection: 'certificates', data: { ...data, number }, overrideAccess: true, depth: 0 })) as AnyDoc
    } catch (e) {
      if (attempt === 4) throw e
    }
  }
  return null
}

/** Doplní osvedčenie za najnovší úspešný test (napr. testy spred zavedenia osvedčení). */
export async function ensureCertificate(payload: Payload, user: AnyDoc, tests: AnyDoc[]): Promise<AnyDoc | null> {
  const active = await activeCertificate(payload, user.id)
  if (active) return active
  const lastPassed = tests.filter((t) => t.passed).sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)))[0]
  if (lastPassed) {
    const issued = await issueCertificate(payload, user, lastPassed)
    if (issued) return issued
  }
  return latestCertificate(payload, user.id) // vypršané/zrušené – na zobrazenie stavu
}

// ───────── ukážky (stránka /demo) – nič sa neukladá, číslo končí na -DEMO
export const isDemoNumber = (n: string) => /-DEMO$/.test(n)

export function demoCertificate(o: { name: string; department: string; percent: number; expired: boolean }) {
  const issuedAt = o.expired ? addMonths(new Date(), -(VALID_MONTHS + 1)) : new Date()
  const validUntil = addMonths(issuedAt, VALID_MONTHS)
  return {
    number: `UPPVL-KB-${dayKey(issuedAt)}-DEMO`,
    name: o.name,
    department: o.department,
    percent: Math.min(100, Math.max(0, Math.round(o.percent))),
    issuedAt: issuedAt.toISOString(),
    validUntil: validUntil.toISOString(),
  }
}

export function demoVerifyUrl(base: string, d: { number: string; name: string; department: string; issuedAt: string }) {
  const q = new URLSearchParams({ t: certVerifyToken(d.number), n: d.name, o: d.department, d: d.issuedAt.slice(0, 10) })
  return `${base}/overenie/${encodeURIComponent(d.number)}?${q.toString()}`
}
