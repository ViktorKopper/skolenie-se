import { getPayload } from 'payload'
import config from '@/payload.config'
import { buildReport, fmtDate } from '@/report'

export const dynamic = 'force-dynamic'

// GET /sprava/export – prehľad po ľuďoch (CSV pre Excel), len pre prihláseného admina
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return new Response('Najprv sa prihláste do administrácie (/admin).', {
      status: 401,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const r = await buildReport(payload)
  const cell = (v: unknown) => {
    let s = String(v ?? '')
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}` // ochrana pred CSV/Excel injection
    return `"${s.replace(/"/g, '""')}"`
  }
  const rows: unknown[][] = [
    ['Meno', 'E-mail', 'Prejdené témy', 'Z počtu', 'Najlepší test (%)', 'Pokusy o test', 'Test úspešný', 'Stav', 'Posledná aktivita'],
    ...r.people.map((p) => [
      p.name,
      p.email,
      p.topicsDone,
      r.topicCount,
      p.bestPercent ?? '',
      p.attempts,
      p.passed ? 'áno' : 'nie',
      p.complete ? 'Splnené' : 'Rozpracované',
      fmtDate(p.lastActivity),
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
