import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Super-admin only routes
    const superAdminRoutes = ['/admin/hierarchy', '/admin/users'];
    if (superAdminRoutes.some((r) => path.startsWith(r))) {
      if (token?.role !== 'super-admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    }

    // Any admin role can access general admin routes
    const adminRoles = ['super-admin', 'zone-admin', 'area-admin', 'parish-admin', 'group-admin'];
    if (path.startsWith('/admin') && !adminRoles.includes(token?.role as string)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};
