'use client'

import React from 'react'
import { useProgress } from './progress-store'

export default function DoneBadge({ slug, light = false }: { slug: string; light?: boolean }) {
  const { done } = useProgress()
  if (!done.includes(slug)) return null
  return <span className={`app-done${light ? ' app-done--light' : ''}`}>✓ Prejdené</span>
}
