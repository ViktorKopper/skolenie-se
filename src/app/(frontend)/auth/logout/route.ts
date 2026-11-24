import { NextResponse } from 'next/server'
import { sessionCookie } from '@/session'

export const dynamic = 'force-dynamic'

// POST /auth/logout – zruší session z AD prihlásenia
export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.headers.append('Set-Cookie', sessionCookie(null))
  return res
}
