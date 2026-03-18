import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

// Role → dashboard path mapping
const ROLE_DASHBOARD: Record<string, string> = {
  USER: '/dashboard/user',
  INSTRUCTOR: '/dashboard/educator',
  ADMIN_ASSISTANT: '/dashboard/admin-assistant',
  ADMIN: '/dashboard/admin',
}

// Dashboard prefix → allowed roles
const DASHBOARD_ACCESS: Record<string, string[]> = {
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/admin-assistant': ['ADMIN_ASSISTANT', 'ADMIN'],
  '/dashboard/educator': ['INSTRUCTOR', 'ADMIN'],
  '/dashboard/user': ['USER'],
}

// Routes that require authentication
const protectedRoutes = ['/dashboard']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup']

function getDashboard(role: string): string {
  return ROLE_DASHBOARD[role] || ROLE_DASHBOARD.USER
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session using NextAuth
  const session = await auth()
  const user = session?.user
  const role = (user as any)?.role || 'USER'

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
    return NextResponse.redirect(new URL(getDashboard(role), request.url))
  }

  // Role-based access control for dashboard routes
  if (user && pathname.startsWith('/dashboard')) {
    // Check each dashboard prefix from most specific to least
    const prefixes = Object.keys(DASHBOARD_ACCESS).sort((a, b) => b.length - a.length)
    for (const prefix of prefixes) {
      if (pathname.startsWith(prefix)) {
        const allowedRoles = DASHBOARD_ACCESS[prefix]
        if (!allowedRoles.includes(role)) {
          return NextResponse.redirect(new URL(getDashboard(role), request.url))
        }
        break
      }
    }
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
