import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'
import { isAdminUser } from '@/access'
import { userDoneSlugs } from '@/user-progress'

export const dynamic = 'force-dynamic'

// GET /auth/me – kto je prihlásený a ktoré témy má prejdené (pre menu a odznaky)
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ user: null, done: [] }, { headers: { 'Cache-Control': 'no-store' } })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any
  const done = await userDoneSlugs(payload, u)
  return NextResponse.json(
    {
      user: {
        name: u.name || u.email,
        email: u.email,
        role: isAdminUser(u) ? 'admin' : u.role || 'employee',
        department: u.department || '',
      },
      done,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
