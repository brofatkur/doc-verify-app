const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

const dbPath = path.join(__dirname, 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
    const passwordPlain = 'penerjemah123'
    const adminPasswordPlain = 'ippti123'
    const hashedPassword = await bcrypt.hash(passwordPlain, 10)
    const hashedAdminPassword = await bcrypt.hash(adminPasswordPlain, 10)

    try {
        const translator = await prisma.user.upsert({
            where: { email: 'penerjemah@example.com' },
            update: {
                password: hashedPassword,
                name: 'Zaki Syah Iqbal, M.Hum.',
                skNumber: 'AHU-5432.AH.01.02.Tahun-2025',
                role: 'TRANSLATOR'
            },
            create: {
                email: 'penerjemah@example.com',
                password: hashedPassword,
                name: 'Zaki Syah Iqbal, M.Hum.',
                skNumber: 'AHU-5432.AH.01.02.Tahun-2025',
                role: 'TRANSLATOR'
            }
        })

        const superAdmin = await prisma.user.upsert({
            where: { email: 'ippti@example.com' },
            update: {
                password: hashedAdminPassword,
                name: 'IPPTI Board Administrator',
                skNumber: 'IPPTI-HQ-2026',
                role: 'SUPERADMIN'
            },
            create: {
                email: 'ippti@example.com',
                password: hashedAdminPassword,
                name: 'IPPTI Board Administrator',
                skNumber: 'IPPTI-HQ-2026',
                role: 'SUPERADMIN'
            }
        })

        const boardAdmin = await prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {
                password: await bcrypt.hash('admin123', 10),
                name: 'IPPTI Admin Staff',
                skNumber: 'IPPTI-ADMIN-01',
                role: 'ADMIN'
            },
            create: {
                email: 'admin@example.com',
                password: await bcrypt.hash('admin123', 10),
                name: 'IPPTI Admin Staff',
                skNumber: 'IPPTI-ADMIN-01',
                role: 'ADMIN'
            }
        })

        const arifin = await prisma.user.upsert({
            where: { email: 'arifin@example.com' },
            update: {
                password: hashedPassword,
                name: 'Muhammad Arifin',
                skNumber: '25004',
                role: 'TRANSLATOR',
                languageServices: 'Indonesia - Inggris, Inggris - Indonesia, Indonesia - Belanda, Belanda - Indonesia',
                bio: 'AHU-55 AH.03.07.2022 Tanggal 5 Oktober 2022',
                noSkKemenkum: 'AHU-55 AH.03.07.2022',
                tglSk: '5 Oktober 2022',
                masaAktif: 'Seumur Hidup',
                skLengkap: 'AHU-55 AH.03.07.2022 Tanggal 5 Oktober 2022'
            },
            create: {
                email: 'arifin@example.com',
                password: hashedPassword,
                name: 'Muhammad Arifin',
                skNumber: '25004',
                role: 'TRANSLATOR',
                languageServices: 'Indonesia - Inggris, Inggris - Indonesia, Indonesia - Belanda, Belanda - Indonesia',
                bio: 'AHU-55 AH.03.07.2022 Tanggal 5 Oktober 2022',
                noSkKemenkum: 'AHU-55 AH.03.07.2022',
                tglSk: '5 Oktober 2022',
                masaAktif: 'Seumur Hidup',
                skLengkap: 'AHU-55 AH.03.07.2022 Tanggal 5 Oktober 2022'
            }
        })

        const document = await prisma.document.upsert({
            where: { registrationNumber: 'REG-Dutch-2026-001' },
            update: {
                documentId: 'VFY7A8B9',
                documentDate: new Date('2026-03-01'),
                documentType: 'Akta Pendaftaran Keputusan Pengadilan',
                languagePair: 'Dutch - Indonesian',
                clientName: 'Zaki Syah Iqbal',
                status: 'Selesai',
                isQrGenerated: true,
                translatorId: translator.id
            },
            create: {
                documentId: 'VFY7A8B9',
                registrationNumber: 'REG-Dutch-2026-001',
                documentDate: new Date('2026-03-01'),
                documentType: 'Akta Pendaftaran Keputusan Pengadilan',
                languagePair: 'Dutch - Indonesian',
                clientName: 'Zaki Syah Iqbal',
                status: 'Selesai',
                isQrGenerated: true,
                translatorId: translator.id
            }
        })

        console.log('Successfully seeded database accounts:')
        console.log(`1. Sworn Translator User:`)
        console.log(`   Email: ${translator.email}`)
        console.log(`   Password: ${passwordPlain}`)
        console.log(`2. IPPTI Super Admin:`)
        console.log(`   Email: ${superAdmin.email}`)
        console.log(`   Password: ${adminPasswordPlain}`)
        console.log(`3. Verified Demo Document:`)
        console.log(`   Doc ID: ${document.documentId}`)
        console.log(`   Registration No: ${document.registrationNumber}`)
        console.log(`   Verification Link: http://localhost:3000/verify/${document.documentId}`)
    } catch (err) {
        console.error('Error seeding database:', err)
    } finally {
        await prisma.$disconnect()
    }
}

main()
