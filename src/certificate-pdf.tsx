import path from 'path'
import React from 'react'
import QRCode from 'qrcode'
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import { fmtSkDate } from './certificates'

// PDF osvedčenia (A4 na šírku). Len server.
// Písmo Source Sans 3 (OFL) a logo sú v /public, aby boli aj v Docker image.

export type CertificatePdfData = {
  number: string
  name: string
  department: string
  courseTitle: string
  topicCount: number
  questionCount: number
  percent: number
  issuedAt: string | Date
  validUntil: string | Date
  verifyUrl: string
  demo?: boolean // ukážka – vodoznak UKÁŽKA
}

const NAVY = '#1d4290'
const INK = '#0b0c0c'
const GRAY = '#505a5f'
const FONT = 'SourceSans3'

let fontsReady = false
function ensureFonts() {
  if (fontsReady) return
  const dir = path.join(process.cwd(), 'public', 'fonts')
  Font.register({
    family: FONT,
    fonts: [
      { src: path.join(dir, 'SourceSans3-Regular.ttf'), fontWeight: 400 },
      { src: path.join(dir, 'SourceSans3-Semibold.ttf'), fontWeight: 600 },
      { src: path.join(dir, 'SourceSans3-Bold.ttf'), fontWeight: 700 },
    ],
  })
  Font.registerHyphenationCallback((word: string) => [word]) // nedeliť slová
  fontsReady = true
}

const s = StyleSheet.create({
  page: { fontFamily: FONT, color: INK, padding: 22, backgroundColor: '#ffffff' },
  outer: { flex: 1, borderWidth: 3, borderColor: NAVY, padding: 5 },
  inner: { flex: 1, borderWidth: 1, borderColor: NAVY, paddingTop: 22, paddingBottom: 20, paddingHorizontal: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { height: 52, width: 163 },
  numLabel: { fontSize: 9, color: GRAY, textAlign: 'right' },
  num: { fontSize: 11, fontWeight: 600, textAlign: 'right', marginTop: 2 },
  center: { alignItems: 'center' },
  title: { fontSize: 40, fontWeight: 700, color: NAVY, letterSpacing: 6, marginTop: 30 },
  subtitle: { fontSize: 13, color: GRAY, marginTop: 2 },
  small: { fontSize: 11, color: GRAY },
  name: { fontSize: 32, fontWeight: 600, marginTop: 4 },
  rule: { width: 300, height: 1.5, backgroundColor: NAVY, marginTop: 6 },
  dept: { fontSize: 12, color: GRAY, marginTop: 6 },
  body: { fontSize: 13, marginTop: 26 },
  course: { fontSize: 18, fontWeight: 600, color: NAVY, marginTop: 3, textAlign: 'center' },
  meta: { fontSize: 11, color: GRAY, marginTop: 4 },
  footer: { marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  footLeft: { width: 200, fontSize: 10, lineHeight: 1.55 },
  footLabel: { color: GRAY },
  sign: { width: 210, alignItems: 'center' },
  signLine: { width: 210, borderTopWidth: 1, borderTopColor: INK, marginBottom: 3 },
  signName: { fontSize: 10 },
  signLabel: { fontSize: 9, color: GRAY },
  verify: { width: 200, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  verifyText: { fontSize: 8.5, color: GRAY, textAlign: 'right', marginRight: 8, lineHeight: 1.35 },
  qr: { width: 64, height: 64 },
  watermark: {
    position: 'absolute',
    top: 215,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 130,
    fontWeight: 700,
    letterSpacing: 10,
    color: NAVY,
    opacity: 0.07,
    transform: 'rotate(-18deg)',
  },
})

export async function renderCertificatePdf(d: CertificatePdfData): Promise<Buffer> {
  ensureFonts()
  const logo = path.join(process.cwd(), 'public', 'urad.png')
  const qr = await QRCode.toDataURL(d.verifyUrl, { errorCorrectionLevel: 'M', margin: 0, scale: 8 })
  const host = d.verifyUrl.replace(/^https?:\/\//, '').split('?')[0].split('/').slice(0, 2).join('/')

  const doc = (
    <Document title={`Osvedčenie ${d.number}`} author="Úrad podpredsedu vlády SR pre Plán obnovy a znalostnú ekonomiku" subject={d.courseTitle} language="sk">
      <Page size="A4" orientation="landscape" style={s.page}>
        {d.demo ? (
          <Text style={s.watermark} fixed>
            UKÁŽKA
          </Text>
        ) : null}
        <View style={s.outer}>
          <View style={s.inner}>
            <View style={s.header}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={logo} style={s.logo} />
              <View>
                <Text style={s.numLabel}>Číslo osvedčenia</Text>
                <Text style={s.num}>{d.number}</Text>
              </View>
            </View>

            <View style={s.center}>
              <Text style={s.title}>OSVEDČENIE</Text>
              <Text style={s.subtitle}>o absolvovaní vzdelávania</Text>

              <Text style={[s.small, { marginTop: 24 }]}>udelené</Text>
              <Text style={s.name}>{d.name}</Text>
              <View style={s.rule} />
              {d.department ? <Text style={s.dept}>{d.department}</Text> : null}

              <Text style={s.body}>za úspešné absolvovanie školenia</Text>
              <Text style={s.course}>{d.courseTitle}</Text>
              <Text style={s.meta}>
                {d.topicCount} tém · záverečný test {d.questionCount} otázok · výsledok {d.percent} %
              </Text>
            </View>

            <View style={s.footer}>
              <View style={s.footLeft}>
                <Text>
                  <Text style={s.footLabel}>Dátum vydania: </Text>
                  {fmtSkDate(d.issuedAt)}
                </Text>
                <Text>
                  <Text style={s.footLabel}>Platné do: </Text>
                  {fmtSkDate(d.validUntil)}
                </Text>
                <Text style={s.footLabel}>Vydal: Oddelenie IT</Text>
              </View>

              <View style={s.sign}>
                <View style={s.signLine} />
                <Text style={s.signName}>{d.name}</Text>
                <Text style={s.signLabel}>podpis absolventa</Text>
              </View>

              <View style={s.verify}>
                <Text style={s.verifyText}>
                  Overenie pravosti{'\n'}
                  {host}
                </Text>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={qr} style={s.qr} />
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
  return renderToBuffer(doc)
}
