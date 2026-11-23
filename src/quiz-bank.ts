import type { Payload } from 'payload'
import type { Difficulty } from './quiz-shared'

// Serverové načítanie banky otázok pre záverečný test

export type BankQ = {
  id: string
  topicId: string
  topicTitle: string
  difficulty: Difficulty
  multiple: boolean
  question: string
  options: { text: string; correct: boolean }[]
  explanation: string
}

export type BankTopic = { id: string; title: string; byDiff: Record<Difficulty, BankQ[]> }

export async function loadBank(payload: Payload) {
  const [topics, qs] = await Promise.all([
    payload.find({
      collection: 'topics',
      where: { published: { equals: true } },
      pagination: false,
      depth: 0,
      sort: 'order',
    }),
    payload.find({ collection: 'questions', pagination: false, depth: 0 }),
  ])

  const map = new Map<string, BankTopic>()
  for (const t of topics.docs) {
    map.set(String(t.id), { id: String(t.id), title: t.title, byDiff: { easy: [], medium: [], hard: [] } })
  }

  const byId = new Map<string, BankQ>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const q of qs.docs as any[]) {
    const topicId =
      q.topic && typeof q.topic === 'object' ? String(q.topic.id) : q.topic != null ? String(q.topic) : ''
    const t = map.get(topicId)
    const d = q.difficulty as Difficulty
    if (!t || !(d in t.byDiff) || !Array.isArray(q.options) || q.options.length < 2) continue
    const bq: BankQ = {
      id: String(q.id),
      topicId,
      topicTitle: t.title,
      difficulty: d,
      multiple: Boolean(q.multiple),
      question: q.question,
      options: q.options.map((o: { text: string; correct?: boolean | null }) => ({
        text: o.text,
        correct: Boolean(o.correct),
      })),
      explanation: q.explanation || '',
    }
    if (!bq.options.some((o) => o.correct)) continue
    t.byDiff[d].push(bq)
    byId.set(bq.id, bq)
  }

  // Do testu idú len témy, ktoré majú otázky všetkých troch obtiažností
  const eligible = [...map.values()].filter(
    (t) => t.byDiff.easy.length && t.byDiff.medium.length && t.byDiff.hard.length,
  )
  const eligibleIds = new Set(eligible.map((t) => t.id))
  for (const [id, q] of byId) if (!eligibleIds.has(q.topicId)) byId.delete(id)

  return { topics: eligible, byId }
}
