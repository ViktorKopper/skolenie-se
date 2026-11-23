import { getPayload } from 'payload'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

// GET /progress/export – CSV s evidenciou absolvovania (len pre prihláseného admina)
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return new Response('Najprv sa prihláste do administrácie (/admin).', {
      status: 401,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const [completions, topics] = await Promise.all([
    payload.find({ collection: 'completions', limit: 0, pagination: false, depth: 0, sort: 'email' }),
    payload.find({ collection: 'topics', limit: 0, pagination: false, depth: 0, sort: 'order' }),
  ])

  const titleById = new Map(topics.docs.map((t) => [String(t.id), t.title]))
  const cell = (v: unknown) => {
    let s = String(v ?? '')
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}` // ochrana pred CSV/Excel injection
    return `"${s.replace(/"/g, '""')}"`
  }

  const rows = [['Meno', 'E-mail', 'Téma', 'Absolvované']]
  for (const c of completions.docs) {
    const topicId = typeof c.topic === 'object' && c.topic ? String(c.topic.id) : String(c.topic)
    rows.push([
      c.name ?? '',
      c.email,
      titleById.get(topicId) ?? topicId,
      new Date(c.completedAt).toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava' }),
    ])
  }

  // BOM + bodkočiarka, aby to Excel v SK prostredí otvoril správne
  const csv = '﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n')
  const date = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="absolvovanie-skolenia-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
