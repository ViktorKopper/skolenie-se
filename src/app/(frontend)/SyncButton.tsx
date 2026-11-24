'use client'

import React, { useState } from 'react'

// Ručné spustenie synchronizácie z AD (inak beží v noci cez cron)
export default function SyncButton() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function run() {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/auth/sync', { method: 'POST' })
      const d = await res.json().catch(() => null)
      if (!d) throw new Error(`Synchronizácia zlyhala (HTTP ${res.status}${res.status === 504 ? ' – vypršal čas na proxy' : ''}).`)
      if (!res.ok || !d.ok) throw new Error(d.error || `Synchronizácia zlyhala (HTTP ${res.status}).`)
      setMsg(
        `Hotovo: ${d.active} aktívnych, ${d.deactivated} deaktivovaných, ${d.departments} odborov` +
          (d.errors ? `, ${d.errors} chýb (pozri log)` : '') + '.',
      )
      setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Synchronizácia zlyhala.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="rep-sync">
      <button type="button" className="rep-btn rep-btn--primary" onClick={run} disabled={busy}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        {busy ? 'Synchronizujem…' : 'Synchronizovať z AD'}
      </button>
      {msg && <span className="rep-sync__msg">{msg}</span>}
    </span>
  )
}
