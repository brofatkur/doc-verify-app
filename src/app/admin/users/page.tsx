import prisma from "@/lib/prisma"
import { getSession } from "@/actions/authActions"
import { redirect } from "next/navigation"
import TranslatorManager from "../TranslatorManager"
import { ShieldCheck, Award } from "lucide-react"

async function getAllUsers() {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            skNumber: true,
            role: true,
            _count: {
                select: { documents: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export default async function UsersManagementPage() {
    const session = await getSession()
    if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN')) {
        redirect('/login')
    }

    const users = await getAllUsers()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full w-max mb-2.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="tracking-wider uppercase">PORTAL MANAJEMEN USER IPPTI</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Manajemen Pengguna</h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola data login, peran, nomor SK Kemenkumham untuk Pengurus Admin dan Penerjemah Tersumpah.</p>
                </div>
            </div>

            {/* Roster of Users / Translators */}
            <TranslatorManager initialTranslators={users} />
        </div>
    )
}
