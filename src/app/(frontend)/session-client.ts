'use client'

import { useEffect, useState } from 'react'
import { replaceDone } from './progress-store'

export type SessionUser = {
  name: string
  email: string
  role: 'employee' | 'manager' | 'admin'
  department: string
}

type Me = { user: SessionUser | null; done: string[] }

let pending: Promise<Me> | null = null

function load(): Promise<Me> {
  if (!pending) {
    pending = fetch('/auth/me', { cache: 'no-store', credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : { user: null, done: [] }))
      .catch(() => ({ user: null, done: [] }))
  }
  return pending
}

// Prihlásený používateľ (zo servera). Zároveň zosynchronizuje prejdené témy pre odznaky.
export function useSession() {
  const [state, setState] = useState<{ ready: boolean; user: SessionUser | null }>({ ready: false, user: null })
  useEffect(() => {
    let alive = true
    load().then((d) => {
      if (!alive) return
      replaceDone(d.user ? d.done : [])
      setState({ ready: true, user: d.user })
    })
    return () => {
      alive = false
    }
  }, [])
  return state
}

export async function logout() {
  await fetch('/auth/logout', { method: 'POST' }).catch(() => undefined)
  await fetch('/api/users/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined) // lokálny admin
  pending = null
  window.location.href = '/'
}
