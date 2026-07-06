import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-super-secret-docverify-key-value'
)

async function decrypt(input: string) {
    try {
        const { payload } = await jwtVerify(input, JWT_SECRET, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const session = request.cookies.get('session')?.value

    const payload = session ? await decrypt(session) : null

    if (pathname.startsWith('/admin')) {
        if (!payload) {
            const url = new URL('/login', request.url)
            return NextResponse.redirect(url)
        }
    }

    if (pathname === '/login' || pathname === '/register') {
        if (payload) {
            const url = new URL('/admin', request.url)
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/login', '/register'],
}
