'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ALLOWED_EMAIL_DOMAIN, isAllowedEmail } from '@/progress-config'
import { markDone, setIdentity, useProgress } from './progress-store'

type Props = {
  slug: string
  next?: { slug: string; title: string } | null
  answers?: Record<string, number[]> // odpovede z mini-kvízu, server ich overí
}

export default function CompleteButton({ slug, next, answers }: Props) {
  const { done, identity, ready } = useProgress()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isDone = done.includes(slug)
  const needIdentity = !identity || editing

  async function submit() {
    setError('')
    const who = needIdentity ? { name: name.trim(), email: email.trim().toLowerCase() } : identity!
    if (needIdentity) {
      if (who.name.length < 3) return setError('Zadajte meno a priezvisko.')
      if (!isAllowedEmail(who.email)) return setError(`Zadajte služobný e-mail v tvare meno.priezvisko@${ALLOWED_EMAIL_DOMAIN}.`)
    }
    setBusy(true)
    try {
      const res = await fetch('/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...who, answers: answers || {} }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.error || 'Záznam sa nepodarilo uložiť. Skúste to znova.')
      setIdentity(who)
      setEditing(false)
      markDone(slug)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Záznam sa nepodarilo uložiť.')
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return <div className="app-complete" aria-busy="true" />

  if (isDone) {
    return (
      <div className="app-complete app-complete--done">
        <div className="app-complete__check" aria-hidden="true">✓</div>
        <div className="app-complete__body">
          <h2 className="app-complete__title">Túto tému máte prejdenú</h2>
          <p className="app-complete__text">
            Absolvovanie je zaznamenané{identity ? ` pre ${identity.email}` : ''}.
          </p>
        </div>
        {next ? (
          <Link className="govuk-button govuk-button--start app-complete__btn" href={`/temy/${next.slug}`}>
            Ďalšia téma: {next.title}
          </Link>
        ) : (
          <Link className="govuk-button govuk-button--start app-complete__btn" href="/kviz">
            Pokračovať na kvíz
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="app-complete">
      <div className="app-complete__body">
        <h2 className="app-complete__title">Zaznamenajte absolvovanie témy</h2>
        <p className="app-complete__text">
          Mini-kvíz máte úspešne za sebou. Záznam slúži ako evidencia absolvovania školenia o kyberbezpečnosti.
        </p>

        {needIdentity ? (
          <div className="app-complete__form">
            <label className="app-field">
              <span>Meno a priezvisko</span>
              <input value={name} onChange={(e) => { setName(e.target.value); setError('') }} autoComplete="name" />
            </label>
            <label className="app-field">
              <span>Služobný e-mail</span>
              <input
                type="email"
                value={email}
                placeholder={`meno.priezvisko@${ALLOWED_EMAIL_DOMAIN}`}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                autoComplete="email"
              />
            </label>
          </div>
        ) : (
          <p className="app-complete__who">
            Zaznamená sa pre <strong>{identity!.name}</strong> ({identity!.email}){' '}
            <button type="button" className="app-linkbtn" onClick={() => { setName(identity!.name); setEmail(identity!.email); setEditing(true) }}>
              zmeniť
            </button>
          </p>
        )}

        {error && <p className="app-complete__error" role="alert">{error}</p>}
      </div>

      <button type="button" className="govuk-button govuk-button--start app-complete__btn" onClick={submit} disabled={busy}>
        {busy ? 'Ukladám…' : 'Zaznamenať absolvovanie'}
      </button>
    </div>
  )
}
