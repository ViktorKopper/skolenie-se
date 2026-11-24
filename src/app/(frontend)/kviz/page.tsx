import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import config from '@/payload.config'
import { userDoneSlugs } from '@/user-progress'
import { FinalTest } from './Quiz'

export const dynamic = 'force-dynamic'

export default async function QuizPage() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/prihlasenie?next=/kviz')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any

  const [{ docs: topics }, done] = await Promise.all([
    payload.find({ collection: 'topics', where: { published: { equals: true } }, pagination: false, depth: 0 }),
    userDoneSlugs(payload, u),
  ])
  const slugs = new Set(topics.map((t) => t.slug))

  return (
    <>
      <section className="app-hero">
        <div className="govuk-width-container">
          <h1 className="govuk-heading-xl">Záverečný test</h1>
          <p className="govuk-body-l">
            20 náhodných otázok zo všetkých tém. Každý pokus je iný a výsledok sa zaznamená ako doklad
            o absolvovaní školenia.
          </p>
        </div>
      </section>

      <div className="govuk-width-container govuk-main-wrapper">
        <div className="app-lesson">
          <FinalTest
            user={{ name: u.name || u.email, email: u.email }}
            doneCount={done.filter((s) => slugs.has(s)).length}
            topicCount={topics.length}
          />
        </div>
      </div>
    </>
  )
}
