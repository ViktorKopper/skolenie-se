import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import config from '@/payload.config'
import { isAdminUser } from '@/access'
import { appBaseUrl, demoCertificate, demoVerifyUrl } from '@/certificates'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Demo · Školenie o kyberbezpečnosti' }

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

// /demo – ukážky pre administrátorov na testovanie a prezentáciu. Nič sa neukladá do štatistík ani osvedčení.
export default async function DemoPage() {
  const payload = await getPayload({ config: await config })
  const h = await headers()
  const { user } = await payload.auth({ headers: h })
  if (!user) redirect('/prihlasenie?next=/demo')
  if (!isAdminUser(user)) {
    return (
      <div className="govuk-width-container govuk-main-wrapper">
        <h1 className="govuk-heading-l">Demo</h1>
        <p className="govuk-body">Stránka je dostupná len pre administrátorov.</p>
      </div>
    )
  }
  const u = user as AnyDoc
  let dept = ''
  if (u.department) {
    const d = await payload.find({ collection: 'departments', where: { ou: { equals: u.department } }, limit: 1, depth: 0 })
    dept = (d.docs[0] as AnyDoc | undefined)?.name || u.department
  }
  const name = String(u.name || u.email || '')
  const base = appBaseUrl(h)
  const validLink = demoVerifyUrl(base, demoCertificate({ name, department: dept, percent: 88, expired: false }))
  const expiredLink = demoVerifyUrl(base, demoCertificate({ name, department: dept, percent: 88, expired: true }))

  return (
    <>
      <section className="app-hero">
        <div className="govuk-width-container">
          <h1 className="govuk-heading-xl">Demo</h1>
          <p className="govuk-body-l">
            Ukážky na testovanie a prezentáciu. Nič z tejto stránky sa neukladá do štatistík, výsledkov ani osvedčení.
          </p>
        </div>
      </section>

      <div className="govuk-width-container govuk-main-wrapper">
        <div className="demo-grid">
          <section className="demo-card">
            <h2 className="demo-card__title">Záverečný test bez záznamu</h2>
            <p className="demo-card__text">
              Skutočný test s náhodnými otázkami a vyhodnotením. Výsledok sa neuloží a namiesto osvedčenia dostanete
              ukážkové PDF.
            </p>
            <Link className="rep-btn rep-btn--primary" href="/demo/test">
              Spustiť ukážkový test
            </Link>
          </section>

          <section className="demo-card">
            <h2 className="demo-card__title">Ukážkové osvedčenie (PDF)</h2>
            <p className="demo-card__text">Vygeneruje PDF s vodoznakom UKÁŽKA a číslom končiacim na -DEMO.</p>
            <form className="demo-form" action="/demo/osvedcenie" method="get" target="_blank">
              <label>
                <span>Meno</span>
                <input name="meno" defaultValue={name} />
              </label>
              <label>
                <span>Odbor</span>
                <input name="odbor" defaultValue={dept} />
              </label>
              <div className="demo-form__row">
                <label>
                  <span>Výsledok (%)</span>
                  <input name="vysledok" type="number" min={75} max={100} defaultValue={88} />
                </label>
                <label>
                  <span>Stav</span>
                  <select name="stav" defaultValue="platne">
                    <option value="platne">Platné</option>
                    <option value="vyprsane">Platnosť vypršala</option>
                  </select>
                </label>
              </div>
              <button type="submit" className="rep-btn rep-btn--primary">
                Otvoriť ukážkové PDF
              </button>
            </form>
          </section>

          <section className="demo-card">
            <h2 className="demo-card__title">Overenie cez QR kód</h2>
            <p className="demo-card__text">Stránky, ktoré uvidí ten, kto naskenuje QR kód z osvedčenia.</p>
            <ul className="demo-links">
              <li>
                <a href={validLink} target="_blank" rel="noopener">Platné osvedčenie</a>
              </li>
              <li>
                <a href={expiredLink} target="_blank" rel="noopener">Osvedčenie s vypršanou platnosťou</a>
              </li>
              <li>
                <a href="/overenie/UPPVL-KB-0000-00-00-000?t=neplatny" target="_blank" rel="noopener">
                  Neplatný alebo upravený odkaz
                </a>
              </li>
            </ul>
          </section>

          <section className="demo-card">
            <h2 className="demo-card__title">Ďalšie obrazovky</h2>
            <ul className="demo-links">
              <li>
                <Link href="/moje-skolenie">Moje školenie</Link> – postup a karta s osvedčením
              </li>
              <li>
                <Link href="/sprava">Prehľad</Link> – štatistiky, odbory, osvedčenia
              </li>
              <li>
                <Link href="/temy">Témy</Link> – obsah a mini-kvízy
              </li>
              <li>
                <a href="/admin" target="_blank" rel="noopener">Administrácia</a> – obsah, otázky, osvedčenia
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
