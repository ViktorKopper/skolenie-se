'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { logout, useSession } from './session-client'

const HELPDESK_URL = 'https://helpdesk.uppvl.sk/'

// Obrysové ikony v jednom štýle (24×24, čiara 2, zaoblené konce, farba = text)
const ICONS: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  topics: (
    <>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </>
  ),
  quiz: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  me: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  report: (
    <>
      <path d="M3 3v18h18" />
      <path d="M8 17v-4" />
      <path d="M13 17V9" />
      <path d="M18 17V6" />
    </>
  ),
  help: (
    <>
      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
      <path d="M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" />
      <path d="M3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z" />
    </>
  ),
  external: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>
  ),
  login: (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
}

function Icon({ name, small = false }: { name: keyof typeof ICONS; small?: boolean }) {
  return (
    <svg
      className={small ? 'nav-icon nav-icon--small' : 'nav-icon'}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

export default function Nav() {
  const path = usePathname() || '/'
  const { ready, user } = useSession()
  const canReport = user?.role === 'admin' || user?.role === 'manager'

  const item = (active: boolean) =>
    'govuk-header__navigation-item' + (active ? ' govuk-header__navigation-item--active' : '')

  return (
    <nav id="navigation" aria-label="Menu" className="govuk-header__navigation govuk-width-container">
      <div className="govuk-header__navigation-list">
        <ul>
          <li className={item(path === '/')}>
            <a className="govuk-header__link nav-link" href="/">
              <Icon name="home" />
              Domov
            </a>
          </li>
          <li className={item(path.startsWith('/temy'))}>
            <a className="govuk-header__link nav-link" href="/temy">
              <Icon name="topics" />
              Témy
            </a>
          </li>
          <li className={item(path.startsWith('/kviz'))}>
            <a className="govuk-header__link nav-link" href="/kviz">
              <Icon name="quiz" />
              Kvíz
            </a>
          </li>
          <li className={item(path.startsWith('/moje-skolenie') || path.startsWith('/potvrdenie'))}>
            <a className="govuk-header__link nav-link" href="/moje-skolenie">
              <Icon name="me" />
              Moje školenie
            </a>
          </li>
          {canReport && (
            <li className={item(path.startsWith('/sprava'))}>
              <a className="govuk-header__link nav-link" href="/sprava">
                <Icon name="report" />
                Prehľad
              </a>
            </li>
          )}
          <li className="govuk-header__navigation-item govuk-header__navigation-item--help">
            <a className="govuk-header__link nav-link nav-help" href={HELPDESK_URL} target="_blank" rel="noopener noreferrer">
              <Icon name="help" />
              IT Helpdesk
              <Icon name="external" small />
            </a>
          </li>
          {ready &&
            (user ? (
              <li className="govuk-header__navigation-item">
                <button type="button" className="govuk-header__link nav-link nav-logout" onClick={logout} title={user.name}>
                  <Icon name="logout" />
                  Odhlásiť
                </button>
              </li>
            ) : (
              <li className={item(path.startsWith('/prihlasenie'))}>
                <a className="govuk-header__link nav-link" href={`/prihlasenie?next=${encodeURIComponent(path)}`}>
                  <Icon name="login" />
                  Prihlásiť sa
                </a>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  )
}
