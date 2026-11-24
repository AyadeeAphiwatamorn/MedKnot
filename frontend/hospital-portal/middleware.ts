import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * MedKnot Hospital Portal Authentication Middleware
 *
 * Enforces session-based route protection:
 * 1. Root route ('/'):
 *    - If authenticated -> redirect to /dashboard
 *    - If unauthenticated -> redirect to /login
 * 2. Protected routes ('/dashboard*'):
 *    - If unauthenticated -> redirect to /login
 * 3. Auth routes ('/login'):
 *    - If authenticated -> redirect to /dashboard
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('medknot_session');

  let isAuthenticated = false;
  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (session?.authenticated) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Root route
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Protected dashboard route
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Login route for already-authenticated users
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};
