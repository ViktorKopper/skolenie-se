import type { Payload } from 'payload'
import type { Difficulty } from './quiz-shared'

// Agregácia pre reporting (/sprava a /sprava/export). Len na serveri.

export type PersonRow = {
  email: string
  name: string
  topicsDone: number
  lastTopicAt: string | null
  attempts: number
  bestPercent: number | null
  passed: boolean
  lastTestAt: string | null
  lastActivity: string | null
  complete: boolean // všetky témy + úspešný test
}

export type TopicStat = { slug: string; title: string; done: number }

export type QuestionStat = {
  id: string
  question: string
  topic: string
  difficulty: Difficulty
  answered: number
  wrong: number
  errorRate: number
}

const latest = (a: string | null, b: string | null) => (!a ? b : !b ? a : a > b ? a : b)

export async function buildReport(payload: Payload) {
  const [topicsRes, compRes, testRes, qRes] = await Promise.all([
    payload.find({ collection: 'topics', where: { published: { equals: true } }, pagination: false, depth: 0, sort: 'order' }),
    payload.find({ collection: 'completions', pagination: false, depth: 0 }),
    payload.find({ collection: 'test-results', pagination: false, depth: 0 }),
    payload.find({ collection: 'questions', pagination: false, depth: 0 }),
  ])

  const topics = topicsRes.docs
  const topicIds = new Set(topics.map((t) => String(t.id)))
  const titleById = new Map(topics.map((t) => [String(t.id), t.title]))
  const people = new Map<string, PersonRow & { topicSet: Set<string> }>()

  const person = (email: string, name?: string | null) => {
    let p = people.get(email)
    if (!p) {
      p = {
        email,
        name: name || '',
        topicsDone: 0,
        lastTopicAt: null,
        attempts: 0,
        bestPercent: null,
        passed: false,
        lastTestAt: null,
        lastActivity: null,
        complete: false,
        topicSet: new Set(),
      }
      people.set(email, p)
    }
    if (name && !p.name) p.name = name
    return p
  }

  // absolvované témy
  const doneByTopic = new Map<string, number>()
  for (const c of compRes.docs) {
    const tid = typeof c.topic === 'object' && c.topic ? String(c.topic.id) : String(c.topic)
    if (!topicIds.has(tid)) continue
    const p = person(c.email, c.name)
    if (!p.topicSet.has(tid)) {
      p.topicSet.add(tid)
      doneByTopic.set(tid, (doneByTopic.get(tid) || 0) + 1)
    }
    p.lastTopicAt = latest(p.lastTopicAt, c.completedAt)
  }

  // záverečné testy + štatistika otázok
  const qText = new Map<string, { question: string; topic: string; difficulty: Difficulty }>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const q of qRes.docs as any[]) {
    const tid = q.topic && typeof q.topic === 'object' ? String(q.topic.id) : String(q.topic)
    qText.set(String(q.id), {
      question: q.question,
      topic: titleById.get(tid) || '',
      difficulty: (q.difficulty || 'easy') as Difficulty,
    })
  }
  const qStats = new Map<string, { answered: number; wrong: number }>()
  let passedAttempts = 0
  for (const r of testRes.docs) {
    const p = person(r.email, r.name)
    p.attempts++
    p.bestPercent = Math.max(p.bestPercent ?? 0, r.percent ?? 0)
    if (r.passed) {
      p.passed = true
      passedAttempts++
    }
    p.lastTestAt = latest(p.lastTestAt, r.completedAt)
    if (Array.isArray(r.answers)) {
      for (const a of r.answers as { id?: string; ok?: boolean }[]) {
        if (!a?.id) continue
        const s = qStats.get(a.id) || { answered: 0, wrong: 0 }
        s.answered++
        if (!a.ok) s.wrong++
        qStats.set(a.id, s)
      }
    }
  }

  const rows: PersonRow[] = [...people.values()].map(({ topicSet, ...p }) => {
    const topicsDone = topicSet.size
    return {
      ...p,
      topicsDone,
      lastActivity: latest(p.lastTopicAt, p.lastTestAt),
      complete: topicsDone === topics.length && topics.length > 0 && p.passed,
    }
  })
  rows.sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email, 'sk'))

  const topicStats: TopicStat[] = topics.map((t) => ({
    slug: t.slug,
    title: t.title,
    done: doneByTopic.get(String(t.id)) || 0,
  }))

  const hardest: QuestionStat[] = [...qStats.entries()]
    .filter(([id, s]) => s.answered >= 3 && qText.has(id))
    .map(([id, s]) => ({
      id,
      ...qText.get(id)!,
      answered: s.answered,
      wrong: s.wrong,
      errorRate: Math.round((s.wrong / s.answered) * 100),
    }))
    .sort((a, b) => b.errorRate - a.errorRate || b.answered - a.answered)
    .slice(0, 10)

  const total = rows.length
  return {
    generatedAt: new Date().toISOString(),
    topicCount: topics.length,
    people: rows,
    topicStats,
    hardest,
    kpi: {
      people: total,
      passed: rows.filter((r) => r.passed).length,
      complete: rows.filter((r) => r.complete).length,
      allTopics: rows.filter((r) => r.topicsDone === topics.length && topics.length > 0).length,
      attempts: testRes.docs.length,
      passedAttempts,
    },
  }
}

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('sk-SK', { timeZone: 'Europe/Bratislava' }) : '–'
