import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {verifySessionCookie} from './lib/firebase/server-auth';

// This forces the file to be evaluated in the nodejs runtime for the middleware.
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const user = await verifySessionCookie();

  const {pathname} = request.nextUrl;

  // If user is authenticated and tries to access login/signup, redirect to dashboard
  if (user && (pathname === '/' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and tries to access a protected route, redirect to login
  if (!user && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ['/dashboard', '/logs', '/projects', '/documents', '/settings'];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
