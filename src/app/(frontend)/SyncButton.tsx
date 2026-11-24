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
      const d = await res.json().catch(() => ({}))
      if (!res.ok || !d.ok) throw new Error(d.error || 'Synchronizácia zlyhala.')
      setMsg(`Hotovo: ${d.active} aktívnych, ${d.deactivated} deaktivovaných, ${d.departments} odborov.`)
      setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Synchronizácia zlyhala.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="rep-sync">
      <button type="button" className="govuk-button govuk-button--secondary" onClick={run} disabled={busy}>
        {busy ? 'Synchronizujem…' : 'Synchronizovať z AD'}
      </button>
      {msg && <span className="rep-sync__msg">{msg}</span>}
    </span>
  )
}
