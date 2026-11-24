'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { markDone, useProgress } from './progress-store'

type Props = {
  slug: string
  next?: { slug: string; title: string } | null
  answers?: Record<string, number[]> // odpovede z úspešného mini-kvízu → zapíšu sa automaticky
}

export default function CompleteButton({ slug, next, answers }: Props) {
  const { done, ready } = useProgress()
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [error, setError] = useState('')
  const sent = useRef(false)
  const isDone = done.includes(slug)

  const save = useCallback(async () => {
    setState('saving')
    setError('')
    try {
      const res = await fetch('/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, answers: answers || {} }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.error || 'Záznam sa nepodarilo uložiť.')
      markDone(slug)
      setState('idle')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Záznam sa nepodarilo uložiť.')
      setState('error')
    }
  }, [slug, answers])

  // po úspešnom mini-kvíze sa absolvovanie zapíše samo (identita je z prihlásenia)
  useEffect(() => {
    if (ready && answers && !isDone && !sent.current) {
      sent.current = true
      void save()
    }
  }, [ready, answers, isDone, save])

  if (!ready) return <div className="app-complete" aria-busy="true" />

  if (isDone) {
    return (
      <div className="app-complete app-complete--done">
        <div className="app-complete__check" aria-hidden="true">✓</div>
        <div className="app-complete__body">
          <h2 className="app-complete__title">Túto tému máte prejdenú</h2>
          <p className="app-complete__text">Absolvovanie je zaznamenané vo vašom účte.</p>
        </div>
        {next ? (
          <Link className="govuk-button govuk-button--start app-complete__btn" href={`/temy/${next.slug}`}>
            Ďalšia téma: {next.title}
          </Link>
        ) : (
          <Link className="govuk-button govuk-button--start app-complete__btn" href="/kviz">
            Pokračovať na záverečný test
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="app-complete">
      <div className="app-complete__body">
        <h2 className="app-complete__title">
          {state === 'error' ? 'Absolvovanie sa nepodarilo zapísať' : 'Zapisujem absolvovanie témy…'}
        </h2>
        {error && (
          <p className="app-complete__error" role="alert">
            {error}
          </p>
        )}
      </div>
      {state === 'error' && (
        <button type="button" className="govuk-button govuk-button--start app-complete__btn" onClick={save}>
          Skúsiť znova
        </button>
      )}
    </div>
  )
}
