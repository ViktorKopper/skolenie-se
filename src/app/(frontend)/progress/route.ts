import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'
import { ALLOWED_EMAIL_DOMAIN, isAllowedEmail } from '@/progress-config'
import { correctIndexes, miniRequired, parseSelected, sameSet } from '@/quiz-shared'

export const dynamic = 'force-dynamic'

// POST /progress  { slug, email, name, answers }  – zaznamená absolvovanie témy (idempotentne).
// Téma sa uzná len pri úspešnom mini-kvíze – odpovede sa overujú tu na serveri.
export async function POST(req: Request) {
  let body: { slug?: unknown; email?: unknown; name?: unknown; answers?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Neplatná požiadavka.' }, { status: 400 })
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''

  if (!slug || slug.length > 100) {
    return NextResponse.json({ ok: false, error: 'Chýba téma.' }, { status: 400 })
  }
  if (!isAllowedEmail(email) || email.length > 200) {
    return NextResponse.json(
      { ok: false, error: `Použite služobný e-mail @${ALLOWED_EMAIL_DOMAIN}.` },
      { status: 400 },
    )
  }
  if (name.length < 3) {
    return NextResponse.json({ ok: false, error: 'Zadajte meno a priezvisko.' }, { status: 400 })
  }

  const payload = await getPayload({ config: await config })

  const topic = (
    await payload.find({
      collection: 'topics',
      where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
      limit: 1,
      depth: 0,
    })
  ).docs[0]
  if (!topic) {
    return NextResponse.json({ ok: false, error: 'Téma neexistuje.' }, { status: 404 })
  }

  // mini-kvíz: aspoň 2/3 správnych odpovedí (pri 6 otázkach = 4)
  const qs = await payload.find({
    collection: 'questions',
    where: { topic: { equals: topic.id } },
    pagination: false,
    depth: 0,
  })
  if (qs.docs.length > 0) {
    const answers =
      body.answers && typeof body.answers === 'object' ? (body.answers as Record<string, unknown>) : {}
    let correct = 0
    for (const q of qs.docs) {
      const options = q.options || []
      const sel = parseSelected(answers[String(q.id)], options.length)
      if (sel && sameSet(sel, correctIndexes(options))) correct++
    }
    if (correct < miniRequired(qs.docs.length)) {
      return NextResponse.json(
        { ok: false, error: 'Najprv úspešne dokončite mini-kvíz k téme.' },
        { status: 400 },
      )
    }
  }

  const existing = await payload.find({
    collection: 'completions',
    where: { and: [{ email: { equals: email } }, { topic: { equals: topic.id } }] },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) {
    return NextResponse.json({ ok: true, already: true })
  }

  await payload.create({
    collection: 'completions',
    data: { email, name, topic: topic.id, completedAt: new Date().toISOString() },
  })

  return NextResponse.json({ ok: true })
}
