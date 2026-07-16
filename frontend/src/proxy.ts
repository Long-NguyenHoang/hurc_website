import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/admin/login')) {
        const hasExpired = request.nextUrl.searchParams.get('expired') === 'true';
        if (hasExpired) {
            const response = NextResponse.next();
            response.cookies.delete('access_token');
            return response;
        }
        if (token) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*']
}