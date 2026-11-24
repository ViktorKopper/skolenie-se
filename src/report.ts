import type { Payload } from 'payload'
import type { Difficulty } from './quiz-shared'

// Agregácia pre prehľad (/sprava a /sprava/export). Len server.
// Zoznam ľudí = aktívni používatelia z AD + ktokoľvek, kto má záznam (napr. starší test bez účtu).

export type PersonRow = {
  email: string
  name: string
  department: string // OU
  departmentName: string
  inAd: boolean
  topicsDone: number
  attempts: number
  bestPercent: number | null
  passed: boolean
  lastActivity: string | null
  lastLogin: string | null
  complete: boolean
  started: boolean
}

export type TopicStat = { slug: string; title: string; done: number }
export type DepartmentStat = { ou: string; name: string; people: number; complete: number; started: number }
export type QuestionStat = {
  id: string
  question: string
  topic: string
  difficulty: Difficulty
  answered: number
  wrong: number
  errorRate: number
}

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const latest = (a: string | null, b: string | null) => (!a ? b : !b ? a : a > b ? a : b)
const idOf = (v: unknown) => (v && typeof v === 'object' ? String((v as AnyDoc).id) : v == null ? '' : String(v))

export async function buildReport(payload: Payload, scope: { department?: string } = {}) {
  const [topicsRes, compRes, testRes, qRes, usersRes, depRes] = await Promise.all([
    payload.find({ collection: 'topics', where: { published: { equals: true } }, pagination: false, depth: 0, sort: 'order' }),
    payload.find({ collection: 'completions', pagination: false, depth: 0 }),
    payload.find({ collection: 'test-results', pagination: false, depth: 0 }),
    payload.find({ collection: 'questions', pagination: false, depth: 0 }),
    payload.find({ collection: 'users', where: { source: { equals: 'ldap' } }, pagination: false, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'departments', pagination: false, depth: 0, overrideAccess: true }),
  ])

  const topics = topicsRes.docs
  const topicIds = new Set(topics.map((t) => String(t.id)))
  const titleById = new Map(topics.map((t) => [String(t.id), t.title]))
  const depName = new Map((depRes.docs as AnyDoc[]).map((d) => [d.ou as string, (d.name as string) || (d.ou as string)]))
  const emailByUserId = new Map<string, string>()

  type P = PersonRow & { topicSet: Set<string>; tests: AnyDoc[] }
  const people = new Map<string, P>()
  const person = (email: string, init: Partial<PersonRow> = {}) => {
    const key = email.toLowerCase()
    let p = people.get(key)
    if (!p) {
      p = {
        email: key,
        name: '',
        department: '',
        departmentName: '',
        inAd: false,
        topicsDone: 0,
        attempts: 0,
        bestPercent: null,
        passed: false,
        lastActivity: null,
        lastLogin: null,
        complete: false,
        started: false,
        topicSet: new Set(),
        tests: [],
        ...init,
      }
      people.set(key, p)
    }
    return p
  }

  for (const u of usersRes.docs as AnyDoc[]) {
    if (!u.email) continue
    emailByUserId.set(String(u.id), String(u.email).toLowerCase())
    if (u.active === false) continue // odídení / vypnutí v AD
    person(u.email, {
      name: u.name || '',
      department: u.department || '',
      inAd: true,
      lastLogin: u.lastLogin || null,
    })
  }

  const ownerEmail = (doc: AnyDoc) => emailByUserId.get(idOf(doc.user)) || String(doc.email || '').toLowerCase()

  for (const c of compRes.docs as AnyDoc[]) {
    const tid = idOf(c.topic)
    const email = ownerEmail(c)
    if (!topicIds.has(tid) || !email) continue
    const p = person(email, { name: c.name || '' })
    p.topicSet.add(tid)
    p.lastActivity = latest(p.lastActivity, c.completedAt)
  }

  for (const r of testRes.docs as AnyDoc[]) {
    const email = ownerEmail(r)
    if (!email) continue
    const p = person(email, { name: r.name || '' })
    p.tests.push(r)
    p.attempts++
    p.bestPercent = Math.max(p.bestPercent ?? 0, r.percent ?? 0)
    if (r.passed) p.passed = true
    p.lastActivity = latest(p.lastActivity, r.completedAt)
  }

  // rozsah (vedúci vidí len svoj odbor)
  // pozor: prázdny reťazec = rozsah „Nezaradení“, nie „všetci“ (undefined = celý úrad)
  const all = [...people.values()].filter((p) => scope.department === undefined || p.department === scope.department)

  for (const p of all) {
    p.topicsDone = p.topicSet.size
    p.departmentName = p.department ? depName.get(p.department) || p.department : 'Nezaradení'
    p.complete = topics.length > 0 && p.topicsDone === topics.length && p.passed
    p.started = p.topicsDone > 0 || p.attempts > 0
  }

  // plnenie tém
  const doneByTopic = new Map<string, number>()
  for (const p of all) for (const tid of p.topicSet) doneByTopic.set(tid, (doneByTopic.get(tid) || 0) + 1)
  const topicStats: TopicStat[] = topics.map((t) => ({ slug: t.slug, title: t.title, done: doneByTopic.get(String(t.id)) || 0 }))

  // odbory
  const deps = new Map<string, DepartmentStat>()
  for (const p of all) {
    const d = deps.get(p.department) || { ou: p.department, name: p.departmentName, people: 0, complete: 0, started: 0 }
    d.people++
    if (p.complete) d.complete++
    if (p.started) d.started++
    deps.set(p.department, d)
  }
  const departments = [...deps.values()].sort((a, b) => a.name.localeCompare(b.name, 'sk'))

  // najťažšie otázky (z testov ľudí v rozsahu)
  const qText = new Map<string, { question: string; topic: string; difficulty: Difficulty }>()
  for (const q of qRes.docs as AnyDoc[]) {
    qText.set(String(q.id), {
      question: q.question,
      topic: titleById.get(idOf(q.topic)) || '',
      difficulty: (q.difficulty || 'easy') as Difficulty,
    })
  }
  const qStats = new Map<string, { answered: number; wrong: number }>()
  let attempts = 0
  let passedAttempts = 0
  for (const p of all) {
    for (const r of p.tests) {
      attempts++
      if (r.passed) passedAttempts++
      if (!Array.isArray(r.answers)) continue
      for (const a of r.answers as { id?: string; ok?: boolean }[]) {
        if (!a?.id) continue
        const s = qStats.get(a.id) || { answered: 0, wrong: 0 }
        s.answered++
        if (!a.ok) s.wrong++
        qStats.set(a.id, s)
      }
    }
  }
  const hardest: QuestionStat[] = [...qStats.entries()]
    .filter(([id, s]) => s.answered >= 3 && qText.has(id))
    .map(([id, s]) => ({ id, ...qText.get(id)!, answered: s.answered, wrong: s.wrong, errorRate: Math.round((s.wrong / s.answered) * 100) }))
    .sort((a, b) => b.errorRate - a.errorRate || b.answered - a.answered)
    .slice(0, 10)

  const rows: PersonRow[] = all
    .map(({ topicSet: _t, tests: _r, ...p }) => p)
    .sort((a, b) => a.departmentName.localeCompare(b.departmentName, 'sk') || (a.name || a.email).localeCompare(b.name || b.email, 'sk'))

  return {
    generatedAt: new Date().toISOString(),
    topicCount: topics.length,
    scopeName: scope.department === undefined ? null : depName.get(scope.department) || scope.department || 'Nezaradení',
    people: rows,
    topicStats,
    departments,
    hardest,
    kpi: {
      people: rows.length,
      complete: rows.filter((r) => r.complete).length,
      passed: rows.filter((r) => r.passed).length,
      notStarted: rows.filter((r) => !r.started).length,
      attempts,
      passedAttempts,
    },
  }
}

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('sk-SK', { timeZone: 'Europe/Bratislava' }) : '–'
