import type { Payload, Where } from 'payload'

// Postup konkrétneho používateľa (podľa väzby na účet alebo e-mailu zo starších záznamov). Len server.

type U = { id: string | number; email?: string | null }

const ownerWhere = (u: U): Where => ({
  or: [{ user: { equals: u.id } }, ...(u.email ? [{ email: { equals: u.email.toLowerCase() } }] : [])],
})

export async function userCompletions(payload: Payload, u: U) {
  const res = await payload.find({ collection: 'completions', where: ownerWhere(u), pagination: false, depth: 0 })
  return res.docs
}

export async function userTests(payload: Payload, u: U) {
  const res = await payload.find({
    collection: 'test-results',
    where: ownerWhere(u),
    pagination: false,
    depth: 0,
    sort: '-completedAt',
  })
  return res.docs
}

export async function userDoneSlugs(payload: Payload, u: U): Promise<string[]> {
  const [comps, topics] = await Promise.all([
    userCompletions(payload, u),
    payload.find({ collection: 'topics', pagination: false, depth: 0 }),
  ])
  const slugById = new Map(topics.docs.map((t) => [String(t.id), t.slug]))
  const out = new Set<string>()
  for (const c of comps) {
    const tid = typeof c.topic === 'object' && c.topic ? String(c.topic.id) : String(c.topic)
    const slug = slugById.get(tid)
    if (slug) out.add(slug)
  }
  return [...out]
}
