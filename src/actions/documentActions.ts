'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from './authActions'
import * as XLSX from 'xlsx'

function generateDocumentId() {
    return Array.from({ length: 8 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))
    ).join('')
}

function generateRegNumber() {
    return Math.floor(100000 + Math.random() * 900000).toString() + Date.now().toString().slice(-4);
}

function excelSerialDateToJSDate(serial: number): Date {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
}

function parseExcelDate(val: any): Date {
    if (val instanceof Date) return val;
    if (typeof val === 'number') {
        return excelSerialDateToJSDate(val);
    }
    if (typeof val === 'string') {
        const parsed = Date.parse(val);
        if (!isNaN(parsed)) return new Date(parsed);
    }
    return new Date();
}

export async function getDocuments() {
    try {
        const session = await getSession()
        if (!session) return []

        const documents = await prisma.document.findMany({
            where: session.role === 'SUPERADMIN' ? {} : { translatorId: session.userId as string },
            orderBy: { createdAt: 'desc' },
            include: {
                translator: {
                    select: {
                        name: true,
                        skNumber: true
                    }
                }
            }
        })
        return documents
    } catch (error) {
        console.error('Failed to fetch documents:', error)
        return []
    }
}

export async function getDocumentForVerification(documentId: string) {
    try {
        const document = await prisma.document.findUnique({
            where: { documentId },
            include: {
                translator: {
                    select: {
                        name: true,
                        skNumber: true,
                        profilePicture: true,
                        bio: true,
                        languageServices: true
                    }
                }
            }
        })
        return document
    } catch (error) {
        console.error('Failed to fetch document for verification:', error)
        return null
    }
}

export async function toggleQrStatus(id: string, currentStatus: boolean) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Akses ditolak.' }

        await prisma.document.update({
            where: { id, translatorId: session.role === 'SUPERADMIN' ? undefined : session.userId as string },
            data: { isQrGenerated: !currentStatus }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error('Failed to toggle QR status:', error)
        return { success: false, error: 'Gagal memperbarui status dokumen.' }
    }
}

export async function createDocument(formData: FormData) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Akses ditolak.' }

        const registrationNumber = (formData.get('registrationNumber') as string || generateRegNumber()).trim()
        
        const existing = await prisma.document.findUnique({
            where: { registrationNumber }
        })
        if (existing) {
            return { success: false, error: `Nomor registrasi '${registrationNumber}' sudah terdaftar.` }
        }

        const documentId = generateDocumentId()

        await prisma.document.create({
            data: {
                documentId,
                registrationNumber,
                documentDate: new Date(formData.get('documentDate') as string),
                documentType: formData.get('documentType') as string,
                languagePair: formData.get('languagePair') as string,
                clientName: formData.get('clientName') as string,
                status: formData.get('status') as string || 'Selesai',
                isQrGenerated: formData.get('isQrGenerated') === 'on',
                translatorId: session.userId as string
            }
        })

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        console.error('Failed to create document:', error)
        return { success: false, error: 'Gagal mendaftarkan dokumen baru.' }
    }
}

