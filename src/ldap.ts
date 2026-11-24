import fs from 'fs'
import { Client } from 'ldapts'

// Prihlásenie a čítanie z AD cez LDAPS. Len server.
// Konfigurácia je v .env (pozri DEPLOY.md, časť LDAP).

export type Role = 'employee' | 'manager' | 'admin'

export type LdapUser = {
  dn: string
  username: string // sAMAccountName (meno.priezvisko), malými písmenami
  email: string
  name: string
  title: string
  department: string // názov OU tesne pod LDAP_BASE_DN
  disabled: boolean
  excluded: boolean
}

const env = (k: string) => (process.env[k] || '').trim()
const list = (k: string) =>
  env(k)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export function ldapConfig() {
  return {
    urls: list('LDAP_URL'),
    bindDn: env('LDAP_BIND_DN'),
    bindPassword: process.env.LDAP_BIND_PASSWORD || '',
    baseDn: env('LDAP_BASE_DN'),
    upnSuffix: env('LDAP_UPN_SUFFIX'),
    adminGroup: env('LDAP_ADMIN_GROUP'),
    managerGroup: env('LDAP_MANAGER_GROUP'),
    excludeOus: list('LDAP_EXCLUDE_OUS').map((s) => s.toLowerCase()),
    caFile: env('LDAP_CA_FILE'),
    // len pre vývoj: vypne overenie certifikátu DC (v produkcii sa ignoruje)
    insecure: process.env.NODE_ENV !== 'production' && env('LDAP_TLS_INSECURE') === '1',
  }
}

export const ldapConfigured = () => {
  const c = ldapConfig()
  return c.urls.length > 0 && Boolean(c.bindDn) && Boolean(c.baseDn)
}

// ───────── TLS: koreňový certifikát CA (PEM aj DER z certutil)
let caCache: Buffer[] | undefined
function loadCa(file: string): Buffer[] | undefined {
  if (!file) return undefined
  if (caCache) return caCache
  const raw = fs.readFileSync(file)
  const text = raw.toString('utf8')
  let pem: string
  if (text.includes('-----BEGIN CERTIFICATE-----')) {
    pem = text
  } else {
    const b64 = raw.toString('base64').match(/.{1,64}/g)!.join('\n')
    pem = `-----BEGIN CERTIFICATE-----\n${b64}\n-----END CERTIFICATE-----\n`
  }
  caCache = [Buffer.from(pem)]
  return caCache
}

function newClient(url: string) {
  const c = ldapConfig()
  return new Client({
    url,
    timeout: 10000,
    connectTimeout: 5000,
    tlsOptions: { ca: loadCa(c.caFile), minVersion: 'TLSv1.2', rejectUnauthorized: !c.insecure },
  })
}

// RFC 4515 – escapovanie hodnôt vo filtri
export function escapeFilter(v: string) {
  return v.replace(/[\\*()\0]/g, (ch) => '\\' + ch.charCodeAt(0).toString(16).padStart(2, '0'))
}

