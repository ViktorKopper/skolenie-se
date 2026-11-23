'use client'

import { useEffect, useState } from 'react'

// Stav v prehliadači – kto som a ktoré témy mám prejdené (pre UI).
// Záväzná evidencia je v DB (kolekcia Completions).
export type Identity = { email: string; name: string }
export type TestAttempt = {
  id: string
  token: string
  percent: number
  passed: boolean
  score: number
  maxScore: number
  date: string
}

const ID_KEY = 'se-identity'
const DONE_KEY = 'se-done'
const TESTS_KEY = 'se-tests'
const EVT = 'se-progress'

function read<T>(key: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* súkromný režim a pod. – UI len nezapamätá stav */
  }
  window.dispatchEvent(new Event(EVT))
}

export const getIdentity = () => read<Identity | null>(ID_KEY, null)
export const setIdentity = (i: Identity | null) => write(ID_KEY, i)
export const getDone = () => read<string[]>(DONE_KEY, [])

export const getTests = () => read<TestAttempt[]>(TESTS_KEY, [])
export function addTest(t: TestAttempt) {
  write(TESTS_KEY, [t, ...getTests().filter((x) => x.id !== t.id)].slice(0, 50))
}

export function markDone(slug: string) {
  const done = new Set(getDone())
  done.add(slug)
  write(DONE_KEY, [...done])
}

// Hook: aktuálny zoznam prejdených tém + identita, reaguje na zmeny aj v iných kartách
export function useProgress() {
  const [done, setDone] = useState<string[]>([])
  const [identity, setId] = useState<Identity | null>(null)
  const [tests, setTests] = useState<TestAttempt[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => {
      setDone(getDone())
      setId(getIdentity())
      setTests(getTests())
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

  return { done, identity, tests, ready }
}
