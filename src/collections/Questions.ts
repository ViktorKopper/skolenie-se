import type { CollectionConfig } from 'payload'

// Pozn.: polia nie sú "required" na úrovni DB (existujúce riadky by zablokovali migráciu),
// povinnosť sa kontroluje cez validate.
export const Questions: CollectionConfig = {
  slug: 'questions',
  labels: { singular: 'Otázka', plural: 'Otázky kvízu' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'topic', 'difficulty', 'multiple', 'order'],
    description: 'Banka otázok: 6 na tému (2 ľahké, 2 stredné, 2 ťažké). Používa ju mini-kvíz pri téme aj záverečný test.',
    listSearchableFields: ['question'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'question', type: 'textarea', required: true, label: 'Otázka' },
    {
      type: 'row',
      fields: [
        {
          name: 'topic',
          type: 'relationship',
          relationTo: 'topics',
          label: 'Téma',
          validate: (v: unknown) => (v ? true : 'Vyberte tému.'),
        },
        {
          name: 'difficulty',
          type: 'select',
          label: 'Obtiažnosť',
          defaultValue: 'easy',
          options: [
            { label: 'Ľahká (1 bod)', value: 'easy' },
            { label: 'Stredná (2 body)', value: 'medium' },
            { label: 'Ťažká (3 body)', value: 'hard' },
          ],
          validate: (v: unknown) => (v ? true : 'Vyberte obtiažnosť.'),
        },
        { name: 'order', type: 'number', label: 'Poradie v téme', defaultValue: 0 },
      ],
    },
    {
      name: 'multiple',
      type: 'checkbox',
      label: 'Viac správnych odpovedí',
      defaultValue: false,
      admin: { description: 'Zaškrtnite, ak je správnych odpovedí viac – používateľ vyberá všetky.' },
    },
    {
      name: 'options',
      type: 'array',
      label: 'Možnosti',
      minRows: 2,
      maxRows: 6,
      labels: { singular: 'Možnosť', plural: 'Možnosti' },
      fields: [
        { name: 'text', type: 'text', required: true, label: 'Text' },
        { name: 'correct', type: 'checkbox', label: 'Správna odpoveď', defaultValue: false },
      ],
    },
    { name: 'explanation', type: 'textarea', label: 'Vysvetlenie' },
  ],
}
