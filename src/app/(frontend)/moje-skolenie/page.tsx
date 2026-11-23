import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import MyTraining from '../MyTraining'

export const dynamic = 'force-dynamic'

export default async function MyTrainingPage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
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
          <h1 className="govuk-heading-xl">Moje školenie</h1>
          <p className="govuk-body-l">Váš postup v témach, výsledky záverečného testu a potvrdenie o absolvovaní.</p>
        </div>
      </section>
      <div className="govuk-width-container govuk-main-wrapper">
        <MyTraining topics={docs.map((t) => ({ slug: t.slug, title: t.title, summary: t.summary }))} />
      </div>
    </>
  )
}