export async function importDocumentsFromExcel(base64Data: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Akses ditolak.' }

        const buffer = Buffer.from(base64Data, 'base64')
        const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" })

        if (rawRows.length === 0) {
            return { success: false, error: 'Berkas yang diunggah kosong.' }
        }

        const normalizeKey = (key: any) => String(key).toLowerCase().replace(/[^a-z0-9]/g, '').trim()

        const firstRow = rawRows[0]
        const headers = Object.keys(firstRow)
        let hasClientName = false
        let hasDocType = false
        let hasLangPair = false

        for (const header of headers) {
            const h = normalizeKey(header)
            if (['namaklien', 'namadidokumen', 'clientname', 'klien'].includes(h)) {
                hasClientName = true
            }
            if (['tipedokumen', 'documenttype', 'tipe'].includes(h)) {
                hasDocType = true
            }
            if (['arahbahasa', 'pasanganbahasa', 'languagepair', 'bahasa'].includes(h)) {
                hasLangPair = true
            }
        }

        if (!hasClientName || !hasDocType || !hasLangPair) {
            return {
                success: false,
                error: 'Format kolom tidak sesuai template. Pastikan file memiliki kolom: Nama di Dokumen, Tipe Dokumen, dan Pasangan Bahasa.'
            }
        }

        let importedCount = 0
        let skippedCount = 0
        const errors: string[] = []

        for (const row of rawRows) {
            // Normalize row keys
            const normalizedRow: any = {}
            for (const [k, v] of Object.entries(row)) {
                normalizedRow[normalizeKey(k)] = v
            }

            const regNum = (
                normalizedRow['noregister'] || 
                normalizedRow['noregistrasi'] || 
                normalizedRow['nomorregistrasi'] || 
                normalizedRow['registrationnumber'] || 
                ''
            ).toString().trim() || generateRegNumber()

            const rawDate = normalizedRow['tanggal'] || normalizedRow['tanggaldokumen'] || normalizedRow['date'] || normalizedRow['documentdate']
            
            const docType = (
                normalizedRow['tipedokumen'] || 
                normalizedRow['documenttype'] || 
                normalizedRow['tipe'] || 
                'Dokumen Terjemahan'
            ).toString().trim()

            const langPair = (
                normalizedRow['arahbahasa'] || 
                normalizedRow['pasanganbahasa'] || 
                normalizedRow['languagepair'] || 
                normalizedRow['bahasa'] || 
                'N/A'
            ).toString().trim()

            const clientName = (
                normalizedRow['namaklien'] || 
                normalizedRow['namadidokumen'] || 
                normalizedRow['clientname'] || 
                normalizedRow['klien'] || 
                'N/A'
            ).toString().trim()

            const docDate = parseExcelDate(rawDate)

            try {
                const existing = await prisma.document.findUnique({
                    where: { registrationNumber: regNum }
                })

                if (existing) {
                    skippedCount++
                    errors.push(`Nomor registrasi '${regNum}' sudah terdaftar, dilewati.`)
                    continue
                }

                let docId = generateDocumentId()
                let docIdConflict = await prisma.document.findUnique({ where: { documentId: docId } })
                while (docIdConflict) {
                    docId = generateDocumentId()
                    docIdConflict = await prisma.document.findUnique({ where: { documentId: docId } })
                }

                await prisma.document.create({
                    data: {
                        documentId: docId,
                        registrationNumber: regNum,
                        documentDate: docDate,
                        documentType: docType,
                        languagePair: langPair,
                        clientName: clientName,
                        status: 'Selesai',
                        isQrGenerated: true,
                        translatorId: session.userId as string
                    }
                })

                importedCount++
            } catch (err: any) {
                skippedCount++
                errors.push(`Gagal mengimpor data untuk '${clientName}': ${err.message}`)
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
        console.error('Excel import failed:', error)
        return { success: false, error: 'Gagal memproses berkas Excel: ' + error.message }
    }
}

export async function searchDocument(query: string) {
    try {
        const trimmed = query.trim()
        if (!trimmed) return { success: false, error: 'Silakan masukkan nomor registrasi atau ID Dokumen.' }

        const document = await prisma.document.findFirst({
            where: {
                OR: [
                    { documentId: trimmed },
                    { registrationNumber: { equals: trimmed } }
                ]
            }
        })

        if (!document) {
            return { success: false, error: 'Dokumen terverifikasi tidak ditemukan.' }
        }

        if (!document.isQrGenerated) {
            return { success: false, error: 'Dokumen ini belum diotorisasi untuk verifikasi publik.' }
        }

        return { success: true, documentId: document.documentId }
    } catch (error) {
        console.error('Search failed:', error)
        return { success: false, error: 'Terjadi kesalahan saat mencari dokumen.' }
    }
}

export async function getAllTranslators() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'SUPERADMIN') return []

        const translators = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { documents: true }
                }
            }
        })
        return translators
    } catch (error) {
        console.error('Failed to fetch translators:', error)
        return []
    }
}
