import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {verifySessionCookie} from './lib/firebase/server-auth';

// This forces the file to be evaluated in the nodejs runtime for the middleware.
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Temporarily disable middleware for debugging
  if (pathname.startsWith('/debug')) {
    return NextResponse.next();
  }

  try {
    const user = await verifySessionCookie(request);
    
    console.log(`Middleware check for ${pathname}:`, {
      hasUser: !!user,
      userEmail: user?.email || 'none',
      isProtected: isProtectedRoute(pathname)
    });

    // If user is authenticated and tries to access login/signup, redirect to dashboard
    if (user && (pathname === '/' || pathname === '/signup')) {
      console.log('Authenticated user accessing auth page, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is not authenticated and tries to access a protected route, redirect to login
    if (!user && isProtectedRoute(pathname)) {
      console.log('Unauthenticated user accessing protected route, redirecting to login');
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to proceed to avoid blocking the app
    return NextResponse.next();
  }
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ['/dashboard', '/logs', '/projects', '/documents', '/settings', '/reports'];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
