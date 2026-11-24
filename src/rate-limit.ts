// Jednoduchý limit neúspešných prihlásení (v pamäti – appka beží v jednej inštancii).
// Limit na meno musí byť NIŽŠÍ ako lockout threshold v AD, aby sme nikomu nezamkli doménový účet.

const WINDOW_MS = 15 * 60 * 1000
const MAX_PER_USER = Math.max(1, Number(process.env.LOGIN_MAX_ATTEMPTS) || 3)
const MAX_PER_IP = 20

type Bucket = { count: number; first: number }
const users = new Map<string, Bucket>()
const ips = new Map<string, Bucket>()

function current(map: Map<string, Bucket>, key: string): Bucket | null {
  const b = map.get(key)
  if (!b) return null
  if (Date.now() - b.first > WINDOW_MS) {
    map.delete(key)
    return null
  }
  return b
}

function bump(map: Map<string, Bucket>, key: string) {
  const b = current(map, key)
  if (b) b.count++
  else map.set(key, { count: 1, first: Date.now() })
}

export function isLimited(username: string, ip: string) {
  return (current(users, username)?.count ?? 0) >= MAX_PER_USER || (current(ips, ip)?.count ?? 0) >= MAX_PER_IP
}

export function registerFailure(username: string, ip: string) {
  if (username) bump(users, username)
  bump(ips, ip)
}

export function clearFailures(username: string) {
  users.delete(username)
}

export function clientIp(headers: Headers) {
  return (headers.get('x-forwarded-for') || '').split(',')[0].trim() || headers.get('x-real-ip') || 'local'
}
