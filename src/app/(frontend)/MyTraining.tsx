'use client'

import React from 'react'
import Link from 'next/link'
import { useProgress } from './progress-store'
import { TEST_PASS_PCT } from '@/quiz-shared'

type Topic = { slug: string; title: string; summary?: string | null }

const fmt = (iso: string) => new Date(iso).toLocaleDateString('sk-SK', { timeZone: 'Europe/Bratislava' })

export default function MyTraining({ topics }: { topics: Topic[] }) {
  const { done, identity, tests, ready } = useProgress()
  if (!ready) return <div className="my-status" aria-busy="true" />

  const doneCount = topics.filter((t) => done.includes(t.slug)).length
  const allTopics = topics.length > 0 && doneCount === topics.length
  const passedTests = tests.filter((t) => t.passed)
  const best = passedTests[0] || null // najnovší úspešný
  const bestPercent = tests.length ? Math.max(...tests.map((t) => t.percent)) : null
  const complete = allTopics && passedTests.length > 0
  const nextTopic = topics.find((t) => !done.includes(t.slug))

  let next: { label: string; href: string; external?: boolean }
  if (nextTopic) next = { label: `Pokračovať: ${nextTopic.title}`, href: `/temy/${nextTopic.slug}` }
  else if (!passedTests.length) next = { label: 'Spustiť záverečný test', href: '/kviz' }
  else next = { label: 'Stiahnuť potvrdenie', href: `/potvrdenie/${best!.id}?t=${best!.token}`, external: true }

  return (
    <>
      <div className={`my-status${complete ? ' my-status--done' : ''}`}>
        <div className="my-status__icon" aria-hidden="true">
          {complete ? '✓' : `${Math.round((doneCount / Math.max(topics.length, 1)) * 100)}%`}
        </div>
        <div className="my-status__body">
          <h2 className="my-status__title">{complete ? 'Školenie máte splnené' : 'Školenie je rozpracované'}</h2>
          <p className="my-status__who">
            {identity ? (
              <>
                {identity.name} · {identity.email}
              </>
            ) : (
              'Meno a e-mail sa doplnia pri prvom zaznamenaní témy.'
            )}
          </p>
          <ol className="my-steps">
            <li className={allTopics ? 'is-done' : ''}>
              Prejsť všetky témy s mini-kvízom – <strong>{doneCount} z {topics.length}</strong>
            </li>
            <li className={passedTests.length ? 'is-done' : ''}>
              Záverečný test aspoň na {TEST_PASS_PCT} % –{' '}
              <strong>{bestPercent === null ? 'zatiaľ bez pokusu' : `najlepší výsledok ${bestPercent} %`}</strong>
            </li>
          </ol>
        </div>
        {next.external ? (
          <a className="govuk-button govuk-button--start my-status__btn" href={next.href} target="_blank" rel="noopener">
            {next.label}
          </a>
        ) : (
          <Link className="govuk-button govuk-button--start my-status__btn" href={next.href}>
            {next.label}
          </Link>
        )}
      </div>

      <h2 className="govuk-heading-m">Témy</h2>
      <div className="app-topics">
        {topics.map((t) => {
          const isDone = done.includes(t.slug)
          return (
            <Link key={t.slug} href={`/temy/${t.slug}`} className="app-topic">
              <span className="app-topic__title">{t.title}</span>
              {t.summary && <p className="app-topic__desc">{t.summary}</p>}
              {isDone ? (
                <span className="app-done">✓ Prejdené</span>
              ) : (
                <span className="app-done app-done--todo">Čaká na mini-kvíz</span>
              )}
            </Link>
          )
        })}
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
                <th>Potvrdenie</th>
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
                  <td>
                    {t.passed && t.token ? (
                      <a href={`/potvrdenie/${t.id}?t=${t.token}`} target="_blank" rel="noopener">
                        Stiahnuť
                      </a>
                    ) : (
                      '–'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="rep-note my-note">
        Prehľad sa zatiaľ zobrazuje z tohto prehliadača. Záznamy o absolvovaní sa však ukladajú aj na server. Po
        zavedení prihlásenia cez AD uvidíte svoj postup na akomkoľvek počítači.
      </p>
    </>
  )
}
