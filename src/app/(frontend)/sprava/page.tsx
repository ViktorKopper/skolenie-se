import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import React from 'react'
import config from '@/payload.config'
import { buildReport, fmtDate } from '@/report'
import { DIFF_LABEL } from '@/quiz-shared'

export const dynamic = 'force-dynamic'

const FILTERS = {
  vsetci: 'Všetci',
  splnene: 'Splnené',
  rozpracovane: 'Rozpracované',
  bez_testu: 'Bez úspešného testu',
} as const
type Filter = keyof typeof FILTERS

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return (
      <div className="govuk-width-container govuk-main-wrapper">
        <h1 className="govuk-heading-l">Prehľad školenia</h1>
        <p className="govuk-body">Prehľad je dostupný len pre administrátorov.</p>
        <Link className="govuk-button" href="/admin/login?redirect=%2Fsprava">
          Prihlásiť sa do administrácie
        </Link>
      </div>
    )
  }

  const { f } = await searchParams
  const filter: Filter = f && f in FILTERS ? (f as Filter) : 'vsetci'
  const r = await buildReport(payload)
  const k = r.kpi

  const people = r.people.filter((p) =>
    filter === 'splnene' ? p.complete : filter === 'rozpracovane' ? !p.complete : filter === 'bez_testu' ? !p.passed : true,
  )

  return (
    <>
      <section className="app-hero">
        <div className="govuk-width-container">
          <h1 className="govuk-heading-xl">Prehľad školenia</h1>
          <p className="govuk-body-l">Stav k {new Date(r.generatedAt).toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava' })}</p>
        </div>
      </section>

      <div className="govuk-width-container govuk-main-wrapper">
        <div className="rep-kpis">
          <div className="rep-kpi">
            <span className="rep-kpi__label">Ľudia v evidencii</span>
            <span className="rep-kpi__value">{k.people}</span>
          </div>
          <div className="rep-kpi">
            <span className="rep-kpi__label">Školenie splnené</span>
            <span className="rep-kpi__value">
              {k.complete} <small>({pct(k.complete, k.people)} %)</small>
            </span>
          </div>
          <div className="rep-kpi">
            <span className="rep-kpi__label">Úspešný záverečný test</span>
            <span className="rep-kpi__value">
              {k.passed} <small>({pct(k.passed, k.people)} %)</small>
            </span>
          </div>
          <div className="rep-kpi">
            <span className="rep-kpi__label">Pokusy o test</span>
            <span className="rep-kpi__value">
              {k.attempts} <small>({pct(k.passedAttempts, k.attempts)} % úspešných)</small>
            </span>
          </div>
        </div>
        <p className="rep-note">
          Evidencia zatiaľ obsahuje len ľudí, ktorí v systéme niečo absolvovali. Úplný zoznam zamestnancov a rozdelenie
          podľa odborov pribudne so synchronizáciou z AD.
        </p>

        <div className="rep-exports">
          <a className="govuk-button govuk-button--secondary" href="/sprava/export">Prehľad ľudí (CSV)</a>
          <a className="govuk-button govuk-button--secondary" href="/progress/export">Absolvovanie tém (CSV)</a>
          <a className="govuk-button govuk-button--secondary" href="/test/export">Výsledky testov (CSV)</a>
        </div>

        <h2 className="govuk-heading-m">Plnenie tém</h2>
        <div className="rep-bars">
          {r.topicStats.map((t) => (
            <div className="rep-bar" key={t.slug}>
              <span className="rep-bar__label">{t.title}</span>
              <span className="rep-bar__track">
                <span className="rep-bar__fill" style={{ width: `${pct(t.done, k.people)}%` }} />
              </span>
              <span className="rep-bar__value">
                {t.done} / {k.people}
              </span>
            </div>
          ))}
        </div>

        <h2 className="govuk-heading-m">Ľudia</h2>
        <nav className="rep-filter" aria-label="Filter">
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <Link
              key={key}
              href={key === 'vsetci' ? '/sprava' : `/sprava?f=${key}`}
              className={`rep-filter__item${filter === key ? ' rep-filter__item--active' : ''}`}
            >
              {FILTERS[key]}
            </Link>
          ))}
        </nav>
        {people.length === 0 ? (
          <p className="govuk-body">V tomto filtri nie je nikto.</p>
        ) : (
          <div className="rep-table-wrap">
            <table className="rep-table">
              <thead>
                <tr>
                  <th>Meno</th>
                  <th>E-mail</th>
                  <th>Témy</th>
                  <th>Najlepší test</th>
                  <th>Pokusy</th>
                  <th>Stav</th>
                  <th>Posledná aktivita</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.email}>
                    <td>{p.name || '–'}</td>
                    <td>{p.email}</td>
                    <td>
                      {p.topicsDone} / {r.topicCount}
                    </td>
                    <td>{p.bestPercent === null ? '–' : `${p.bestPercent} %`}</td>
                    <td>{p.attempts}</td>
                    <td>
                      <span className={`rep-badge ${p.complete ? 'rep-badge--ok' : 'rep-badge--wip'}`}>
                        {p.complete ? 'Splnené' : 'Rozpracované'}
                      </span>
                    </td>
                    <td>{fmtDate(p.lastActivity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="govuk-heading-m rep-section">Najťažšie otázky v záverečnom teste</h2>
        {r.hardest.length === 0 ? (
          <p className="govuk-body">Zatiaľ málo odpovedí – štatistika sa zobrazí, keď má otázka aspoň 3 odpovede.</p>
        ) : (
          <div className="rep-table-wrap">
            <table className="rep-table">
              <thead>
                <tr>
                  <th>Otázka</th>
                  <th>Téma</th>
                  <th>Obtiažnosť</th>
                  <th>Odpovedí</th>
                  <th>Chybovosť</th>
                </tr>
              </thead>
              <tbody>
                {r.hardest.map((q) => (
                  <tr key={q.id}>
                    <td className="rep-table__q">{q.question}</td>
                    <td>{q.topic}</td>
                    <td>{DIFF_LABEL[q.difficulty]}</td>
                    <td>{q.answered}</td>
                    <td>
                      <strong>{q.errorRate} %</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
