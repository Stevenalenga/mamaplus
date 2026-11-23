import { redirect } from 'next/navigation'

/** Legacy cookie-based /admin portal → platform admin blog (same logins). */
export default function LegacyAdminRedirect() {
  redirect('/dashboard/admin/blog')
}
