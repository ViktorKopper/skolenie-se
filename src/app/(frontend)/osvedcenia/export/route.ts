import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminUser } from '@/access'
import { CERT_STATUS_LABEL, certStatus, fmtSkDate } from '@/certificates'

export const dynamic = 'force-dynamic'

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

// GET /osvedcenia/export – všetky vydané osvedčenia (CSV pre Excel), len administrátor
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdminUser(user)) {
    return new Response('Export je dostupný len pre administrátorov.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const res = await payload.find({ collection: 'certificates', pagination: false, depth: 0, sort: '-issuedAt', overrideAccess: true })
  const cell = (v: unknown) => {
    let s = String(v ?? '')
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}` // ochrana pred CSV/Excel injection
    return `"${s.replace(/"/g, '""')}"`
  }
  const rows: unknown[][] = [
    ['Číslo', 'Meno', 'E-mail', 'Odbor', 'Výsledok (%)', 'Vydané', 'Platné do', 'Stav', 'Dôvod zrušenia'],
    ...(res.docs as AnyDoc[]).map((c) => [
      c.number,
      c.name,
      c.email,
      c.departmentName,
      c.percent,
      fmtSkDate(c.issuedAt),
      fmtSkDate(c.validUntil),
      CERT_STATUS_LABEL[certStatus(c)],
      c.revokedReason || '',
    ]),
  ]

  const csv = '﻿' + rows.map((row) => row.map(cell).join(';')).join('\r\n')
  const date = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="osvedcenia-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
