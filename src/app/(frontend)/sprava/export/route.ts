import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminUser, isManagerUser } from '@/access'
import { buildReport, fmtDate } from '@/report'

export const dynamic = 'force-dynamic'

// GET /sprava/export[?odbor=OU] – prehľad po ľuďoch (CSV pre Excel).
// Admin: celý úrad alebo zvolený odbor; vedúci: vždy len svoj odbor.
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  const admin = isAdminUser(user)
  if (!admin && !isManagerUser(user)) {
    return new Response('Export je dostupný len pre vedúcich a administrátorov.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const odbor = new URL(req.url).searchParams.get('odbor') || ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const department = admin ? odbor : String((user as any).department || '')
  const r = await buildReport(payload, admin && !odbor ? {} : { department })

  const cell = (v: unknown) => {
    let s = String(v ?? '')
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}` // ochrana pred CSV/Excel injection
    return `"${s.replace(/"/g, '""')}"`
  }
  const rows: unknown[][] = [
    ['Meno', 'E-mail', 'Odbor', 'Prejdené témy', 'Z počtu', 'Najlepší test (%)', 'Pokusy o test', 'Test úspešný', 'Stav', 'Posledná aktivita', 'Posledné prihlásenie'],
    ...r.people.map((p) => [
      p.name,
      p.email,
      p.departmentName,
      p.topicsDone,
      r.topicCount,
      p.bestPercent ?? '',
      p.attempts,
      p.passed ? 'áno' : 'nie',
      p.complete ? 'Splnené' : p.started ? 'Rozpracované' : 'Nezačal/a',
      fmtDate(p.lastActivity),
      fmtDate(p.lastLogin),
    ]),
  ]

  const csv = '﻿' + rows.map((row) => row.map(cell).join(';')).join('\r\n')
  const date = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="prehlad-skolenia-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
