'use client'

import { useEffect } from 'react'

export default function IdskInit() {
  useEffect(() => {
    import('@id-sk/frontend')
      .then((m: { initAll?: () => void }) => m.initAll?.())
      .catch(() => {})
  }, [])
  return null
}
