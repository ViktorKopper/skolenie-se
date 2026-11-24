import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import config from '@/payload.config'
import { isAdminUser, isManagerUser } from '@/access'
import { buildReport, fmtDate } from '@/report'
import { DIFF_LABEL } from '@/quiz-shared'
import SyncButton from '../SyncButton'

export const dynamic = 'force-dynamic'

const FILTERS = {
  vsetci: 'Všetci',
  splnene: 'Splnené',
  rozpracovane: 'Rozpracované',
  nezacali: 'Nezačali',
  bez_testu: 'Bez úspešného testu',
} as const
type Filter = keyof typeof FILTERS

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ f?: string; odbor?: string }> }) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/prihlasenie?next=/sprava')

  const admin = isAdminUser(user)
  const manager = isManagerUser(user)
  if (!admin && !manager) {
    return (
      <div className="govuk-width-container govuk-main-wrapper">
        <h1 className="govuk-heading-l">Prehľad školenia</h1>
        <p className="govuk-body">Prehľad je dostupný len pre vedúcich a administrátorov.</p>
      </div>
    )
  }

  const { f, odbor } = await searchParams
  const filter: Filter = f && f in FILTERS ? (f as Filter) : 'vsetci'
  // vedúci vidí vždy len svoj odbor; admin môže filtrovať podľa odboru
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const department = manager && !admin ? String((user as any).department || '') : typeof odbor === 'string' ? odbor : ''
  const r = await buildReport(payload, department || (manager && !admin) ? { department } : {})
  const k = r.kpi

  const people = r.people.filter((p) =>
    filter === 'splnene'
      ? p.complete
      : filter === 'rozpracovane'
        ? p.started && !p.complete
        : filter === 'nezacali'
          ? !p.started
          : filter === 'bez_testu'
            ? !p.passed
            : true,
  )
  const qs = (next: Record<string, string>) => {
    const p = new URLSearchParams({ ...(odbor && admin ? { odbor } : {}), ...next })
    for (const [key, v] of [...p.entries()]) if (!v || v === 'vsetci') p.delete(key)
    const s = p.toString()
    return s ? `/sprava?${s}` : '/sprava'
  }

  return (
    <>
      <section className="app-hero">
        <div className="govuk-width-container">
          <h1 className="govuk-heading-xl">Prehľad školenia{r.scopeName ? ` – ${r.scopeName}` : ''}</h1>
          <p className="govuk-body-l">
            Stav k {new Date(r.generatedAt).toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava' })}
          </p>
        </div>
      </section>

      <div className="govuk-width-container govuk-main-wrapper">
        {admin && odbor && (
          <p className="govuk-body">
            <Link href="/sprava">← Späť na celý úrad</Link>
          </p>
        )}

        <div className="rep-kpis">
          <div className="rep-kpi">
            <span className="rep-kpi__label">Zamestnanci</span>
            <span className="rep-kpi__value">{k.people}</span>
          </div>
          <div className="rep-kpi">
            <span className="rep-kpi__label">Školenie splnené</span>
            <span className="rep-kpi__value">
              {k.complete} <small>({pct(k.complete, k.people)} %)</small>
            </span>
          </div>
          <div className="rep-kpi">
            <span className="rep-kpi__label">Ešte nezačali</span>
            <span className="rep-kpi__value">
              {k.notStarted} <small>({pct(k.notStarted, k.people)} %)</small>
            </span>
          </div>
          <div className="rep-kpi">
            <span className="rep-kpi__label">Pokusy o test</span>
            <span className="rep-kpi__value">
              {k.attempts} <small>({pct(k.passedAttempts, k.attempts)} % úspešných)</small>
            </span>
          </div>
        </div>

        <div className="rep-exports">
          <a className="rep-btn" href={department ? `/sprava/export?odbor=${encodeURIComponent(department)}` : '/sprava/export'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Prehľad ľudí (CSV)
          </a>
          {admin && (
            <>
              <a className="rep-btn" href="/progress/export">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Absolvovanie tém (CSV)
              </a>
              <a className="rep-btn" href="/test/export">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Výsledky testov (CSV)
              </a>
              <SyncButton />
            </>
          )}
        </div>

        {admin && !odbor && r.departments.length > 0 && (
          <>
            <h2 className="govuk-heading-m">Odbory</h2>
            <div className="rep-table-wrap rep-block">
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Odbor</th>
                    <th>Zamestnanci</th>
                    <th>Začali</th>
                    <th>Splnené</th>
                    <th>Plnenie</th>
                  </tr>
                </thead>
                <tbody>
                  {r.departments.map((d) => (
                    <tr key={d.ou || '-'}>
                      <td>{d.ou ? <Link href={`/sprava?odbor=${encodeURIComponent(d.ou)}`}>{d.name}</Link> : d.name}</td>
                      <td>{d.people}</td>
                      <td>{d.started}</td>
                      <td>{d.complete}</td>
                      <td className="rep-table__bar">
                        <span className="rep-bar__track">
                          <span className="rep-bar__fill" style={{ width: `${pct(d.complete, d.people)}%` }} />
                        </span>
                        <span>{pct(d.complete, d.people)} %</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

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

        <h2 className="govuk-heading-m">Zamestnanci</h2>
        <nav className="rep-filter" aria-label="Filter">
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <Link key={key} href={qs({ f: key })} className={`rep-filter__item${filter === key ? ' rep-filter__item--active' : ''}`}>
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
                  {!department && <th>Odbor</th>}
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
                    <td>
                      {p.name || p.email}
                      <span className="rep-table__sub">{p.email}</span>
                    </td>
                    {!department && <td>{p.departmentName}</td>}
                    <td>
                      {p.topicsDone} / {r.topicCount}
                    </td>
                    <td>{p.bestPercent === null ? '–' : `${p.bestPercent} %`}</td>
                    <td>{p.attempts}</td>
                    <td>
                      <span
                        className={`rep-badge ${p.complete ? 'rep-badge--ok' : p.started ? 'rep-badge--wip' : 'rep-badge--none'}`}
                      >
                        {p.complete ? 'Splnené' : p.started ? 'Rozpracované' : 'Nezačal/a'}
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
