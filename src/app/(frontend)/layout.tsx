import React from 'react'
import './idsk.scss'
import IdskInit from './IdskInit'
import Nav from './Nav'

export const metadata = {
  title: 'Školenie o kyberbezpečnosti',
  description: 'Vzdelávanie a referencia k rozpoznávaniu social engineeringu.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className="govuk-template">
      <body className="govuk-template__body">
        <IdskInit />

        <header className="govuk-header idsk-shadow-head" data-module="govuk-header">
          <div className="govuk-predheader govuk-width-container">
            <div className="govuk-header__logo">
              <a href="/" className="govuk-header__link govuk-header__link--homepage" title="Titulná stránka">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/urad.png" alt="Úrad podpredsedu vlády SR pre Plán obnovy a znalostnú ekonomiku" />
              </a>
            </div>
            <span className="app-wordmark">Školenie o kyberbezpečnosti</span>
            <div className="govuk-header__btns-search">
              <form className="app-search" role="search" action="/#temy">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="search" name="search" placeholder="Hľadať tému…" aria-label="Hľadať tému" />
              </form>
            </div>
          </div>

          <Nav />
        </header>

        <main className="govuk-main-wrapper" id="main-content">{children}</main>

        <footer className="govuk-footer">
          <div className="govuk-width-container">
            <div className="govuk-footer__meta">
              <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
                <span className="govuk-footer__licence-description">
                  Úrad podpredsedu vlády Slovenskej republiky pre Plán obnovy a znalostnú ekonomiku · Oddelenie IT
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
