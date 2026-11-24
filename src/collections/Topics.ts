import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

export const Topics: CollectionConfig = {
  slug: 'topics',
  labels: { singular: 'Téma', plural: 'Témy' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order', 'readingMinutes', 'published'],
    description: 'Vzdelávacie témy o social engineeringu.',
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Názov' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: { description: 'Krátky identifikátor v URL, napr. "phishing".' },
    },
    {
      type: 'row',
      fields: [
        { name: 'order', type: 'number', label: 'Poradie', defaultValue: 0 },
        { name: 'readingMinutes', type: 'number', label: 'Čas čítania (min)', defaultValue: 3 },
        { name: 'published', type: 'checkbox', label: 'Publikované', defaultValue: true },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Krátky popis',
      admin: { description: 'Zobrazí sa na dlaždici a pod nadpisom témy.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Obsah',
          fields: [{ name: 'content', type: 'richText', label: 'Výklad' }],
        },
        {
          label: 'Príklad',
          description:
            'Anotovaná ukážka. Ak obrázok nenahráš, použije sa vygenerovaný /examples/<slug>.svg. Čísla vo vlajkách musia sedieť s číslami na obrázku.',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Obrázok príkladu' },
            { name: 'exampleCaption', type: 'text', label: 'Popis pod obrázkom' },
            {
              name: 'flagsHeading',
              type: 'text',
              label: 'Nadpis legendy',
              defaultValue: 'Varovné znaky',
            },
            {
              name: 'redFlags',
              type: 'array',
              label: 'Varovné znaky (legenda k obrázku)',
              labels: { singular: 'Znak', plural: 'Znaky' },
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Krátky názov' },
                { name: 'text', type: 'textarea', label: 'Vysvetlenie' },
              ],
            },
          ],
        },
        {
          label: 'Odporúčania',
          fields: [
            {
              name: 'dos',
              type: 'array',
              label: 'Čo robiť',
              labels: { singular: 'Bod', plural: 'Body' },
              fields: [{ name: 'text', type: 'text', required: true, label: 'Text' }],
            },
            {
              name: 'donts',
              type: 'array',
              label: 'Čo nerobiť',
              labels: { singular: 'Bod', plural: 'Body' },
              fields: [{ name: 'text', type: 'text', required: true, label: 'Text' }],
            },
            {
              name: 'cheatsheet',
              type: 'array',
              label: 'Zapamätajte si (ťahák)',
              labels: { singular: 'Bod', plural: 'Body' },
              fields: [{ name: 'text', type: 'text', required: true, label: 'Text' }],
            },
          ],
        },
        {
          label: 'Súvisiace',
          fields: [
            {
              name: 'related',
              type: 'relationship',
              relationTo: 'topics',
              hasMany: true,
              label: 'Súvisiace témy',
            },
          ],
        },
      ],
    },
  ],
}
