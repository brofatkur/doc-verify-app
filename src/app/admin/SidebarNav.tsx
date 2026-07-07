'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Settings, Award } from "lucide-react";

interface SidebarNavProps {
    role: string;
}

export default function SidebarNav({ role }: SidebarNavProps) {
    const pathname = usePathname();

    const isSuperOrAdmin = role === 'SUPERADMIN' || role === 'ADMIN';

    return (
        <nav className="flex-1 px-4 py-4 space-y-2">
            <Link
                href="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    pathname === '/admin' || pathname === '/admin/new'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <FileText className={`w-5 h-5 ${pathname === '/admin' || pathname === '/admin/new' ? 'text-emerald-450 text-white' : 'text-slate-400'}`} />
                <span className="font-medium">Data Dokumen</span>
            </Link>

            {isSuperOrAdmin && (
                <Link
                    href="/admin/users"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        pathname.startsWith('/admin/users')
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <Award className={`w-5 h-5 ${pathname.startsWith('/admin/users') ? 'text-emerald-450 text-white' : 'text-slate-400'}`} />
                    <span className="font-medium">Manajemen User</span>
                </Link>
            )}

            <Link
                href="/admin/profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    pathname === '/admin/profile'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <Settings className={`w-5 h-5 ${pathname === '/admin/profile' ? 'text-emerald-450 text-white' : 'text-slate-400'}`} />
                <span className="font-medium">Profil & Layanan</span>
            </Link>
        </nav>
    );
}
