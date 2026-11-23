import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'
import { topics } from '@/seed-data'
import { questions } from '@/seed-questions'

export const dynamic = 'force-dynamic'

// GET /seed           – naplní prázdnu DB (ak témy existujú, preskočí)
// GET /seed?update=1  – aktualizuje témy podľa slugu a NAHRADÍ všetky otázky bankou zo seed-questions.ts
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })

  // V produkcii len s ALLOW_SEED=1 v prostredí a pre prihláseného administrátora
  if (process.env.NODE_ENV === 'production') {
    const { user } = await payload.auth({ headers: req.headers })
    if (process.env.ALLOW_SEED !== '1' || !user) {
      return NextResponse.json(
        { ok: false, error: 'Seed je v produkcii povolený len s ALLOW_SEED=1 a po prihlásení do /admin.' },
        { status: 403 },
      )
    }
  }

  const update = new URL(req.url).searchParams.get('update') === '1'
  const log: string[] = []

  const existing = await payload.count({ collection: 'topics' })
  if (existing.totalDocs > 0 && !update) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message: `Témy už existujú (${existing.totalDocs}). Na aktualizáciu obsahu otvor /seed?update=1`,
    })
  }

  try {
    // 1) témy – vytvoriť alebo aktualizovať (bez súvisiacich)
    const idBySlug: Record<string, string | number> = {}
    for (const t of topics) {
      const { related: _related, ...data } = t
      const found = await payload.find({
        collection: 'topics',
        where: { slug: { equals: t.slug } },
        limit: 1,
        depth: 0,
      })
      if (found.docs[0]) {
        const doc = await payload.update({
          collection: 'topics',
          id: found.docs[0].id,
          data: data as never,
        })
        idBySlug[t.slug] = doc.id
        log.push(`aktualizovaná: ${t.slug}`)
      } else {
        const doc = await payload.create({ collection: 'topics', data: data as never })
        idBySlug[t.slug] = doc.id
        log.push(`vytvorená: ${t.slug}`)
      }
    }

    // 2) súvisiace témy (slug -> id)
    for (const t of topics) {
      const ids = t.related.map((s) => idBySlug[s]).filter(Boolean)
      await payload.update({
        collection: 'topics',
        id: idBySlug[t.slug],
        data: { related: ids } as never,
      })
    }
    log.push('súvisiace témy prepojené')

    // 3) otázky – pri prvom seede alebo pri ?update=1 sa nahradia bankou otázok
    const qCount = await payload.count({ collection: 'questions' })
    if (qCount.totalDocs === 0 || update) {
      if (qCount.totalDocs > 0) {
        await payload.delete({ collection: 'questions', where: { id: { exists: true } } })
        log.push(`zmazané staré otázky: ${qCount.totalDocs}`)
      }
      for (const q of questions) {
        const { topic, ...rest } = q
        if (!idBySlug[topic]) throw new Error(`Otázka odkazuje na neznámu tému: ${topic}`)
        await payload.create({ collection: 'questions', data: { ...rest, topic: idBySlug[topic] } as never })
      }
      log.push(`otázky: ${questions.length}`)
    }

    return NextResponse.json({ ok: true, log })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e), log },
      { status: 500 },
    )
  }
}
