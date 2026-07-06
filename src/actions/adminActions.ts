'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { getSession } from './authActions'

export async function createTranslatorByAdmin(formData: FormData) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'SUPERADMIN') {
            return { success: false, error: 'Akses ditolak.' }
        }

        const email = formData.get('email') as string
        const name = formData.get('name') as string
        const password = formData.get('password') as string
        const role = formData.get('role') as string || 'TRANSLATOR'
        
        let skNumber = formData.get('skNumber') as string
        if (role === 'SUPERADMIN' && (!skNumber || skNumber.trim() === '')) {
            skNumber = 'IPPTI-BOARD'
        }

        if (!email || !name || !skNumber || !password) {
            return { success: false, error: 'Semua kolom wajib diisi.' }
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return { success: false, error: `Email '${email}' sudah terdaftar.` }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                email,
                name,
                skNumber,
                password: hashedPassword,
                role
            }
        })

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        console.error('Failed to create user:', error)
        return { success: false, error: 'Gagal membuat akun user: ' + error.message }
    }
}

export async function updateTranslatorByAdmin(id: string, formData: FormData) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'SUPERADMIN') {
            return { success: false, error: 'Akses ditolak.' }
        }

        const email = formData.get('email') as string
        const name = formData.get('name') as string
        const role = formData.get('role') as string || 'TRANSLATOR'
        
        let skNumber = formData.get('skNumber') as string
        if (role === 'SUPERADMIN' && (!skNumber || skNumber.trim() === '')) {
            skNumber = 'IPPTI-BOARD'
        }

        if (!email || !name || !skNumber) {
            return { success: false, error: 'Nama, Email, dan Nomor Anggota/SK wajib diisi.' }
        }

        const existingEmail = await prisma.user.findFirst({
            where: {
                email,
                NOT: { id }
            }
        })
        if (existingEmail) {
            return { success: false, error: `Email '${email}' sudah digunakan oleh pengguna lain.` }
        }

        const updateData: any = {
            email,
            name,
            skNumber,
            role
        }

        const password = formData.get('password') as string
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10)
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        })

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        console.error('Failed to update user:', error)
        return { success: false, error: 'Gagal memperbarui data user: ' + error.message }
    }
}

export async function deleteTranslatorByAdmin(id: string) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'SUPERADMIN') {
            return { success: false, error: 'Akses ditolak.' }
        }

        if (session.userId === id) {
            return { success: false, error: 'Anda tidak dapat menghapus akun Anda sendiri.' }
        }

        const docCount = await prisma.document.count({
            where: { translatorId: id }
        })

        if (docCount > 0) {
            return { success: false, error: 'Akun tidak bisa dihapus karena telah memiliki dokumen resmi terdaftar.' }
        }

        await prisma.user.delete({
            where: { id }
        })

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        console.error('Failed to delete user:', error)
        return { success: false, error: 'Gagal menghapus user: ' + error.message }
    }
}