// ───────── DN → odbor (OU tesne pod base DN)
function rdns(dn: string): string[] {
  const out: string[] = []
  let cur = ''
  for (let i = 0; i < dn.length; i++) {
    const ch = dn[i]
    if (ch === '\\' && i + 1 < dn.length) {
      cur += ch + dn[i + 1]
      i++
      continue
    }
    if (ch === ',') {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

export function departmentFromDn(dn: string, baseDn: string): string {
  const r = rdns(dn)
  const b = rdns(baseDn)
  if (r.length <= b.length + 1) return '' // priamo v base OU
  const tail = r.slice(r.length - b.length).map((x) => x.toLowerCase()).join(',')
  if (tail !== b.map((x) => x.toLowerCase()).join(',')) return ''
  const m = /^ou=(.*)$/i.exec(r[r.length - b.length - 1])
  return m ? m[1].replace(/\\(.)/g, '$1') : ''
}

// ───────── prihlasovacie meno: "meno.priezvisko", "URAD\meno.priezvisko" aj "meno.priezvisko@…"
export function normalizeLogin(login: unknown): string {
  if (typeof login !== 'string') return ''
  let s = login.trim().toLowerCase()
  if (s.includes('\\')) s = s.slice(s.lastIndexOf('\\') + 1)
  if (s.includes('@')) s = s.slice(0, s.indexOf('@'))
  return /^[a-z0-9._-]{1,64}$/.test(s) ? s : ''
}

const ATTRS = ['sAMAccountName', 'userPrincipalName', 'mail', 'displayName', 'givenName', 'sn', 'title', 'userAccountControl']

type Entry = { dn: string; [k: string]: unknown }

function toUser(e: Entry): LdapUser {
  const c = ldapConfig()
  const s = (k: string) => {
    const v = e[k]
    const x = Array.isArray(v) ? v[0] : v
    return x == null ? '' : Buffer.isBuffer(x) ? x.toString('utf8') : String(x)
  }
  const username = s('sAMAccountName').toLowerCase()
  const department = departmentFromDn(e.dn, c.baseDn)
  return {
    dn: e.dn,
    username,
    email: (s('mail') || s('userPrincipalName') || `${username}@${c.upnSuffix}`).toLowerCase(),
    name: s('displayName') || `${s('givenName')} ${s('sn')}`.trim() || username,
    title: s('title'),
    department,
    disabled: (Number(s('userAccountControl')) & 2) === 2,
    excluded: c.excludeOus.includes(department.toLowerCase()),
  }
}

// Servisný účet – skúša DC v poradí z LDAP_URL
async function serviceClient(): Promise<Client> {
  const c = ldapConfig()
  let lastErr: unknown = new Error('LDAP nie je nakonfigurované')
  for (const url of c.urls) {
    let client: Client | undefined
    try {
      client = newClient(url)
      await client.bind(c.bindDn, c.bindPassword)
      return client
    } catch (e) {
      lastErr = e
      console.error(`[ldap] servisný účet – ${url}: ${(e as Error)?.message || e}`)
      await client?.unbind().catch(() => undefined)
    }
  }
  throw lastErr
}

const isInvalidCredentials = (e: unknown) => {
  const err = e as { code?: number; name?: string }
  return err?.code === 49 || err?.name === 'InvalidCredentialsError'
}

type BindResult = 'ok' | 'invalid' | 'locked' | 'expired' | 'disabled' | 'unavailable'

// Overenie hesla bindom ako používateľ. Pri zlom hesle sa NEskúša ďalší DC (zbytočne by rástol lockout v AD).
async function userBind(dn: string, password: string): Promise<BindResult> {
  for (const url of ldapConfig().urls) {
    const client = newClient(url)
    try {
      await client.bind(dn, password)
      return 'ok'
    } catch (e) {
      if (isInvalidCredentials(e)) {
        const m = String((e as Error).message || '')
        if (/data 775/i.test(m)) return 'locked'
        if (/data (532|773)/i.test(m)) return 'expired'
        if (/data (533|701)/i.test(m)) return 'disabled'
        return 'invalid'
      }
      console.error(`[ldap] overenie používateľa – ${url}: ${(e as Error)?.message || e}`)
      // chyba spojenia – skús ďalší DC
    } finally {
      await client.unbind().catch(() => undefined)
    }
  }
  return 'unavailable'
}

async function isMember(client: Client, userDn: string, groupDn: string) {
  if (!groupDn) return false
  const { searchEntries } = await client.search(userDn, {
    scope: 'base',
    filter: `(memberOf:1.2.840.113556.1.4.1941:=${escapeFilter(groupDn)})`, // aj vnorené skupiny
    attributes: ['dn'],
  })
  return searchEntries.length > 0
}

async function memberDns(client: Client, groupDn: string) {
  if (!groupDn) return new Set<string>()
  const { searchEntries } = await client.search(ldapConfig().baseDn, {
    scope: 'sub',
    filter: `(&(objectCategory=person)(objectClass=user)(memberOf:1.2.840.113556.1.4.1941:=${escapeFilter(groupDn)}))`,
    attributes: ['dn'],
    paged: { pageSize: 500 },
  })
  return new Set(searchEntries.map((e: { dn: string }) => e.dn.toLowerCase()))
}

export type AuthResult =
  | { ok: true; user: LdapUser; role: Role }
  | { ok: false; reason: Exclude<BindResult, 'ok'> }

export async function ldapAuthenticate(login: unknown, password: unknown): Promise<AuthResult> {
  const username = normalizeLogin(login)
  // prázdne heslo by v LDAP prešlo ako anonymný bind – preto ho vždy odmietneme
  if (!username || typeof password !== 'string' || password.length === 0 || password.length > 256) {
    return { ok: false, reason: 'invalid' }
  }

  let svc: Client
  try {
    svc = await serviceClient()
  } catch {
    return { ok: false, reason: 'unavailable' }
  }

  try {
    const c = ldapConfig()
    const { searchEntries } = await svc.search(c.baseDn, {
      scope: 'sub',
      filter: `(&(objectCategory=person)(objectClass=user)(sAMAccountName=${escapeFilter(username)}))`,
      attributes: ATTRS,
      sizeLimit: 2,
    })
    if (searchEntries.length !== 1) return { ok: false, reason: 'invalid' }
    const user = toUser(searchEntries[0] as Entry)
    if (user.excluded || user.disabled) return { ok: false, reason: 'invalid' }

    const r = await userBind(user.dn, password)
    if (r !== 'ok') return { ok: false, reason: r }

    const role: Role = (await isMember(svc, user.dn, c.adminGroup))
      ? 'admin'
      : (await isMember(svc, user.dn, c.managerGroup))
        ? 'manager'
        : 'employee'
    return { ok: true, user, role }
  } catch (e) {
    console.error(`[ldap] vyhľadanie používateľa: ${(e as Error)?.message || e}`)
    return { ok: false, reason: 'unavailable' }
  } finally {
    await svc.unbind().catch(() => undefined)
  }
}

// Všetci používatelia pod base DN + ich rola (pre nočnú synchronizáciu)
export async function ldapListUsers(): Promise<(LdapUser & { role: Role })[]> {
  const c = ldapConfig()
  const svc = await serviceClient()
  try {
    const { searchEntries } = await svc.search(c.baseDn, {
      scope: 'sub',
      filter: '(&(objectCategory=person)(objectClass=user))',
      attributes: ATTRS,
      paged: { pageSize: 500 },
    })
    const admins = await memberDns(svc, c.adminGroup)
    const managers = await memberDns(svc, c.managerGroup)
    return searchEntries.map((e: Entry) => {
      const u = toUser(e)
      const dn = e.dn.toLowerCase()
      const role: Role = admins.has(dn) ? 'admin' : managers.has(dn) ? 'manager' : 'employee'
      return { ...u, role }
    })
  } finally {
    await svc.unbind().catch(() => undefined)
  }
}
