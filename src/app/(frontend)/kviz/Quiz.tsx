'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import QuestionCard from '../QuestionCard'
import { TEST_PASS_PCT, shuffle, type Difficulty } from '@/quiz-shared'

type TestQ = {
  id: string
  topic: string
  difficulty: Difficulty
  multiple: boolean
  question: string
  options: { i: number; text: string }[]
}

type QResult = { id: string; correct: boolean; correctIdx: number[]; explanation: string; points: number }

type Result = {
  resultId: string
  certificate: { number: string; url: string; validUntil: string } | null
  score: number
  maxScore: number
  percent: number
  passed: boolean
  correctCount: number
  total: number
  results: QResult[]
}

type Phase = 'intro' | 'loading' | 'test' | 'sending' | 'result'

type Props = {
  user: { name: string; email: string }
  doneCount: number
  topicCount: number
  demo?: boolean // ukážka zo stránky /demo – výsledok sa neukladá
}

export function FinalTest({ user, doneCount, topicCount, demo = false }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [qs, setQs] = useState<TestQ[]>([])
  const [sel, setSel] = useState<Record<string, number[]>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  async function start() {
    setError('')
    setPhase('loading')
    try {
      const res = await fetch('/test/start', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.error || 'Test sa nepodarilo načítať.')
      setQs((data.questions as TestQ[]).map((q) => ({ ...q, options: shuffle(q.options) })))
      setSel({})
      setResult(null)
      setPhase('test')
      window.scrollTo({ top: 0 })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test sa nepodarilo načítať.')
      setPhase(result ? 'result' : 'intro')
    }
  }

  function toggle(q: TestQ, i: number) {
    setError('')
    setSel((s) => {
      if (!q.multiple) return { ...s, [q.id]: [i] }
      const cur = s[q.id] || []
      return { ...s, [q.id]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] }
    })
  }

  async function submit() {
    const missing = qs.filter((q) => !sel[q.id]?.length).length
    if (missing > 0) {
      setError(`Odpovedzte na všetky otázky – ${missing === 1 ? 'chýba ešte 1' : `chýba ešte ${missing}`}.`)
      return
    }
    setPhase('sending')
    setError('')
    try {
      const res = await fetch('/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: qs.map((q) => ({ id: q.id, selected: sel[q.id] })), ...(demo ? { demo: true } : {}) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.error || 'Test sa nepodarilo vyhodnotiť.')
      setResult(data as Result)
      setPhase('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test sa nepodarilo vyhodnotiť.')
      setPhase('test')
    }
  }

  // ───────── úvod
  if (phase === 'intro' || phase === 'loading') {
    return (
      <div className="test-intro">
        <h2>Ako test prebieha</h2>
        <ul className="test-rules">
          <li>
            <strong>20 otázok</strong> – 2 z každej témy. Každý pokus má iný výber aj poradie otázok.
          </li>
          <li>Body podľa obtiažnosti: ľahká 1, stredná 2, ťažká 3 (spolu 40 bodov).</li>
          <li>
            Na úspešné absolvovanie treba aspoň <strong>{TEST_PASS_PCT} %</strong>.
          </li>
          <li>Pri otázkach s viacerými odpoveďami treba vybrať všetky správne.</li>
          <li>Správne odpovede a vysvetlenia uvidíte až po odovzdaní testu.</li>
        </ul>

        {doneCount < topicCount && (
          <p className="test-note">
            Prejdené témy: {doneCount} z {topicCount}. Odporúčame najprv prejsť všetky <Link href="/temy">témy</Link>.
          </p>
        )}

        {demo ? (
          <p className="verify-demo">
            <strong>UKÁŽKA</strong> – výsledok sa neuloží do štatistík a nevznikne skutočné osvedčenie.
          </p>
        ) : (
          <p className="app-complete__who">
            Výsledok sa zaznamená pre <strong>{user.name}</strong> ({user.email}).
          </p>
        )}

        {error && (
          <p className="quiz-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="govuk-button govuk-button--start test-intro__btn"
          onClick={start}
          disabled={phase === 'loading'}
        >
          {phase === 'loading' ? 'Pripravujem test…' : 'Spustiť test'}
        </button>
      </div>
    )
  }

  // ───────── výsledok
  if (phase === 'result' && result) {
    const byId = new Map(result.results.map((r) => [r.id, r]))
    return (
      <>
        <div className={`quiz-result ${result.passed ? 'quiz-result--pass' : 'quiz-result--fail'}`}>
          <div className="quiz-result__score">{result.percent} %</div>
          <div className="quiz-result__label">
            {result.passed
              ? 'Gratulujeme, záverečný test ste úspešne absolvovali.'
              : `Na úspech treba aspoň ${TEST_PASS_PCT} %. Zopakujte si témy a skúste to znova.`}
          </div>
          <p className="quiz-result__meta">
            {result.score} z {result.maxScore} bodov · {result.correctCount} z {result.total} otázok správne
          </p>
          {result.passed && result.certificate && (
            <p className="quiz-result__meta">
              Osvedčenie č. <strong>{result.certificate.number}</strong> platí do{' '}
              {new Date(result.certificate.validUntil).toLocaleDateString('sk-SK', { timeZone: 'Europe/Bratislava' })}.
            </p>
          )}
          {error && (
            <p className="quiz-error" role="alert">
              {error}
            </p>
          )}
          <div className="quiz-result__actions">
            {result.passed && result.certificate && (
              <a className="govuk-button govuk-button--start" href={result.certificate.url} {...(demo ? { target: '_blank', rel: 'noopener' } : {})}>
                Stiahnuť osvedčenie (PDF)
              </a>
            )}
            <button type="button" className="govuk-button" onClick={start}>
              Spustiť nový test
            </button>
            <Link className="govuk-button govuk-button--secondary" href={demo ? '/demo' : '/moje-skolenie'}>
              {demo ? 'Späť na Demo' : 'Moje školenie'}
            </Link>
          </div>
        </div>

        <h2 className="govuk-heading-m test-review__title">Prehľad odpovedí</h2>
        {qs.map((q, n) => {
          const r = byId.get(q.id)
          return (
            <QuestionCard
              key={q.id}
              num={n + 1}
              question={q.question}
              difficulty={q.difficulty}
              multiple={q.multiple}
              options={q.options}
              selected={sel[q.id] || []}
              correct={r ? r.correctIdx : []}
              locked
              onToggle={() => undefined}
              footer={
                r && (
                  <div className="quiz-expl">
                    <strong>{r.correct ? `Správne (+${r.points} b). ` : 'Nesprávne. '}</strong>
                    {r.explanation}
                    <span className="quiz-topic"> Téma: {q.topic}</span>
                  </div>
                )
              }
            />
          )
        })}
      </>
    )
  }

  // ───────── test
  const answered = qs.filter((q) => sel[q.id]?.length).length
  return (
    <>
      <div className="quiz-progress">
        <div className="quiz-progress__bar">
          <div className="quiz-progress__fill" style={{ width: `${(answered / qs.length) * 100}%` }} />
        </div>
        <div className="quiz-progress__label">
          Zodpovedané {answered} z {qs.length}
        </div>
      </div>

      {qs.map((q, n) => (
        <QuestionCard
          key={q.id}
          num={n + 1}
          question={q.question}
          difficulty={q.difficulty}
          multiple={q.multiple}
          options={q.options}
          selected={sel[q.id] || []}
          correct={null}
          locked={phase === 'sending'}
          onToggle={(i) => toggle(q, i)}
          footer={<p className="quiz-topic">Téma: {q.topic}</p>}
        />
      ))}

      <div className="test-submit">
        {error && (
          <p className="quiz-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          className="govuk-button govuk-button--start"
          onClick={submit}
          disabled={phase === 'sending'}
        >
          {phase === 'sending' ? 'Vyhodnocujem…' : 'Odovzdať test'}
        </button>
      </div>
    </>
  )
}
