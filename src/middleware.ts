import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Define your domains
  const landingDomain = 'journaling.tech'
  const appDomain = 'app.journaling.tech'
  
  // Also handle www variant
  const isLandingDomain = hostname === landingDomain || 
                          hostname === `www.${landingDomain}` ||
                          (hostname.endsWith('.journaling.tech') === false && hostname.includes('journaling'))

  const isAppDomain = hostname === appDomain || 
                      hostname.startsWith('app.')

  // For local development
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  // If we're on the landing domain (journaling.tech)
  if (isLandingDomain && !isAppDomain && !isLocalhost) {
    // Rewrite root to landing page (URL stays as journaling.tech/)
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/landing', request.url))
    }
    
    // If someone tries to access /landing directly, redirect to clean URL
    if (pathname === '/landing') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Redirect app routes to app subdomain
    const appRoutes = ['/entries', '/insights', '/settings']
    if (appRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL(`https://${appDomain}${pathname}`, request.url))
    }
  }

  // If we're on the app domain (app.journaling.tech)
  if (isAppDomain && !isLocalhost) {
    // Redirect /landing to the main landing domain
    if (pathname === '/landing') {
      return NextResponse.redirect(new URL(`https://${landingDomain}`, request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
