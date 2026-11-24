import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'
import { loadBank, type BankQ } from '@/quiz-bank'
import { shuffle, testPairs } from '@/quiz-shared'

export const dynamic = 'force-dynamic'

// GET /test/start – náhodný záverečný test: 2 otázky z každej témy, rôznej obtiažnosti.
// Správne odpovede sa NEposielajú; vyhodnotenie robí /test/submit.
export async function GET(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Najprv sa prihláste.' }, { status: 401 })
  const bank = await loadBank(payload)

  if (bank.topics.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Test zatiaľ nie je pripravený – v databáze chýbajú otázky.' },
      { status: 503 },
    )
  }

  const pairs = shuffle(testPairs(bank.topics.length))
  const picked: BankQ[] = []
  shuffle(bank.topics).forEach((t, k) => {
    for (const d of pairs[k]) {
      const pool = t.byDiff[d]
      picked.push(pool[Math.floor(Math.random() * pool.length)])
    }
  })

  return NextResponse.json(
    {
      ok: true,
      questions: shuffle(picked).map((q) => ({
        id: q.id,
        topic: q.topicTitle,
        difficulty: q.difficulty,
        multiple: q.multiple,
        question: q.question,
        options: q.options.map((o, i) => ({ i, text: o.text })),
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
