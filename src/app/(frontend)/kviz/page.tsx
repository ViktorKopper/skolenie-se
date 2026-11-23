import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { FinalTest } from './Quiz'

export const dynamic = 'force-dynamic'

export default async function QuizPage() {
  const payload = await getPayload({ config: await config })
  const { docs: topics } = await payload.find({
    collection: 'topics',
    where: { published: { equals: true } },
    sort: 'order',
    pagination: false,
    depth: 0,
  })

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
          <FinalTest topicSlugs={topics.map((t) => t.slug)} />
        </div>
      </div>
    </>
  )
}
