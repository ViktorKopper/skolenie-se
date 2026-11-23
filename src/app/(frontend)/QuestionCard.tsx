'use client'

import React from 'react'
import { DIFF_LABEL, type Difficulty } from '@/quiz-shared'

type Props = {
  num: number
  question: string
  difficulty: Difficulty
  multiple: boolean
  options: { i: number; text: string }[] // poradie na obrazovke, i = pôvodný index
  selected: number[] // vybrané pôvodné indexy
  correct: number[] | null // null = odpoveď sa ešte neukazuje
  locked: boolean
  onToggle: (i: number) => void
  footer?: React.ReactNode
}

export default function QuestionCard({
  num,
  question,
  difficulty,
  multiple,
  options,
  selected,
  correct,
  locked,
  onToggle,
  footer,
}: Props) {
  return (
    <div className="quiz-card">
      <div className="quiz-card__q">
        <span className="quiz-card__num">{num}</span>
        <div className="quiz-card__body">
          <div className="quiz-card__meta">
            <span className={`quiz-tag quiz-tag--${difficulty}`}>
              {DIFF_LABEL[difficulty]}
              {multiple ? ' · viac odpovedí' : ''}
            </span>
          </div>
          <div className="quiz-card__text">{question}</div>
          {multiple && !locked && <div className="quiz-hint">Vyberte všetky správne odpovede.</div>}
        </div>
      </div>

      <div role="group" aria-label={`Otázka ${num}`}>
        {options.map((o) => {
          const isSel = selected.includes(o.i)
          let cls = 'quiz-opt' + (multiple ? ' quiz-opt--multi' : '')
          let mark = ''
          if (correct) {
            if (correct.includes(o.i)) {
              cls += ' quiz-opt--correct'
              mark = '✓'
            } else if (isSel) {
              cls += ' quiz-opt--wrong'
              mark = '✕'
            }
          } else if (isSel) {
            cls += ' quiz-opt--selected'
            mark = multiple ? '✓' : ''
          }
          return (
            <button
              key={o.i}
              type="button"
              className={cls}
              disabled={locked}
              aria-pressed={isSel}
              onClick={() => onToggle(o.i)}
            >
              <span className="quiz-opt__mark" aria-hidden="true">
                {mark}
              </span>
              <span>{o.text}</span>
            </button>
          )
        })}
      </div>

      {footer}
    </div>
  )
}
