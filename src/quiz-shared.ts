// Spoločné pravidlá kvízu (klient aj server)

export type Difficulty = 'easy' | 'medium' | 'hard'

export const POINTS: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }
export const DIFF_LABEL: Record<Difficulty, string> = { easy: 'Ľahká', medium: 'Stredná', hard: 'Ťažká' }

export const TEST_PASS_PCT = 75

// Mini-kvíz: na prejdenie témy treba 2/3 správnych (pri 6 otázkach = 4)
export const miniRequired = (total: number) => Math.ceil((total * 2) / 3)

// Záverečný test: z každej témy 2 otázky rôznej obtiažnosti.
// Pri 10 témach: 3× ľahká+stredná, 3× stredná+ťažká, 4× ľahká+ťažká = 7 ľahkých, 6 stredných, 7 ťažkých.
const PAIR_PATTERN: [Difficulty, Difficulty][] = [
  ['easy', 'medium'],
  ['medium', 'hard'],
  ['easy', 'hard'],
  ['easy', 'hard'],
  ['medium', 'hard'],
  ['easy', 'medium'],
  ['easy', 'hard'],
  ['medium', 'hard'],
  ['easy', 'medium'],
  ['easy', 'hard'],
]

export function testPairs(topicCount: number): [Difficulty, Difficulty][] {
  return Array.from({ length: topicCount }, (_, i) => PAIR_PATTERN[i % PAIR_PATTERN.length])
}

export function expectedMix(topicCount: number): Record<Difficulty, number> {
  const mix: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 }
  for (const [a, b] of testPairs(topicCount)) {
    mix[a]++
    mix[b]++
  }
  return mix
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Odpoveď je správna len pri presne zhodnej množine vybraných možností
export function sameSet(a: number[], b: number[]): boolean {
  const x = [...new Set(a)].sort((m, n) => m - n)
  const y = [...new Set(b)].sort((m, n) => m - n)
  return x.length === y.length && x.every((v, i) => v === y[i])
}

export function correctIndexes(options: { correct?: boolean | null }[] | null | undefined): number[] {
  return (options || []).flatMap((o, i) => (o.correct ? [i] : []))
}

// Bezpečné načítanie zoznamu indexov z požiadavky
export function parseSelected(v: unknown, optionCount: number): number[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > optionCount) return null
  const out: number[] = []
  for (const x of v) {
    if (typeof x !== 'number' || !Number.isInteger(x) || x < 0 || x >= optionCount) return null
    out.push(x)
  }
  return [...new Set(out)]
}
