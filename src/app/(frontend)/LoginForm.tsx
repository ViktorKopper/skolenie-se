'use client'

import React, { useState } from 'react'

const Eye = ({ off }: { off: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
)

export default function LoginForm({ next }: { next: string }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!login.trim()) return setError('Zadajte prihlasovacie meno.')
    if (!password) return setError('Zadajte heslo.')
    setBusy(true)
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password, next, remember }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.error || 'Prihlásenie sa nepodarilo.')
      window.location.href = data.next || next
    } catch (err) {
      setPassword('')
      setError(err instanceof Error ? err.message : 'Prihlásenie sa nepodarilo.')
      setBusy(false)
    }
  }

  return (
    <form className="login-box" onSubmit={submit} noValidate>
      <h1 className="login-box__title">Prihlásenie</h1>
      <p className="login-box__sub">Prihláste sa svojimi prihlasovacími údajmi do počítača.</p>

      <div className="login-box__info">
        Prihláste sa rovnakým prihlasovacím menom a heslom ako do počítača a služobnej pošty (MS Exchange).
      </div>

      <div className="login-box__field">
        <label htmlFor="login">Prihlasovacie meno alebo e-mail</label>
        <input
          id="login"
          value={login}
          onChange={(e) => { setLogin(e.target.value); setError('') }}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
        />
      </div>

      <div className="login-box__field">
        <label htmlFor="password">Heslo</label>
        <div className="login-box__pw">
          <input
            id="password"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="login-box__eye"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Skryť heslo' : 'Zobraziť heslo'}
            aria-pressed={show}
          >
            <Eye off={show} />
          </button>
        </div>
      </div>

      <label className="login-box__remember">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        Zapamätať si ma
      </label>

      {error && (
        <p className="login-box__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="login-box__btn" disabled={busy}>
        {busy ? 'Prihlasujem…' : 'Prihlásiť sa'}
      </button>

      <p className="login-box__hint">
        Problém s prihlásením? Kontaktujte{' '}
        <a href="https://helpdesk.uppvl.sk/" target="_blank" rel="noopener noreferrer">
          IT Helpdesk
        </a>
        .
      </p>
    </form>
  )
}
