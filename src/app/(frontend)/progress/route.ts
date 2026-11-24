import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'
import { correctIndexes, miniRequired, parseSelected, sameSet } from '@/quiz-shared'

export const dynamic = 'force-dynamic'

// POST /progress { slug, answers } – zaznamená absolvovanie témy prihlásenému používateľovi (idempotentne).
// Téma sa uzná len pri úspešnom mini-kvíze – odpovede sa overujú tu na serveri.
export async function POST(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Najprv sa prihláste.' }, { status: 401 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any

  let body: { slug?: unknown; answers?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Neplatná požiadavka.' }, { status: 400 })
  }
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  if (!slug || slug.length > 100) return NextResponse.json({ ok: false, error: 'Chýba téma.' }, { status: 400 })

  const topic = (
    await payload.find({
      collection: 'topics',
      where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
      limit: 1,
      depth: 0,
    })
  ).docs[0]
  if (!topic) return NextResponse.json({ ok: false, error: 'Téma neexistuje.' }, { status: 404 })

  // mini-kvíz: aspoň 2/3 správnych odpovedí (pri 6 otázkach = 4)
  const qs = await payload.find({
    collection: 'questions',
    where: { topic: { equals: topic.id } },
    pagination: false,
    depth: 0,
  })
  if (qs.docs.length > 0) {
    const answers = body.answers && typeof body.answers === 'object' ? (body.answers as Record<string, unknown>) : {}
    let correct = 0
    for (const q of qs.docs) {
      const options = q.options || []
      const sel = parseSelected(answers[String(q.id)], options.length)
      if (sel && sameSet(sel, correctIndexes(options))) correct++
    }
    if (correct < miniRequired(qs.docs.length)) {
      return NextResponse.json({ ok: false, error: 'Najprv úspešne dokončite mini-kvíz k téme.' }, { status: 400 })
    }
  }

  const email = String(u.email || '').toLowerCase()
  const existing = await payload.find({
    collection: 'completions',
    where: {
      and: [{ topic: { equals: topic.id } }, { or: [{ user: { equals: u.id } }, { email: { equals: email } }] }],
    },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) return NextResponse.json({ ok: true, already: true })

  await payload.create({
    collection: 'completions',
    data: { user: u.id, email, name: u.name || email, topic: topic.id, completedAt: new Date().toISOString() },
  })
  return NextResponse.json({ ok: true })
}
