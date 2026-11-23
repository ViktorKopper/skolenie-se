import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

// GET /health – pre Docker healthcheck a Zabbix (overí aj spojenie s databázou)
export async function GET() {
  try {
    const payload = await getPayload({ config: await config })
    const { totalDocs } = await payload.count({ collection: 'topics' })
    return NextResponse.json({ ok: true, topics: totalDocs }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
