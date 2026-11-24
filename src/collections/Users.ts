import type { CollectionConfig } from 'payload'
import { adminOnly, isAdminUser } from '../access'
import { SESSION_COOKIE, getCookie, readSessionToken } from '../session'

// Používatelia: zamestnanci z AD (prihlásenie cez /prihlasenie) + lokálny núdzový admin (/admin).
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Používateľ', plural: 'Používatelia' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'department', 'active', 'lastLogin'],
    description: 'Účty z AD sa zakladajú pri prvom prihlásení a pri nočnej synchronizácii. Rola sa berie zo skupín DL_Skolenie_Admins / DL_Skolenie_Veduci.',
  },
  access: {
    admin: ({ req }) => isAdminUser(req.user), // do /admin len administrátori
    read: ({ req }) => (isAdminUser(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    unlock: adminOnly,
  },
  auth: {
    tokenExpiration: 8 * 60 * 60,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
    strategies: [
      {
        // session vydaná po prihlásení cez AD (route /auth/login)
        name: 'ldap-session',
        authenticate: async ({ headers, payload }) => {
          const s = readSessionToken(getCookie(headers, SESSION_COOKIE))
          if (!s) return { user: null }
          const id = /^\d+$/.test(s.uid) ? Number(s.uid) : s.uid
          const user = await payload
            .findByID({ collection: 'users', id, depth: 0, overrideAccess: true })
            .catch(() => null)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const u = user as any
          if (!u || u.active === false || (u.sessionVersion ?? 0) !== s.sv) return { user: null }
          return { user: { ...u, collection: 'users', _strategy: 'ldap-session' } }
        },
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Meno' },
    {
      type: 'row',
      fields: [
        { name: 'username', type: 'text', label: 'Login v AD', unique: true, index: true, admin: { readOnly: true } },
        {
          name: 'source',
          type: 'select',
          label: 'Typ účtu',
          defaultValue: 'local',
          options: [
            { label: 'Lokálny (núdzový)', value: 'local' },
            { label: 'Active Directory', value: 'ldap' },
          ],
          admin: { readOnly: true },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'role',
          type: 'select',
          label: 'Rola',
          defaultValue: 'admin',
          options: [
            { label: 'Zamestnanec', value: 'employee' },
            { label: 'Vedúci', value: 'manager' },
            { label: 'Administrátor', value: 'admin' },
          ],
          admin: { description: 'Pri účtoch z AD sa prepíše pri ďalšom prihlásení / synchronizácii podľa skupín.' },
        },
        { name: 'department', type: 'text', label: 'Odbor (OU v AD)', index: true, admin: { readOnly: true } },
        { name: 'title', type: 'text', label: 'Funkcia', admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'active', type: 'checkbox', label: 'Aktívny', defaultValue: true },
        { name: 'lastLogin', type: 'date', label: 'Posledné prihlásenie', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'lastSync', type: 'date', label: 'Posledná synchronizácia', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    { name: 'sessionVersion', type: 'number', defaultValue: 0, admin: { hidden: true } },
  ],
}
