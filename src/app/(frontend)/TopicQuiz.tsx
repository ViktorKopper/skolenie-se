'use client'

import React, { useEffect, useState } from 'react'
import QuestionCard from './QuestionCard'
import CompleteButton from './CompleteButton'
import { useProgress } from './progress-store'
import { correctIndexes, miniRequired, sameSet, shuffle, type Difficulty } from '@/quiz-shared'

export type MiniQuestion = {
  id: string
  difficulty: Difficulty
  multiple: boolean
  question: string
  options: { text: string; correct: boolean }[]
  explanation: string
}

type Card = MiniQuestion & { display: { i: number; text: string }[]; correctIdx: number[] }

type Props = {
  slug: string
  questions: MiniQuestion[]
  next?: { slug: string; title: string } | null
}

export default function TopicQuiz({ slug, questions, next }: Props) {
  const { done, ready } = useProgress()
  const [attempt, setAttempt] = useState(0)
  const [deck, setDeck] = useState<Card[] | null>(null)
  const [sel, setSel] = useState<Record<string, number[]>>({})
  const [evaluated, setEvaluated] = useState(false)
  const [error, setError] = useState('')
  const [retake, setRetake] = useState(false)

  // Miešanie až v prehliadači (inak by sa líšil HTML zo servera a z klienta)
  useEffect(() => {
    setDeck(
      shuffle(questions).map((q) => ({
        ...q,
        display: shuffle(q.options.map((o, i) => ({ i, text: o.text }))),
        correctIdx: correctIndexes(q.options),
      })),
    )
    setSel({})
    setEvaluated(false)
    setError('')
  }, [questions, attempt])

  if (!ready || !deck) return <section className="quiz-mini" aria-busy="true" />

  if (questions.length === 0) return <CompleteButton slug={slug} next={next} answers={{}} />

  if (done.includes(slug) && !retake) {
    return (
      <>
        <CompleteButton slug={slug} next={next} />
        <p className="quiz-retake">
          <button
            type="button"
            className="app-linkbtn"
            onClick={() => {
              setRetake(true)
              setAttempt((a) => a + 1)
            }}
          >
            Zopakovať si mini-kvíz
          </button>
        </p>
      </>
    )
  }

  const total = deck.length
  const answered = deck.filter((q) => sel[q.id]?.length).length
  const correctCount = deck.filter((q) => sel[q.id] && sameSet(sel[q.id], q.correctIdx)).length
  const need = miniRequired(total)
  const passed = evaluated && correctCount >= need

  const toggle = (q: Card, i: number) => {
    if (evaluated) return
    setError('')
    setSel((s) => {
      if (!q.multiple) return { ...s, [q.id]: [i] }
      const cur = s[q.id] || []
      return { ...s, [q.id]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] }
    })
  }

  const evaluate = () => {
    const missing = total - answered
    if (missing > 0) {
      setError(`Odpovedzte na všetky otázky – ${missing === 1 ? 'chýba ešte 1' : `chýba ešte ${missing}`}.`)
      return
    }
    setEvaluated(true)
  }

  return (
    <section className="quiz-mini" aria-labelledby="mini-kviz">
      <div className="quiz-mini__head">
        <h2 id="mini-kviz">Mini-kvíz k téme</h2>
        <p>
          Overte si, čo ste si zapamätali. Na prejdenie témy treba aspoň {need} správne odpovede z {total}.
        </p>
      </div>

      <div className="quiz-progress">
        <div className="quiz-progress__bar">
          <div className="quiz-progress__fill" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
        <div className="quiz-progress__label">
          Zodpovedané {answered} z {total}
        </div>
      </div>

      {deck.map((q, n) => (
        <QuestionCard
          key={q.id}
          num={n + 1}
          question={q.question}
          difficulty={q.difficulty}
          multiple={q.multiple}
          options={q.display}
          selected={sel[q.id] || []}
          correct={evaluated ? q.correctIdx : null}
          locked={evaluated}
          onToggle={(i) => toggle(q, i)}
          footer={
            evaluated ? (
              <div className="quiz-expl">
                <strong>{sameSet(sel[q.id] || [], q.correctIdx) ? 'Správne. ' : 'Nesprávne. '}</strong>
                {q.explanation}
              </div>
            ) : null
          }
        />
      ))}

      {!evaluated && (
        <div className="test-submit">
          {error && (
            <p className="quiz-error" role="alert">
              {error}
            </p>
          )}
          <button type="button" className="govuk-button govuk-button--start" onClick={evaluate}>
            Vyhodnotiť mini-kvíz
          </button>
        </div>
      )}

      {evaluated &&
        (passed ? (
          <>
            <div className="quiz-result quiz-result--pass">
              <div className="quiz-result__score">
                {correctCount} / {total}
              </div>
              <div className="quiz-result__label">Výborne, tému ste zvládli.</div>
            </div>
            <CompleteButton slug={slug} next={next} answers={sel} />
          </>
        ) : (
          <div className="quiz-result quiz-result--fail">
            <div className="quiz-result__score">
              {correctCount} / {total}
            </div>
            <div className="quiz-result__label">
              Na prejdenie témy treba aspoň {need} správne odpovede. Prečítajte si tému ešte raz a skúste to znova.
            </div>
            <button
              type="button"
              className="govuk-button"
              style={{ marginBottom: 0 }}
              onClick={() => {
                setAttempt((a) => a + 1)
                document.getElementById('mini-kviz')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Skúsiť znova
            </button>
          </div>
        ))}
    </section>
  )
}
