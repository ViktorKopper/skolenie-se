'use client'

import React from 'react'

export default function PrintButton() {
  return (
    <button type="button" className="govuk-button govuk-button--start" style={{ marginBottom: 0 }} onClick={() => window.print()}>
      Tlačiť / uložiť ako PDF
    </button>
  )
}
