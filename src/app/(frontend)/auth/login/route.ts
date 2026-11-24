import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'
import { ldapAuthenticate, ldapConfigured, normalizeLogin } from '@/ldap'
import { clearFailures, clientIp, isLimited, registerFailure } from '@/rate-limit'
import { createSessionToken, REMEMBER_MAX_AGE, safeNext, SESSION_MAX_AGE, sessionCookie } from '@/session'
import { ensureDepartment, upsertLdapUser } from '@/users-sync'

export const dynamic = 'force-dynamic'

const MESSAGES = {
  invalid: 'Nesprávne prihlasovacie meno alebo heslo.',
  locked: 'Váš doménový účet je zamknutý. Kontaktujte IT podporu.',
  expired: 'Platnosť vášho hesla vypršala. Zmeňte si heslo v počítači a prihláste sa znova.',
  disabled: 'Nesprávne prihlasovacie meno alebo heslo.',
  unavailable: 'Prihlasovací server (AD) je momentálne nedostupný. Skúste to o chvíľu.',
} as const

// POST /auth/login { login, password, next }
export async function POST(req: Request) {
  if (!ldapConfigured()) {
    return NextResponse.json({ ok: false, error: 'Prihlásenie cez AD nie je nastavené.' }, { status: 503 })
  }

  let body: { login?: unknown; password?: unknown; next?: unknown; remember?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Neplatná požiadavka.' }, { status: 400 })
  }

  const username = normalizeLogin(body.login)
  const ip = clientIp(req.headers)
  if (isLimited(username, ip)) {
    return NextResponse.json(
      { ok: false, error: 'Príliš veľa neúspešných pokusov. Skúste to znova o 15 minút.' },
      { status: 429 },
    )
  }

  const r = await ldapAuthenticate(body.login, body.password)
  if (!r.ok) {
    if (r.reason === 'invalid' || r.reason === 'disabled') registerFailure(username, ip)
    const status = r.reason === 'unavailable' ? 503 : r.reason === 'locked' ? 423 : 401
    return NextResponse.json({ ok: false, error: MESSAGES[r.reason] }, { status })
  }
  clearFailures(username)

  const payload = await getPayload({ config: await config })
  const user = await upsertLdapUser(payload, { ...r.user, role: r.role }, { login: true })
  await ensureDepartment(payload, r.user.department)

  const remember = body.remember === true
  const maxAge = remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE
  const res = NextResponse.json({ ok: true, next: safeNext(body.next, '/') })
  res.headers.append(
    'Set-Cookie',
    sessionCookie(createSessionToken(user.id, user.sessionVersion ?? 0, maxAge), remember ? maxAge : undefined),
  )
  return res
}
