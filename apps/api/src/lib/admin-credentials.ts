export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mamaplus.co.ke'
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!'

export function validateAdminCredentials(email: string, password: string) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}
