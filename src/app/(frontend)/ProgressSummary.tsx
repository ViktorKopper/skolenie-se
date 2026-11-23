'use client'

import React from 'react'
import { useProgress } from './progress-store'

export default function ProgressSummary({ slugs }: { slugs: string[] }) {
  const { done, ready } = useProgress()
  if (!ready || slugs.length === 0) return null
  const count = slugs.filter((s) => done.includes(s)).length
  const pct = Math.round((count / slugs.length) * 100)

  return (
    <div className="app-progress">
      <div className="app-progress__row">
        <span className="app-progress__label">
          {count === slugs.length ? 'Všetky témy máte prejdené' : `Prejdené ${count} z ${slugs.length} tém`}
        </span>
        <span className="app-progress__pct">{pct} %</span>
      </div>
      <div className="app-progress__bar">
        <div className="app-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
