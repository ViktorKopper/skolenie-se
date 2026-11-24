import { NextResponse, type NextRequest } from 'next/server'
import { readSessionToken, SESSION_COOKIE } from '@/session'

// Celý web je len pre prihlásených. Neprihláseného presmeruje na /prihlasenie.
// Výnimky: prihlásenie, auth a API trasy (overujú si prístup samy), health a potvrdenia (podpísaný odkaz).
const OPEN = [
  /^\/prihlasenie(\/|$)/,
  /^\/auth\//,
  /^\/health$/,
  /^\/potvrdenie\//,
  /^\/seed$/,
  /^\/(progress|test)(\/|$)/,
  /^\/sprava\/export$/,
]

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const headers = new Headers(req.headers)
  headers.set('x-pathname', pathname)
  const pass = () => NextResponse.next({ request: { headers } })

  if (OPEN.some((r) => r.test(pathname))) return pass()

  const session = readSessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  const localAdmin = req.cookies.has('payload-token') // núdzový lokálny admin z /admin
  if (session || localAdmin) return pass()

  const url = req.nextUrl.clone()
  url.pathname = '/prihlasenie'
  url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname + search)}`
  return NextResponse.redirect(url)
}

export const config = {
  // mimo Next interných súborov, Payload admin/API a statických súborov (obrázky, svg…)
  matcher: ['/((?!_next/|api/|admin|my-route|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)'],
}
