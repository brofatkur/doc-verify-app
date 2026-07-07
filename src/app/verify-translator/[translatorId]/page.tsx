import prisma from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import TranslatorDetailCard from "./TranslatorDetailCard"

interface Props {
    params: Promise<{
        translatorId: string
    }>
}

export default async function VerifyTranslatorPage({ params }: Props) {
    const { translatorId } = await params
    
    // Find user by ID or by skNumber (which is No Anggota)
    const translator = await prisma.user.findFirst({
        where: {
            OR: [
                { id: translatorId },
                { skNumber: translatorId }
            ]
        }
    })

    if (!translator || translator.skNumber === 'IPPTI-BOARD') {
        notFound()
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            {/* Background blur blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full filter blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-blue-500/5 rounded-full filter blur-[120px]"></div>

            {/* Header */}
            <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-900 mb-8 z-10">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-8 w-auto rounded bg-white p-0.5 object-contain shadow-md" />
                    <span className="text-lg font-bold tracking-tight text-white">DocVerify</span>
                </Link>
                <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors">
                    Kembali ke Beranda
                </Link>
            </header>

            {/* Main Area */}
            <main className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full">
                <TranslatorDetailCard translator={translator} />
            </main>

            {/* Footer */}
            <footer className="max-w-4xl w-full mx-auto text-center text-[10px] text-slate-650 pt-8 border-t border-slate-900 mt-12">
                &copy; {new Date().getFullYear()} Ikatan Penerjemah Pemerintah Indonesia (IPPTI) & Kementerian Hukum dan HAM RI.
            </footer>
        </div>
    )
}
