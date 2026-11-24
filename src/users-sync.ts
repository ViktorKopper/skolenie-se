import { randomBytes } from 'crypto'
import type { Payload } from 'payload'
import { ldapListUsers, type LdapUser, type Role } from './ldap'

// Zápis používateľov z AD do Payloadu (pri prihlásení aj pri nočnej synchronizácii). Len server.

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

export async function ensureDepartment(payload: Payload, ou: string, cache?: Set<string>) {
  if (!ou || cache?.has(ou)) return
  const found = await payload.find({
    collection: 'departments',
    where: { ou: { equals: ou } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (!found.docs[0]) {
    await payload.create({ collection: 'departments', data: { ou, name: ou }, overrideAccess: true })
  }
  cache?.add(ou)
}

export async function upsertLdapUser(
  payload: Payload,
  u: LdapUser & { role: Role },
  opts: { login?: boolean } = {},
): Promise<AnyDoc> {
  const now = new Date().toISOString()
  const base = {
    name: u.name,
    username: u.username,
    department: u.department,
    title: u.title,
    active: true,
    lastSync: now,
    ...(opts.login ? { lastLogin: now } : {}),
  }

  const byUsername = await payload.find({
    collection: 'users',
    where: { username: { equals: u.username } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const existing = byUsername.docs[0] as AnyDoc | undefined

  if (existing) {
    const isLocal = existing.source !== 'ldap'
    return payload.update({
      collection: 'users',
      id: existing.id,
      // lokálny (núdzový) admin si ponechá svoj typ účtu aj rolu
      data: isLocal ? base : { ...base, email: u.email, role: u.role, source: 'ldap' },
      overrideAccess: true,
      depth: 0,
    }) as Promise<AnyDoc>
  }

  // existuje už účet s rovnakým e-mailom (typicky lokálny admin) → prepojíme ho s AD
  const byEmail = await payload.find({
    collection: 'users',
    where: { email: { equals: u.email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (byEmail.docs[0]) {
    const doc = byEmail.docs[0] as AnyDoc
    const isLocal = doc.source !== 'ldap'
    return payload.update({
      collection: 'users',
      id: doc.id,
      data: isLocal ? base : { ...base, role: u.role, source: 'ldap' },
      overrideAccess: true,
      depth: 0,
    }) as Promise<AnyDoc>
  }

  return payload.create({
    collection: 'users',
    data: {
      ...base,
      email: u.email,
      role: u.role,
      source: 'ldap',
      sessionVersion: 0,
      password: randomBytes(32).toString('hex'), // nepoužíva sa – prihlásenie ide cez AD
    },
    overrideAccess: true,
    depth: 0,
  }) as Promise<AnyDoc>
}

// Nočná synchronizácia: založí/aktualizuje všetkých z AD, deaktivuje odídených a vypnuté účty
export async function syncFromAd(payload: Payload) {
  const users = await ldapListUsers()
  const depCache = new Set<string>()
  const seen = new Set<string>()
  let upserted = 0

  for (const u of users) {
    if (!u.username || u.disabled || u.excluded) continue
    await upsertLdapUser(payload, u)
    await ensureDepartment(payload, u.department, depCache)
    seen.add(u.username)
    upserted++
  }

  const active = await payload.find({
    collection: 'users',
    where: { and: [{ source: { equals: 'ldap' } }, { active: { not_equals: false } }] },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  let deactivated = 0
  for (const doc of active.docs as AnyDoc[]) {
    if (doc.username && !seen.has(doc.username)) {
      await payload.update({
        collection: 'users',
        id: doc.id,
        data: { active: false, sessionVersion: (doc.sessionVersion || 0) + 1 },
        overrideAccess: true,
        depth: 0,
      })
      deactivated++
    }
  }

  return { inAd: users.length, active: upserted, deactivated, departments: depCache.size }
}
