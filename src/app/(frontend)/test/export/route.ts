import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminUser } from '@/access'

export const dynamic = 'force-dynamic'

// GET /test/export – CSV s výsledkami záverečných testov (len pre prihláseného admina)
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdminUser(user)) {
    return new Response('Export je dostupný len pre administrátorov.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const results = await payload.find({
    collection: 'test-results',
    pagination: false,
    depth: 0,
    sort: '-completedAt',
  })

  const cell = (v: unknown) => {
    let s = String(v ?? '')
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}` // ochrana pred CSV/Excel injection
    return `"${s.replace(/"/g, '""')}"`
  }

  const rows: unknown[][] = [
    ['Meno', 'E-mail', 'Výsledok', 'Úspešnosť (%)', 'Body', 'Max. bodov', 'Správne otázky', 'Dokončené'],
  ]
  for (const r of results.docs) {
    rows.push([
      r.name ?? '',
      r.email,
      r.passed ? 'Úspešný' : 'Neúspešný',
      r.percent,
      r.score,
      r.maxScore,
      `${r.correctCount ?? ''} / ${r.total ?? ''}`,
      new Date(r.completedAt).toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava' }),
    ])
  }

  const csv = '﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n')
  const date = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vysledky-testov-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
