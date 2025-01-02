export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inventory/:path*',
    '/operations/:path*',
    '/contacts/:path*',
    '/tools/:path*',
  ]
}