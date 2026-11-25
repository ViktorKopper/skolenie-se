import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import config from '@/payload.config'
import { isAdminUser } from '@/access'
import { FinalTest } from '../../kviz/Quiz'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Ukážkový test · Demo' }

// /demo/test – záverečný test v ukážkovom režime (výsledok sa neukladá), len admin
export default async function DemoTestPage() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/prihlasenie?next=/demo/test')
  if (!isAdminUser(user)) redirect('/demo')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any
  const topics = await payload.count({ collection: 'topics', where: { published: { equals: true } } })

  return (
    <>
      <section className="app-hero">
        <div className="govuk-width-container">
          <h1 className="govuk-heading-xl">Záverečný test – ukážka</h1>
          <p className="govuk-body-l">Rovnaký test ako naostro, ale výsledok sa nikam neuloží.</p>
        </div>
      </section>
      <div className="govuk-width-container govuk-main-wrapper">
        <p className="govuk-body">
          <Link href="/demo">← Späť na Demo</Link>
        </p>
        <div className="app-lesson">
          <FinalTest
            user={{ name: u.name || u.email, email: u.email }}
            doneCount={topics.totalDocs}
            topicCount={topics.totalDocs}
            demo
          />
        </div>
      </div>
    </>
  )
}
