'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-super-secret-docverify-key-value'
)

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET)
}

export async function decrypt(input: string) {
    try {
        const { payload } = await jwtVerify(input, JWT_SECRET, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return null
    return await decrypt(session)
}

export async function registerTranslator(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const skNumber = formData.get('skNumber') as string

    if (!email || !password || !name || !skNumber) {
        return { success: false, error: 'All fields are required.' }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { success: false, error: 'Email is already registered.' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                skNumber
            }
        })

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({ userId: user.id, email: user.email, name: user.name, role: user.role })

        const cookieStore = await cookies()
        cookieStore.set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })

        return { success: true }
    } catch (error: any) {
        console.error('Registration failed:', error)
        return { success: false, error: 'An error occurred during registration. Please try again.' }
    }
}

export async function loginTranslator(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { success: false, error: 'Email and password are required.' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return { success: false, error: 'Invalid email or password.' }
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return { success: false, error: 'Invalid email or password.' }
        }

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({ userId: user.id, email: user.email, name: user.name, role: user.role })

        const cookieStore = await cookies()
        cookieStore.set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })

        return { success: true }
    } catch (error: any) {
        console.error('Login failed:', error)
        return { success: false, error: 'An error occurred during login. Please try again.' }
    }
}

export async function logoutTranslator() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}

export async function updateProfile(formData: FormData) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Akses ditolak.' }

        const bio = formData.get('bio') as string
        const languageServices = formData.get('languageServices') as string
        const file = formData.get('profilePicture') as File | null

        let profilePicture = undefined

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const ext = path.extname(file.name) || '.jpg'
            const fileName = `profile-${session.userId}-${Date.now()}${ext}`
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
            
            await mkdir(uploadsDir, { recursive: true })
            
            const filePath = path.join(uploadsDir, fileName)
            await writeFile(filePath, buffer)
            profilePicture = `/uploads/${fileName}`
        }

        await prisma.user.update({
            where: { id: session.userId as string },
            data: {
                bio: bio || null,
                languageServices: languageServices || null,
                ...(profilePicture ? { profilePicture } : {})
            }
        })

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        console.error('Failed to update profile:', error)
        return { success: false, error: 'Gagal memperbarui profil: ' + error.message }
    }
}
