import type { CollectionConfig } from 'payload'

// Administrátori (Payload admin). Prihlásenie zamestnancov cez AD pribudne vo fáze 1.
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Administrátor', plural: 'Administrátori' },
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 8 * 60 * 60, // 8 hodín
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minút po 5 zlých pokusoch
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  fields: [
    // Email added by default
  ],
}
