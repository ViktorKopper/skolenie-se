import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

// Osvedčenia o absolvovaní. Vznikajú automaticky po úspešnom záverečnom teste (src/certificates.ts).
// V admine sa dajú len zrušiť (napr. pri chybe) – číslo, osoba a dátumy sa nemenia.
export const Certificates: CollectionConfig = {
  slug: 'certificates',
  labels: { singular: 'Osvedčenie', plural: 'Osvedčenia' },
  admin: {
    useAsTitle: 'number',
    defaultColumns: ['number', 'name', 'departmentName', 'percent', 'issuedAt', 'validUntil', 'revoked'],
    description: 'Vydávajú sa automaticky po úspešnom záverečnom teste, platnosť 12 mesiacov. PDF: /osvedcenie/<číslo>.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'number', type: 'text', required: true, unique: true, index: true, label: 'Číslo', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Meno', admin: { readOnly: true } },
        { name: 'email', type: 'text', label: 'E-mail', admin: { readOnly: true } },
      ],
    },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true, label: 'Používateľ', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'departmentName', type: 'text', label: 'Odbor', admin: { readOnly: true } },
        { name: 'departmentOu', type: 'text', label: 'OU', admin: { readOnly: true } },
      ],
    },
    { name: 'testResult', type: 'relationship', relationTo: 'test-results', index: true, label: 'Výsledok testu', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'percent', type: 'number', label: 'Výsledok (%)', admin: { readOnly: true } },
        { name: 'topicCount', type: 'number', label: 'Počet tém', admin: { readOnly: true } },
        { name: 'questionCount', type: 'number', label: 'Otázok v teste', admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'issuedAt', type: 'date', required: true, label: 'Vydané', admin: { readOnly: true, date: { pickerAppearance: 'dayOnly', displayFormat: 'd. M. yyyy' } } },
        { name: 'validUntil', type: 'date', required: true, index: true, label: 'Platné do', admin: { readOnly: true, date: { pickerAppearance: 'dayOnly', displayFormat: 'd. M. yyyy' } } },
      ],
    },
    { name: 'issuedDay', type: 'text', index: true, admin: { hidden: true } },
    { name: 'revoked', type: 'checkbox', defaultValue: false, label: 'Zrušené', admin: { description: 'Zrušené osvedčenie sa pri overení zobrazí ako neplatné. Človek môže získať nové úspešným testom.' } },
    { name: 'revokedReason', type: 'textarea', label: 'Dôvod zrušenia', admin: { condition: (data) => Boolean(data?.revoked) } },
  ],
}
