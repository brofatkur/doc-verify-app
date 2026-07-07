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

export async function findTranslatorByMemberNo(memberNo: string) {
    if (!memberNo) return { success: false, error: 'Nomor anggota wajib diisi.' }
    try {
        const user = await prisma.user.findFirst({
            where: {
                skNumber: memberNo,
                role: 'TRANSLATOR'
            }
        })
        if (user) {
            return {
                success: true,
                translator: {
                    name: user.name,
                    email: user.email.endsWith('@ippti.or.id') ? '' : user.email,
                }
            }
        }
        return { success: false, error: 'Nomor anggota tidak ditemukan dalam data pra-impor.' }
    } catch (error: any) {
        console.error('Find translator by member number error:', error)
        return { success: false, error: 'Gagal mencari nomor anggota.' }
    }
}

export async function registerTranslator(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const skNumber = formData.get('skNumber') as string

    if (!email || !password || !name || !skNumber) {
        return { success: false, error: 'Semua kolom wajib diisi.' }
    }

    try {
        // Check if there is an existing translator by member number
        const existingBySk = await prisma.user.findFirst({
            where: { skNumber, role: 'TRANSLATOR' }
        })

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser && (!existingBySk || existingUser.id !== existingBySk.id)) {
            return { success: false, error: 'Alamat email sudah terdaftar.' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        let user;

        if (existingBySk) {
            // Claim/update the pre-imported translator record
            user = await prisma.user.update({
                where: { id: existingBySk.id },
                data: {
                    email,
                    password: hashedPassword,
                    name
                }
            })
        } else {
            // Create a completely new translator
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    skNumber,
                    role: 'TRANSLATOR'
                }
            })
        }

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({ userId: user.id, email: user.email, name: user.name, role: user.role })

        const cookieStore = await cookies()
        cookieStore.set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })

        return { success: true }
    } catch (error: any) {
        console.error('Registration failed:', error)
        return { success: false, error: 'Terjadi kesalahan sistem saat mendaftar: ' + error.message }
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

export async function forgotPassword(email: string) {
    try {
        if (!email) return { success: false, error: 'Email wajib diisi.' }
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            // Avoid leaking user existence for safety but let them know it's processed
            return { success: true, message: 'Jika email terdaftar, instruksi reset password telah dikirim.' }
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const expiresAt = new Date(Date.now() + 3600000) // 1 hour expiry

        // Save token to DB
        await prisma.passwordResetToken.upsert({
            where: { token },
            update: { expiresAt },
            create: { email, token, expiresAt }
        })

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`

        // Log link to terminal for easy local testing
        console.log('\n======================================================')
        console.log(`[RESET PASSWORD LINK FOR ${email}]:`)
        console.log(resetLink)
        console.log('======================================================\n')

        // Simulating email sending successfully
        return { success: true, message: 'Link reset password telah dikirim ke email terdaftar (dan dicatat di log terminal).' }
    } catch (error: any) {
        console.error('Forgot password error:', error)
        return { success: false, error: 'Terjadi kesalahan saat memproses permintaan Anda.' }
    }
}

export async function resetPassword(token: string, passwordConfirm: string) {
    try {
        if (!token) return { success: false, error: 'Token reset tidak valid.' }
        if (!passwordConfirm || passwordConfirm.length < 6) return { success: false, error: 'Password minimal terdiri dari 6 karakter.' }

        const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
        if (!resetToken || resetToken.expiresAt < new Date()) {
            return { success: false, error: 'Token reset sudah kadaluarsa atau tidak valid.' }
        }

        const hashedPassword = await bcrypt.hash(passwordConfirm, 10)

        // Update user
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword }
        })

        // Clean token
        await prisma.passwordResetToken.delete({ where: { token } })

        return { success: true, message: 'Password Anda berhasil diperbarui. Silakan masuk kembali.' }
    } catch (error: any) {
        console.error('Reset password error:', error)
        return { success: false, error: 'Gagal memperbarui password.' }
    }
}

export async function searchTranslatorAction(query: string) {
    try {
        if (!query || query.trim() === '') return { success: false, error: 'Query pencarian kosong.' }
        const cleanQuery = query.trim().toLowerCase()
        const translators = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: cleanQuery } },
                    { skNumber: { contains: cleanQuery } },
                    { bio: { contains: cleanQuery } }
                ]
            },
            select: {
                id: true,
                name: true,
                skNumber: true,
                languageServices: true,
                bio: true,
                profilePicture: true
            }
        })
        
        // Filter only translators
        // Wait, let's keep only users who have a SK number (translators have numeric/SK numbers)
        // or specifically role = 'TRANSLATOR'
        const filtered = translators.filter(t => t.skNumber !== 'IPPTI-BOARD')
        
        return { success: true, translators: filtered }
    } catch (error: any) {
        console.error('Search translator error:', error)
        return { success: false, error: 'Terjadi kesalahan sistem saat mencari penerjemah.' }
    }
}
