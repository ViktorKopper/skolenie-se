import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'
import { ALLOWED_EMAIL_DOMAIN, isAllowedEmail } from '@/progress-config'
import { loadBank, type BankQ } from '@/quiz-bank'
import { certToken } from '@/cert'
import {
  POINTS,
  TEST_PASS_PCT,
  correctIndexes,
  expectedMix,
  parseSelected,
  sameSet,
  type Difficulty,
} from '@/quiz-shared'

export const dynamic = 'force-dynamic'

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status })
const INVALID = 'Neplatný test – spustite ho, prosím, znova.'

// POST /test/submit { name, email, answers: [{ id, selected: number[] }] }
// Overí štruktúru testu, vyhodnotí ho na serveri a uloží výsledok.
export async function POST(req: Request) {
  let body: { name?: unknown; email?: unknown; answers?: unknown }
  try {
    body = await req.json()
  } catch {
    return bad('Neplatná požiadavka.')
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  if (!isAllowedEmail(email) || email.length > 200) return bad(`Použite služobný e-mail @${ALLOWED_EMAIL_DOMAIN}.`)
  if (name.length < 3) return bad('Zadajte meno a priezvisko.')

  const payload = await getPayload({ config: await config })
  const bank = await loadBank(payload)
  const topicCount = bank.topics.length
  const answers = Array.isArray(body.answers) ? body.answers : null
  if (!topicCount || !answers || answers.length !== topicCount * 2) return bad(INVALID)

  const seen = new Set<string>()
  const perTopic = new Map<string, Difficulty[]>()
  const mix: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 }
  const graded: { q: BankQ; selected: number[]; correctIdx: number[]; ok: boolean }[] = []

  for (const a of answers as { id?: unknown; selected?: unknown }[]) {
    const id = typeof a?.id === 'string' || typeof a?.id === 'number' ? String(a.id) : ''
    const q = bank.byId.get(id)
    if (!q || seen.has(id)) return bad(INVALID)
    seen.add(id)

    const selected = parseSelected(a.selected, q.options.length)
    if (!selected || (!q.multiple && selected.length !== 1)) return bad('Odpovedzte na všetky otázky.')

    const list = perTopic.get(q.topicId) || []
    list.push(q.difficulty)
    perTopic.set(q.topicId, list)
    mix[q.difficulty]++

    const correctIdx = correctIndexes(q.options)
    graded.push({ q, selected, correctIdx, ok: sameSet(selected, correctIdx) })
  }

  // Štruktúra musí sedieť s tým, čo generuje /test/start (2 z každej témy, rôzna obtiažnosť, daný mix)
  const exp = expectedMix(topicCount)
  const structureOk =
    perTopic.size === topicCount &&
    [...perTopic.values()].every((ds) => ds.length === 2 && ds[0] !== ds[1]) &&
    mix.easy === exp.easy &&
    mix.medium === exp.medium &&
    mix.hard === exp.hard
  if (!structureOk) return bad(INVALID)

  const maxScore = graded.reduce((s, g) => s + POINTS[g.q.difficulty], 0)
  const score = graded.reduce((s, g) => s + (g.ok ? POINTS[g.q.difficulty] : 0), 0)
  const passed = (score / maxScore) * 100 >= TEST_PASS_PCT
  const percent = Math.round((score / maxScore) * 100)
  const correctCount = graded.filter((g) => g.ok).length

  const saved = await payload.create({
    collection: 'test-results',
    data: {
      name,
      email,
      score,
      maxScore,
      percent,
      passed,
      correctCount,
      total: graded.length,
      completedAt: new Date().toISOString(),
      answers: graded.map((g) => ({
        id: g.q.id,
        topic: g.q.topicTitle,
        difficulty: g.q.difficulty,
        selected: g.selected,
        correct: g.correctIdx,
        ok: g.ok,
      })),
    },
  })

  return NextResponse.json({
    ok: true,
    resultId: String(saved.id),
    certToken: passed ? certToken(saved.id) : null,
    score,
    maxScore,
    percent,
    passed,
    correctCount,
    total: graded.length,
    results: graded.map((g) => ({
      id: g.q.id,
      correct: g.ok,
      correctIdx: g.correctIdx,
      explanation: g.q.explanation,
      points: POINTS[g.q.difficulty],
    })),
  })
}
