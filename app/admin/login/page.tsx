import { redirect } from 'next/navigation'

/** Legacy blog admin login → platform login. */
export default function LegacyAdminLoginRedirect() {
  redirect('/login?callbackUrl=/dashboard/admin/blog')
}
