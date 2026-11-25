import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { CERT_STATUS_LABEL, certStatus, checkCertVerifyToken, COURSE_TITLE, fmtSkDate, isDemoNumber, VALID_MONTHS } from '@/certificates'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Overenie osvedčenia · Školenie o kyberbezpečnosti', robots: 'noindex' }

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

// GET /overenie/<číslo>?t=<podpis> – verejné overenie pravosti (odkaz z QR kódu na osvedčení).
// Bez platného podpisu neprezradí nič, ani to, či číslo existuje.
export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>
  searchParams: Promise<{ t?: string; n?: string; o?: string; d?: string }>
}) {
  const { number: raw } = await params
  const { t, n, o, d } = await searchParams
  const number = decodeURIComponent(raw)

  let c: AnyDoc | undefined
  const demo = isDemoNumber(number) && checkCertVerifyToken(number, t)
  if (demo) {
    // ukážka zo stránky /demo – údaje sú v odkaze, nič sa nehľadá v databáze
    const issued = /^\d{4}-\d{2}-\d{2}$/.test(String(d)) ? new Date(`${d}T12:00:00Z`) : new Date()
    const until = new Date(issued)
    until.setMonth(until.getMonth() + VALID_MONTHS)
    c = { number, name: String(n || 'Ukážkový zamestnanec'), departmentName: String(o || ''), issuedAt: issued.toISOString(), validUntil: until.toISOString() }
  } else if (checkCertVerifyToken(number, t)) {
    const payload = await getPayload({ config: await config })
    const res = await payload.find({
      collection: 'certificates',
      where: { number: { equals: number } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    c = res.docs[0] as AnyDoc | undefined
  }

  const status = c ? certStatus(c) : null
  const ok = status === 'valid' || status === 'expiring'

  return (
    <>
      <section className="app-hero">
        <div className="govuk-width-container">
          <h1 className="govuk-heading-xl">Overenie osvedčenia</h1>
          <p className="govuk-body-l">{COURSE_TITLE}</p>
        </div>
      </section>
      <div className="govuk-width-container govuk-main-wrapper">
        {demo && (
          <p className="verify-demo">
            <strong>UKÁŽKA</strong> – toto je ukážkové osvedčenie zo stránky Demo, nie skutočný doklad.
          </p>
        )}
        {!c ? (
          <div className="verify verify--bad">
            <div className="verify__icon" aria-hidden="true">!</div>
            <div>
              <h2 className="verify__title">Osvedčenie sa nepodarilo overiť</h2>
              <p className="verify__text">
                Odkaz je neúplný alebo neplatný. Naskenujte QR kód z osvedčenia znova, prípadne kontaktujte Oddelenie IT.
              </p>
            </div>
          </div>
        ) : (
          <div className={`verify ${ok ? 'verify--ok' : 'verify--bad'}`}>
            <div className="verify__icon" aria-hidden="true">{ok ? '✓' : '✕'}</div>
            <div>
              <h2 className="verify__title">
                {ok ? 'Osvedčenie je platné' : status === 'revoked' ? 'Osvedčenie bolo zrušené' : 'Platnosť osvedčenia vypršala'}
              </h2>
              <dl className="verify__meta">
                <div>
                  <dt>Meno</dt>
                  <dd>{c.name}</dd>
                </div>
                {c.departmentName && (
                  <div>
                    <dt>Odbor</dt>
                    <dd>{c.departmentName}</dd>
                  </div>
                )}
                <div>
                  <dt>Číslo</dt>
                  <dd>{c.number}</dd>
                </div>
                <div>
                  <dt>Vydané</dt>
                  <dd>{fmtSkDate(c.issuedAt)}</dd>
                </div>
                <div>
                  <dt>Platné do</dt>
                  <dd>{fmtSkDate(c.validUntil)}</dd>
                </div>
                <div>
                  <dt>Stav</dt>
                  <dd>{CERT_STATUS_LABEL[status!]}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
