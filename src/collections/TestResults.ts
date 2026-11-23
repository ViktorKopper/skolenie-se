import type { CollectionConfig } from 'payload'

// Výsledky záverečného testu. Zapisuje ich len route /test/submit (local API),
// čítať môžu iba prihlásení administrátori.
const isAdmin = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const TestResults: CollectionConfig = {
  slug: 'test-results',
  labels: { singular: 'Výsledok testu', plural: 'Výsledky testov' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'percent', 'passed', 'completedAt'],
    description: 'Každý pokus o záverečný test. Export do CSV: /test/export (len po prihlásení do adminu).',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Meno' },
        { name: 'email', type: 'email', required: true, index: true, label: 'E-mail' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'score', type: 'number', required: true, label: 'Body' },
        { name: 'maxScore', type: 'number', required: true, label: 'Max. bodov' },
        { name: 'percent', type: 'number', required: true, label: 'Úspešnosť (%)' },
        { name: 'correctCount', type: 'number', label: 'Správne odpovede' },
        { name: 'total', type: 'number', label: 'Počet otázok' },
      ],
    },
    { name: 'passed', type: 'checkbox', label: 'Úspešný', defaultValue: false },
    { name: 'completedAt', type: 'date', required: true, label: 'Dokončené', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'answers',
      type: 'json',
      label: 'Odpovede (detail)',
      admin: { description: 'Pre každú otázku: id, obtiažnosť, vybrané a správne možnosti.' },
    },
  ],
}
