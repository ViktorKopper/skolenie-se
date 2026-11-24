// Role a prístupové pravidlá

type U = { role?: string | null; source?: string | null } | null | undefined

// Administrátor: rola admin (zo skupiny DL_Skolenie_Admins) alebo lokálny účet z /admin (núdzový admin)
export const isAdminUser = (u: unknown) => {
  const x = u as U
  return Boolean(x) && (x!.role === 'admin' || !x!.source || x!.source === 'local')
}

export const isManagerUser = (u: unknown) => Boolean(u) && (u as U)!.role === 'manager'

export const adminOnly = ({ req }: { req: { user?: unknown } }) => isAdminUser(req.user)
