import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminUser, isManagerUser } from '@/access'
import { appBaseUrl, certVerifyUrl, COURSE_TITLE } from '@/certificates'
import { renderCertificatePdf } from '@/certificate-pdf'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const idOf = (v: unknown) => (v && typeof v === 'object' ? String((v as AnyDoc).id) : String(v ?? ''))
const text = (msg: string, status: number) =>
  new Response(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

// GET /osvedcenie/<číslo> – PDF osvedčenia. Vlastník, administrátor alebo vedúci jeho odboru.
export async function GET(req: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return text('Najprv sa prihláste.', 401)
  const u = user as AnyDoc

  const res = await payload.find({
    collection: 'certificates',
    where: { number: { equals: decodeURIComponent(number) } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const c = res.docs[0] as AnyDoc | undefined
  if (!c) return text('Osvedčenie neexistuje.', 404)

  const admin = isAdminUser(u)
  const owner = idOf(c.user) === String(u.id)
  const manager = isManagerUser(u) && Boolean(u.department) && u.department === c.departmentOu
  if (!owner && !admin && !manager) return text('K tomuto osvedčeniu nemáte prístup.', 403)
  if (c.revoked && !admin) return text('Toto osvedčenie bolo zrušené.', 410)

  const pdf = await renderCertificatePdf({
    number: c.number,
    name: c.name,
    department: c.departmentName || '',
    courseTitle: COURSE_TITLE,
    topicCount: c.topicCount || 0,
    questionCount: c.questionCount || 0,
    percent: c.percent || 0,
    issuedAt: c.issuedAt,
    validUntil: c.validUntil,
    verifyUrl: certVerifyUrl(appBaseUrl(req.headers), c.number),
  })

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="osvedcenie-${c.number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
