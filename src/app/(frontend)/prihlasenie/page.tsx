import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import config from '@/payload.config'
import { safeNext } from '@/session'
import LoginForm from '../LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  const target = safeNext(next, '/')
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await headers() })
  if (user) redirect(target)

  return (
    <main className="login-page" id="main-content">
      <div className="login-page__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/urad.png" alt="Úrad podpredsedu vlády SR pre Plán obnovy a znalostnú ekonomiku" />
      </div>
      <LoginForm next={target} />
      <p className="login-page__app">Školenie o kyberbezpečnosti</p>
    </main>
  )
}
