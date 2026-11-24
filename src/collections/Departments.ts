import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

// Odbory = OU tesne pod "Domain users". Zakladajú sa automaticky pri synchronizácii,
// tu sa im dá nastaviť pekný názov s diakritikou (OU v AD ju často nemá).
export const Departments: CollectionConfig = {
  slug: 'departments',
  labels: { singular: 'Odbor', plural: 'Odbory' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'ou'],
    description: 'Vytvárajú sa automaticky podľa OU v AD. Upravte len zobrazovaný názov.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Zobrazovaný názov' },
    { name: 'ou', type: 'text', required: true, unique: true, label: 'OU v AD', admin: { readOnly: true } },
  ],
}
