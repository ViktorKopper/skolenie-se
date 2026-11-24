import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import config from '@/payload.config'
import { isAdminUser } from '@/access'
import { ldapConfigured } from '@/ldap'
import { syncFromAd } from '@/users-sync'

export const dynamic = 'force-dynamic'

function bearerOk(req: Request) {
  const secret = process.env.SYNC_SECRET || ''
  const got = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (secret.length < 16 || got.length !== secret.length) return false
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret))
}

// POST /auth/sync – synchronizácia používateľov z AD
// volá ju cron (Authorization: Bearer SYNC_SECRET) alebo administrátor tlačidlom v /sprava
export async function POST(req: Request) {
  const payload = await getPayload({ config: await config })
  if (!bearerOk(req)) {
    const { user } = await payload.auth({ headers: req.headers })
    if (!isAdminUser(user)) return NextResponse.json({ ok: false, error: 'Nemáte oprávnenie.' }, { status: 403 })
  }
  if (!ldapConfigured()) {
    return NextResponse.json({ ok: false, error: 'Prihlásenie cez AD nie je nastavené.' }, { status: 503 })
  }
  try {
    const result = await syncFromAd(payload)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    payload.logger.error({ err: e }, 'Synchronizácia z AD zlyhala')
    console.error(`[sync] zlyhala: ${(e as Error)?.message || e}`)
    return NextResponse.json(
      { ok: false, error: `Synchronizácia z AD zlyhala: ${(e as Error)?.message || 'neznáma chyba'}` },
      { status: 502 },
    )
  }
}
