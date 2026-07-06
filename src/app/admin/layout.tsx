import Link from "next/link";
import { ShieldCheck, FileText, Settings, LogOut } from "lucide-react";
import { getSession, logoutTranslator } from "@/actions/authActions";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getSession();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
                <div className="p-6">
                    <Link href="/admin" className="flex items-center gap-3 text-xl font-bold text-white">
                        <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-8 w-auto rounded bg-white p-0.5 object-contain" />
                        <span>DocVerify</span>
                    </Link>
                    <p className="text-slate-400 text-xs mt-2">Panel Dashboard</p>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <span className="font-medium">Data Dokumen</span>
                    </Link>
                    <Link href="/admin/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
                        <Settings className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">Profil & Layanan</span>
                    </Link>
                </nav>

                {session && (
                    <div className="px-6 py-4 border-t border-slate-800/40 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 font-bold uppercase flex-shrink-0">
                            {session.name ? String(session.name)[0] : 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate text-slate-200">{session.name ? String(session.name) : 'Penerjemah'}</p>
                            <p className="text-xs text-slate-400 truncate">{session.role === 'SUPERADMIN' ? 'Pengurus IPPTI' : 'Penerjemah Tersumpah'}</p>
                        </div>
                    </div>
                )}

                <div className="p-4 border-t border-slate-800/40">
                    <form action={logoutTranslator}>
                        <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition cursor-pointer">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Keluar</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Topbar */}
            <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
                <Link href="/admin" className="flex items-center gap-2 text-lg font-bold">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-6 w-auto rounded bg-white p-0.5 object-contain" />
                    <span>DocVerify Panel</span>
                </Link>
                <form action={logoutTranslator}>
                    <button type="submit" className="text-slate-400 hover:text-red-400 p-2 cursor-pointer">
                        <LogOut className="w-5 h-5" />
                    </button>
                </form>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
