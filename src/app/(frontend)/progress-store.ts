'use client'

import { useEffect, useState } from 'react'

// Prejdené témy pre odznaky v UI. Zdroj pravdy je server (/auth/me) – tu je len rýchla kópia,
// ktorú session-client pri každom načítaní stránky prepíše.

const DONE_KEY = 'se-done'
const EVT = 'se-progress'

function read(): string[] {
  try {
    const v = window.localStorage.getItem(DONE_KEY)
    return v ? (JSON.parse(v) as string[]) : []
  } catch {
    return []
  }
}

function write(value: string[]) {
  try {
    window.localStorage.setItem(DONE_KEY, JSON.stringify(value))
  } catch {
    /* súkromný režim a pod. */
  }
  window.dispatchEvent(new Event(EVT))
}

export const getDone = read

export function replaceDone(slugs: string[]) {
  write([...new Set(slugs)])
}

export function markDone(slug: string) {
  write([...new Set([...read(), slug])])
}

export function useProgress() {
  const [done, setDone] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => {
      setDone(read())
      setReady(true)
    }
    sync()
    window.addEventListener(EVT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { done, ready }
}
