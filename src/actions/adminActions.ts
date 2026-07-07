'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { getSession } from './authActions'
import * as XLSX from 'xlsx'

export async function createTranslatorByAdmin(formData: FormData) {
    try {
        const session = await getSession()
        if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN')) {
            return { success: false, error: 'Akses ditolak.' }
        }

        const email = formData.get('email') as string
        const name = formData.get('name') as string
        const password = formData.get('password') as string
        const role = formData.get('role') as string || 'TRANSLATOR'

        if (session.role === 'ADMIN' && role !== 'TRANSLATOR') {
            return { success: false, error: 'Admin hanya dapat membuat akun Penerjemah.' }
        }
        
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
        if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN')) {
            return { success: false, error: 'Akses ditolak.' }
        }

        const targetUser = await prisma.user.findUnique({ where: { id } })
        if (targetUser && targetUser.role !== 'TRANSLATOR' && session.role !== 'SUPERADMIN') {
            return { success: false, error: 'Hanya Super Admin yang dapat mengubah profil Admin/Super Admin.' }
        }

        const email = formData.get('email') as string
        const name = formData.get('name') as string
        const role = formData.get('role') as string || 'TRANSLATOR'
        
        if (session.role === 'ADMIN' && role !== 'TRANSLATOR') {
            return { success: false, error: 'Admin hanya dapat menyetel peran ke Penerjemah.' }
        }
        
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
        if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN')) {
            return { success: false, error: 'Akses ditolak.' }
        }

        if (session.userId === id) {
            return { success: false, error: 'Anda tidak dapat menghapus akun Anda sendiri.' }
        }

        const targetUser = await prisma.user.findUnique({ where: { id } })
        if (targetUser && targetUser.role !== 'TRANSLATOR' && session.role !== 'SUPERADMIN') {
            return { success: false, error: 'Hanya Super Admin yang dapat menghapus akun Admin/Super Admin.' }
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

export async function importTranslatorsFromExcel(base64Data: string) {
    try {
        const session = await getSession()
        if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN')) {
            return { success: false, error: 'Akses ditolak.' }
        }

        const buffer = Buffer.from(base64Data, 'base64')
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" })

        if (rawRows.length === 0) {
            return { success: false, error: 'Berkas yang diunggah kosong.' }
        }

        const normalizeKey = (key: any) => String(key).toLowerCase().replace(/[^a-z0-9]/g, '').trim()

        // Validate template headers
        const firstRow = rawRows[0]
        const headers = Object.keys(firstRow)
        let hasNoAnggota = false
        let hasNamaPenerjemah = false
        let hasEmail = false

        for (const header of headers) {
            const h = normalizeKey(header)
            if (['noanggota', 'nomoranggota', 'membernumber'].includes(h)) {
                hasNoAnggota = true
            }
            if (['namapenerjemah', 'nama', 'fullname', 'name'].includes(h)) {
                hasNamaPenerjemah = true
            }
            if (['email', 'alamatemail'].includes(h)) {
                hasEmail = true
            }
        }

        if (!hasNoAnggota || !hasNamaPenerjemah || !hasEmail) {
            return {
                success: false,
                error: 'Format kolom tidak sesuai template. Pastikan file memiliki kolom: No Anggota, Nama Penerjemah, dan Email.'
            }
        }

        let importedCount = 0
        let skippedCount = 0
        const errors: string[] = []
        const defaultPasswordHash = await bcrypt.hash('penerjemah123', 10)

        for (const row of rawRows) {
            // Normalize keys
            const normalizedRow: any = {}
            for (const [k, v] of Object.entries(row)) {
                normalizedRow[normalizeKey(k)] = v
            }

            const noAnggota = (
                normalizedRow['noanggota'] || 
                normalizedRow['nomoranggota'] || 
                normalizedRow['membernumber'] || 
                ''
            ).toString().trim()

            const nama = (
                normalizedRow['namapenerjemah'] || 
                normalizedRow['nama'] || 
                normalizedRow['fullname'] || 
                normalizedRow['name'] || 
                ''
            ).toString().trim()

            const email = (
                normalizedRow['email'] || 
                normalizedRow['alamatemail'] || 
                ''
            ).toString().trim()

            const sk = (
                normalizedRow['skkemenkumham'] || 
                normalizedRow['nomorsk'] || 
                normalizedRow['sk'] || 
                'AHU-' + noAnggota
            ).toString().trim()

            const arahBahasa = (
                normalizedRow['arahbahasa'] || 
                normalizedRow['pasanganbahasa'] || 
                ''
            ).toString().trim()

            if (!noAnggota || !nama || !email) {
                skippedCount++
                errors.push(`Baris dilewati: Data No Anggota, Nama, atau Email kosong.`)
                continue
            }

            try {
                const existing = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email },
                            { skNumber: noAnggota }
                        ]
                    }
                })

                if (existing) {
                    skippedCount++
                    errors.push(`Penerjemah '${nama}' (${email}/${noAnggota}) sudah terdaftar, dilewati.`)
                    continue
                }

                await prisma.user.create({
                    data: {
                        email,
                        name: nama,
                        skNumber: noAnggota,
                        password: defaultPasswordHash,
                        role: 'TRANSLATOR',
                        languageServices: arahBahasa || null,
                        bio: `Pernyataan verifikasi Kemenkumham: SK nomor ${sk}`,
                    }
                })

                importedCount++
            } catch (err: any) {
                skippedCount++
                errors.push(`Gagal mengimpor '${nama}': ` + err.message)
            }
        }

        revalidatePath('/admin')
        return {
            success: true,
            importedCount,
            skippedCount,
            errors
        }
    } catch (error: any) {
        console.error('Import translators error:', error)
        return { success: false, error: 'Terjadi kesalahan sistem saat mengimpor data.' }
    }
}
