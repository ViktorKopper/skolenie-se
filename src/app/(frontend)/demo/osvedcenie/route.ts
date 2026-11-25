import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminUser } from '@/access'
import { appBaseUrl, COURSE_TITLE, demoCertificate, demoVerifyUrl } from '@/certificates'
import { renderCertificatePdf } from '@/certificate-pdf'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

// GET /demo/osvedcenie?meno=&odbor=&vysledok=&stav=platne|vyprsane – ukážkové PDF s vodoznakom, len admin.
// Nič sa neukladá a číslo končí na -DEMO.
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdminUser(user)) {
    return new Response('Demo je dostupné len pre administrátorov.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
  const u = user as AnyDoc
  const q = new URL(req.url).searchParams

  let department = q.get('odbor') ?? ''
  if (!q.has('odbor') && u.department) {
    const d = await payload.find({ collection: 'departments', where: { ou: { equals: u.department } }, limit: 1, depth: 0 })
    department = (d.docs[0] as AnyDoc | undefined)?.name || u.department
  }

  const demo = demoCertificate({
    name: q.get('meno') || u.name || u.email || 'Ukážkový zamestnanec',
    department,
    percent: Number(q.get('vysledok')) || 88,
    expired: q.get('stav') === 'vyprsane',
  })

  const pdf = await renderCertificatePdf({
    ...demo,
    courseTitle: COURSE_TITLE,
    topicCount: await payload.count({ collection: 'topics', where: { published: { equals: true } } }).then((r) => r.totalDocs || 10),
    questionCount: 20,
    verifyUrl: demoVerifyUrl(appBaseUrl(req.headers), demo),
    demo: true,
  })

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="osvedcenie-${demo.number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
