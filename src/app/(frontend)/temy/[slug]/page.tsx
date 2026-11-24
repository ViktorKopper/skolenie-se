import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import React from 'react'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@/payload.config'
import TopicQuiz, { type MiniQuestion } from '../../TopicQuiz'
import DoneBadge from '../../DoneBadge'

export const dynamic = 'force-dynamic'

type Item = { text?: string | null; id?: string | null }
type Flag = { title?: string | null; text?: string | null; id?: string | null }
type Rel = { id: string | number; slug: string; title: string; summary?: string | null }

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await headers() })

  const [{ docs }, all] = await Promise.all([
    payload.find({
      collection: 'topics',
      where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
      limit: 1,
      depth: 1,
    }),
    payload.find({
      collection: 'topics',
      where: { published: { equals: true } },
      sort: 'order',
      limit: 100,
      depth: 0,
    }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topic = docs[0] as any
  if (!topic) notFound()

  const qRes = await payload.find({
    collection: 'questions',
    where: { topic: { equals: topic.id } },
    sort: 'order',
    pagination: false,
    depth: 0,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const miniQuestions: MiniQuestion[] = qRes.docs.map((q: any) => ({
    id: String(q.id),
    difficulty: q.difficulty || 'easy',
    multiple: Boolean(q.multiple),
    question: q.question,
    options: (q.options || []).map((o: { text: string; correct?: boolean | null }) => ({
      text: o.text,
      correct: Boolean(o.correct),
    })),
    explanation: q.explanation || '',
  }))

  const list = all.docs
  const idx = list.findIndex((t) => t.slug === slug)
  const prev = idx > 0 ? list[idx - 1] : null
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null

  const media = topic.image && typeof topic.image === 'object' ? topic.image : null
  const imgSrc: string = media?.url || `/examples/${slug}.svg`
  const imgAlt: string = media?.alt || topic.exampleCaption || `Ukážka – ${topic.title}`

  const flags: Flag[] = topic.redFlags || []
  const dos: Item[] = topic.dos || []
  const donts: Item[] = topic.donts || []
  const cheat: Item[] = topic.cheatsheet || []
  const related: Rel[] = (topic.related || []).filter((r: unknown) => r && typeof r === 'object')

  return (
    <>
      <section className="app-hero">
        <div className="govuk-width-container">
          <p className="app-hero__meta">
            Téma {idx + 1} z {list.length}
            {topic.readingMinutes ? ` · ${topic.readingMinutes} min čítania` : ''}
            <DoneBadge slug={slug} light />
          </p>
          <h1 className="govuk-heading-xl">{topic.title}</h1>
          {topic.summary && <p className="govuk-body-l">{topic.summary}</p>}
        </div>
      </section>

      <div className="govuk-width-container govuk-main-wrapper">
        <Link className="govuk-back-link" href="/temy">
          Späť na témy
        </Link>

        <div className="app-lesson">
          <article className="app-prose">
            {topic.content ? (
              <RichText data={topic.content} />
            ) : (
              <p>Obsah tejto témy zatiaľ nebol pridaný.</p>
            )}
          </article>

          <section className="app-example" aria-labelledby="priklad">
            <div className="app-example__head" id="priklad">
              Príklad – ako to vyzerá v praxi
            </div>
            <figure className="app-example__figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc} alt={imgAlt} loading="lazy" />
              {topic.exampleCaption && <figcaption>{topic.exampleCaption}</figcaption>}
            </figure>

            {flags.length > 0 && (
              <>
                <h2 className="app-example__title">{topic.flagsHeading || 'Varovné znaky'}</h2>
                <ol className="app-flags">
                  {flags.map((f, i) => (
                    <li key={f.id || i}>
                      <span className="app-flags__num" aria-hidden="true">{i + 1}</span>
                      <div>
                        <strong>{f.title}</strong>
                        {f.text && <p>{f.text}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          {(dos.length > 0 || donts.length > 0) && (
            <section className="app-dd">
              {dos.length > 0 && (
                <div className="app-dd__col app-dd__col--do">
                  <h2>
                    <span aria-hidden="true">✓</span> Čo robiť
                  </h2>
                  <ul>
                    {dos.map((d, i) => (
                      <li key={d.id || i}>{d.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {donts.length > 0 && (
                <div className="app-dd__col app-dd__col--dont">
                  <h2>
                    <span aria-hidden="true">✕</span> Čo nerobiť
                  </h2>
                  <ul>
                    {donts.map((d, i) => (
                      <li key={d.id || i}>{d.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {cheat.length > 0 && (
            <section className="app-cheat">
              <h2>Zapamätajte si</h2>
              <ul>
                {cheat.map((c, i) => (
                  <li key={c.id || i}>{c.text}</li>
                ))}
              </ul>
            </section>
          )}

          <TopicQuiz
            slug={slug}
            questions={miniQuestions}
            next={next ? { slug: next.slug, title: next.title } : null}
            loggedIn={Boolean(user)}
          />

          {related.length > 0 && (
            <section className="app-related">
              <h2 className="govuk-heading-m">Súvisiace témy</h2>
              <div className="app-topics">
                {related.map((r) => (
                  <Link key={r.id} href={`/temy/${r.slug}`} className="app-topic">
                    <span className="app-topic__title">{r.title}</span>
                    {r.summary && <p className="app-topic__desc">{r.summary}</p>}
                    <DoneBadge slug={r.slug} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <nav className="app-pager" aria-label="Navigácia medzi témami">
            {prev ? (
              <Link href={`/temy/${prev.slug}`} className="app-pager__link">
                <span className="app-pager__dir">← Predošlá téma</span>
                <span className="app-pager__title">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/temy/${next.slug}`} className="app-pager__link app-pager__link--next">
                <span className="app-pager__dir">Ďalšia téma →</span>
                <span className="app-pager__title">{next.title}</span>
              </Link>
            ) : (
              <Link href="/kviz" className="app-pager__link app-pager__link--next">
                <span className="app-pager__dir">Hotovo →</span>
                <span className="app-pager__title">Otestujte sa v kvíze</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
