import React from 'react'
import Link from 'next/link'
import { TEST_PASS_PCT } from '@/quiz-shared'
import type { CertStatus } from '@/certificates'

// Serverový komponent – dáta prichádzajú z DB pre prihláseného používateľa

export type MyTopic = { slug: string; title: string; summary?: string | null; doneAt: string | null }
export type MyTest = {
  id: string
  date: string
  percent: number
  score: number
  maxScore: number
  passed: boolean
}
export type MyCertificate = { number: string; url: string; issuedAt: string; validUntil: string; status: CertStatus }

type Props = {
  user: { name: string; email: string; department: string }
  topics: MyTopic[]
  tests: MyTest[]
  certificate: MyCertificate | null
}

const STATUS: Record<CertStatus, { label: string; cls: string }> = {
  valid: { label: 'Platné', cls: 'rep-badge--ok' },
  expiring: { label: 'Platnosť čoskoro končí', cls: 'rep-badge--wip' },
  expired: { label: 'Platnosť vypršala', cls: 'rep-badge--fail' },
  revoked: { label: 'Zrušené', cls: 'rep-badge--fail' },
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString('sk-SK', { timeZone: 'Europe/Bratislava' })

export default function MyTraining({ user, topics, tests, certificate }: Props) {
  const doneCount = topics.filter((t) => t.doneAt).length
  const allTopics = topics.length > 0 && doneCount === topics.length
  const bestPercent = tests.length ? Math.max(...tests.map((t) => t.percent)) : null
  const certActive = Boolean(certificate && (certificate.status === 'valid' || certificate.status === 'expiring'))
  const complete = allTopics && certActive
  const nextTopic = topics.find((t) => !t.doneAt)

  let next: { label: string; href: string; external?: boolean }
  if (nextTopic) next = { label: `Pokračovať: ${nextTopic.title}`, href: `/temy/${nextTopic.slug}` }
  else if (!certActive) next = { label: certificate ? 'Obnoviť osvedčenie – spustiť test' : 'Spustiť záverečný test', href: '/kviz' }
  else next = { label: 'Stiahnuť osvedčenie (PDF)', href: certificate!.url, external: true }

  return (
    <>
      <div className={`my-status${complete ? ' my-status--done' : ''}`}>
        <div className="my-status__icon" aria-hidden="true">
          {complete ? '✓' : `${Math.round((doneCount / Math.max(topics.length, 1)) * 100)}%`}
        </div>
        <div className="my-status__body">
          <h2 className="my-status__title">{complete ? 'Školenie máte splnené' : 'Školenie je rozpracované'}</h2>
          <p className="my-status__who">
            {user.name} · {user.email}
            {user.department ? ` · ${user.department}` : ''}
          </p>
          <ol className="my-steps">
            <li className={allTopics ? 'is-done' : ''}>
              Prejsť všetky témy s mini-kvízom – <strong>{doneCount} z {topics.length}</strong>
            </li>
            <li className={certActive ? 'is-done' : ''}>
              Záverečný test aspoň na {TEST_PASS_PCT} % –{' '}
              <strong>{bestPercent === null ? 'zatiaľ bez pokusu' : `najlepší výsledok ${bestPercent} %`}</strong>
            </li>
          </ol>
        </div>
        {next.external ? (
          <a className="govuk-button govuk-button--start my-status__btn" href={next.href}>
            {next.label}
          </a>
        ) : (
          <Link className="govuk-button govuk-button--start my-status__btn" href={next.href}>
            {next.label}
          </Link>
        )}
      </div>

      {certificate && (
        <div className="my-cert">
          <div className="my-cert__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <div className="my-cert__body">
            <h2 className="my-cert__title">
              Osvedčenie <span className={`rep-badge ${STATUS[certificate.status].cls}`}>{STATUS[certificate.status].label}</span>
            </h2>
            <p className="my-cert__meta">
              Č. <strong>{certificate.number}</strong> · vydané {fmt(certificate.issuedAt)} · platné do{' '}
              <strong>{fmt(certificate.validUntil)}</strong>
            </p>
            {certificate.status === 'expiring' && (
              <p className="my-cert__note">Platnosť čoskoro skončí. Novým úspešným testom po jej skončení získate nové osvedčenie.</p>
            )}
            {certificate.status === 'expired' && (
              <p className="my-cert__note">Platnosť skončila. Zopakujte si témy a urobte záverečný test znova.</p>
            )}
          </div>
          {certificate.status !== 'revoked' && (
            <a className="rep-btn" href={certificate.url}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Stiahnuť PDF
            </a>
          )}
        </div>
      )}

      <h2 className="govuk-heading-m">Témy</h2>
      <div className="app-topics">
        {topics.map((t) => (
          <Link key={t.slug} href={`/temy/${t.slug}`} className="app-topic">
            <span className="app-topic__title">{t.title}</span>
            {t.summary && <p className="app-topic__desc">{t.summary}</p>}
            {t.doneAt ? (
              <span className="app-done">✓ Prejdené {fmt(t.doneAt)}</span>
            ) : (
              <span className="app-done app-done--todo">Čaká na mini-kvíz</span>
            )}
          </Link>
        ))}
      </div>

      <h2 className="govuk-heading-m my-section">Záverečné testy</h2>
      {tests.length === 0 ? (
        <p className="govuk-body">
          Zatiaľ ste záverečný test neabsolvovali. <Link href="/kviz">Spustiť test</Link>
        </p>
      ) : (
        <div className="rep-table-wrap">
          <table className="rep-table">
            <thead>
              <tr>
                <th>Dátum</th>
                <th>Výsledok</th>
                <th>Body</th>
                <th>Stav</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td>{fmt(t.date)}</td>
                  <td>{t.percent} %</td>
                  <td>
                    {t.score} / {t.maxScore}
                  </td>
                  <td>
                    <span className={`rep-badge ${t.passed ? 'rep-badge--ok' : 'rep-badge--fail'}`}>
                      {t.passed ? 'Úspešný' : 'Neúspešný'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
