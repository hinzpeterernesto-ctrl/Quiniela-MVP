import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

const PROTECTED = ['/dashboard', '/groups', '/matches', '/profile']
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createClient(request, response)

  // Always use getUser() — validates JWT with Supabase server
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED.some(p => path.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some(p => path.startsWith(p))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    if (!path.startsWith('http')) url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
