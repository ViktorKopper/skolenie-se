import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import config from '@/payload.config'
import DoneBadge from '../DoneBadge'
import ProgressSummary from '../ProgressSummary'

export const dynamic = 'force-dynamic'

export default async function TopicsPage() {
  const payload = await getPayload({ config: await config })
  const { docs: topics } = await payload.find({
    collection: 'topics',
    where: { published: { equals: true } },
    sort: 'order',
    limit: 100,
  })

  return (
    <>
      <section className="app-hero">
        <div className="govuk-width-container">
          <h1 className="govuk-heading-xl">Témy</h1>
          <p className="govuk-body-l">
            Prehľad techník sociálneho inžinierstva a ako sa proti nim brániť.
          </p>
        </div>
      </section>

      <div className="govuk-width-container govuk-main-wrapper">
        {topics.length === 0 ? (
          <p className="govuk-body">Zatiaľ neboli pridané žiadne témy.</p>
        ) : (
          <>
          <ProgressSummary slugs={topics.map((t) => t.slug)} />
          <div className="app-topics">
            {topics.map((t) => (
              <Link key={t.id} href={`/temy/${t.slug}`} className="app-topic">
                <span className="app-topic__title">{t.title}</span>
                {t.summary && <p className="app-topic__desc">{t.summary}</p>}
                <DoneBadge slug={t.slug} />
              </Link>
            ))}
          </div>
          </>
        )}
      </div>
    </>
  )
}
