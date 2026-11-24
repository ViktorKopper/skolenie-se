import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import config from '@/payload.config'
import { certToken } from '@/cert'
import { userCompletions, userTests } from '@/user-progress'
import MyTraining from '../MyTraining'

export const dynamic = 'force-dynamic'

export default async function MyTrainingPage() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/prihlasenie?next=/moje-skolenie')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any

  const [topicsRes, comps, tests, deps] = await Promise.all([
    payload.find({ collection: 'topics', where: { published: { equals: true } }, sort: 'order', pagination: false, depth: 0 }),
    userCompletions(payload, u),
    userTests(payload, u),
    u.department
      ? payload.find({ collection: 'departments', where: { ou: { equals: u.department } }, limit: 1, depth: 0 })
      : Promise.resolve(null),
  ])

  const doneAt = new Map<string, string>()
  for (const c of comps) {
    const tid = typeof c.topic === 'object' && c.topic ? String(c.topic.id) : String(c.topic)
    const prev = doneAt.get(tid)
    if (!prev || c.completedAt < prev) doneAt.set(tid, c.completedAt)
  }

  return (
    <>
      <section className="app-hero">
        <div className="govuk-width-container">
          <h1 className="govuk-heading-xl">Moje školenie</h1>
          <p className="govuk-body-l">Váš postup v témach, výsledky záverečného testu a potvrdenie o absolvovaní.</p>
        </div>
      </section>
      <div className="govuk-width-container govuk-main-wrapper">
        <MyTraining
          user={{
            name: u.name || u.email,
            email: u.email,
            department: deps?.docs[0]?.name || u.department || '',
          }}
          topics={topicsRes.docs.map((t) => ({
            slug: t.slug,
            title: t.title,
            summary: t.summary,
            doneAt: doneAt.get(String(t.id)) || null,
          }))}
          tests={tests.map((r) => ({
            id: String(r.id),
            date: r.completedAt,
            percent: r.percent,
            score: r.score,
            maxScore: r.maxScore,
            passed: Boolean(r.passed),
            certUrl: r.passed ? `/potvrdenie/${r.id}?t=${certToken(r.id)}` : null,
          }))}
        />
      </div>
    </>
  )
}
