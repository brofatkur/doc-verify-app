import prisma from '@/lib/prisma'
import { getSession } from '@/actions/authActions'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: {
            id: true,
            name: true,
            email: true,
            skNumber: true,
            role: true,
            bio: true,
            languageServices: true,
            profilePicture: true
        }
    })

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Profil & Layanan</h1>
                <p className="text-slate-500 text-sm mt-1">Lengkapi informasi profil penerjemah tersumpah Anda untuk kebutuhan publik.</p>
            </div>

            <ProfileForm user={user} />
        </div>
    )
}
