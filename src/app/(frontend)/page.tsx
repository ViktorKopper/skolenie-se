import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import config from '@/payload.config'
import DoneBadge from './DoneBadge'
import ProgressSummary from './ProgressSummary'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
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
          <h1 className="govuk-heading-xl">Bezpečnostné povedomie</h1>
          <p className="govuk-body-l">
            Naučte sa rozpoznať social engineering – podvodné e-maily, telefonáty a ďalšie
            techniky, ktorými útočníci zneužívajú dôveru.
          </p>
        </div>
      </section>

      <div className="govuk-width-container govuk-main-wrapper">
        <h2 className="govuk-heading-l" id="temy">
          Témy
        </h2>

        {topics.length === 0 ? (
          <p className="govuk-body">Zatiaľ neboli pridané žiadne témy. Pridajte ich v administrácii.</p>
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

        <div className="app-cta">
          <div>
            <h2 className="govuk-heading-m" style={{ marginBottom: 4 }}>
              Záverečný test
            </h2>
            <p className="govuk-body">20 náhodných otázok zo všetkých tém. Na úspešné absolvovanie treba 75 %.</p>
          </div>
          <Link className="govuk-button govuk-button--start" href="/kviz" style={{ marginBottom: 0 }}>
            Spustiť školenie
          </Link>
        </div>
      </div>
    </>
  )
}
