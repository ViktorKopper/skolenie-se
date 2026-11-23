import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { certNumber, verifyCertToken } from '@/cert'
import PrintButton from '../../PrintButton'

export const dynamic = 'force-dynamic'

const VALID_MONTHS = 12

const fmt = (d: Date) => d.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Bratislava' })

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { id } = await params
  const { t } = await searchParams

  const notFound = (
    <div className="govuk-width-container govuk-main-wrapper">
      <h1 className="govuk-heading-l">Potvrdenie sa nenašlo</h1>
      <p className="govuk-body">Odkaz je neplatný alebo potvrdenie neexistuje.</p>
    </div>
  )

  if (!/^\d+$/.test(id) || !verifyCertToken(id, t)) return notFound

  const payload = await getPayload({ config: await config })
  const r = await payload.findByID({ collection: 'test-results', id: Number(id), depth: 0 }).catch(() => null)
  if (!r || !r.passed) return notFound

  const done = new Date(r.completedAt)
  const validUntil = new Date(done)
  validUntil.setMonth(validUntil.getMonth() + VALID_MONTHS)

  return (
    <div className="govuk-width-container govuk-main-wrapper cert-page">
      <div className="cert-actions">
        <PrintButton />
        <span className="cert-actions__hint">V dialógu tlače zvoľte „Uložiť ako PDF“.</span>
      </div>

      <article className="cert">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cert__logo" src="/urad.png" alt="Úrad podpredsedu vlády SR pre Plán obnovy a znalostnú ekonomiku" />
        <p className="cert__kicker">Potvrdenie o absolvovaní</p>
        <h1 className="cert__title">Školenie o kyberbezpečnosti</h1>
        <p className="cert__sub">Rozpoznanie a obrana proti sociálnemu inžinierstvu</p>

        <p className="cert__lead">Týmto sa potvrdzuje, že</p>
        <p className="cert__name">{r.name || r.email}</p>
        <p className="cert__email">{r.email}</p>
        <p className="cert__lead">
          úspešne absolvoval/a záverečný test školenia o kyberbezpečnosti
          <br />s výsledkom <strong>{r.percent} %</strong> ({r.score} z {r.maxScore} bodov).
        </p>

        <dl className="cert__meta">
          <div>
            <dt>Dátum absolvovania</dt>
            <dd>{fmt(done)}</dd>
          </div>
          <div>
            <dt>Platnosť do</dt>
            <dd>{fmt(validUntil)}</dd>
          </div>
          <div>
            <dt>Číslo potvrdenia</dt>
            <dd>{certNumber(r.id, r.completedAt)}</dd>
          </div>
        </dl>

        <p className="cert__foot">
          Potvrdenie je evidované v systéme Školenie o kyberbezpečnosti. Úrad podpredsedu vlády Slovenskej republiky pre
          Plán obnovy a znalostnú ekonomiku, Oddelenie IT.
        </p>
      </article>
    </div>
  )
}
