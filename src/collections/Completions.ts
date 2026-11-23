import type { CollectionConfig } from 'payload'

// Evidencia absolvovania tém. Zápis ide len cez route /progress (local API),
// čítať/upravovať môžu iba prihlásení administrátori.
const isAdmin = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const Completions: CollectionConfig = {
  slug: 'completions',
  labels: { singular: 'Absolvovanie', plural: 'Absolvovania' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'topic', 'completedAt'],
    description: 'Kto a kedy označil tému ako prejdenú. Export do CSV: /progress/export (len po prihlásení do adminu).',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Meno' },
    { name: 'email', type: 'email', required: true, index: true, label: 'E-mail' },
    { name: 'topic', type: 'relationship', relationTo: 'topics', required: true, label: 'Téma' },
    { name: 'completedAt', type: 'date', required: true, label: 'Absolvované', admin: { date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
