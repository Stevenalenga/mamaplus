import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

// Routes that require authentication
const protectedRoutes = ['/dashboard']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session using NextAuth
  const session = await auth()
  const user = session?.user

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login?error=auth_required', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && user) {
    const dashboardUrl = new URL(
      (user as any).role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user',
      request.url
    )
    return NextResponse.redirect(dashboardUrl)
  }

  // Role-based access control for admin routes
  if (pathname.startsWith('/dashboard/admin') && user && (user as any).role !== 'ADMIN') {
    const userDashboardUrl = new URL('/dashboard/user', request.url)
    return NextResponse.redirect(userDashboardUrl)
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
