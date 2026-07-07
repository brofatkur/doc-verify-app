'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit, Trash2, X, Loader2, Search, Award, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { createTranslatorByAdmin, updateTranslatorByAdmin, deleteTranslatorByAdmin } from '@/actions/adminActions'
import TranslatorImportButton from './TranslatorImportButton'

interface UserRecord {
    id: string
    name: string
    email: string
    skNumber: string
    role: string
    _count: {
        documents: number
    }
}

export default function TranslatorManager({ initialTranslators }: { initialTranslators: UserRecord[] }) {
    const [translators, setTranslators] = useState<UserRecord[]>(initialTranslators)
    const [searchQuery, setSearchQuery] = useState('')
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [activeModal, setActiveModal] = useState<'create' | 'edit' | 'delete' | null>(null)
    const [selectedTranslator, setSelectedTranslator] = useState<UserRecord | null>(null)
    
    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        skNumber: '',
        password: '',
        role: 'TRANSLATOR'
    })

    const filteredTranslators = translators.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.skNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.role === 'SUPERADMIN' ? 'pengurus' : 'penerjemah').includes(searchQuery.toLowerCase())
    )

    const openCreateModal = () => {
        setFormData({ name: '', email: '', skNumber: '', password: '', role: 'TRANSLATOR' })
        setError(null)
        setSuccess(null)
        setShowPassword(false)
        setActiveModal('create')
    }

    const openEditModal = (user: UserRecord) => {
        setSelectedTranslator(user)
        setFormData({
            name: user.name,
            email: user.email,
            skNumber: user.skNumber,
            password: '',
            role: user.role
        })
        setError(null)
        setSuccess(null)
        setShowPassword(false)
        setActiveModal('edit')
    }

    const openDeleteModal = (user: UserRecord) => {
        setSelectedTranslator(user)
        setError(null)
        setSuccess(null)
        setActiveModal('delete')
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        const rawData = new FormData()
        rawData.append('name', formData.name)
        rawData.append('email', formData.email)
        rawData.append('skNumber', formData.skNumber)
        rawData.append('password', formData.password)
        rawData.append('role', formData.role)

        startTransition(async () => {
            const res = await createTranslatorByAdmin(rawData)
            if (res.success) {
                setSuccess('Akun pengguna baru berhasil dibuat!')
                setActiveModal(null)
                window.location.reload()
            } else {
                setError(res.error || 'Gagal membuat akun.')
            }
        })
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTranslator) return
        setError(null)
        setSuccess(null)

        const rawData = new FormData()
        rawData.append('name', formData.name)
        rawData.append('email', formData.email)
        rawData.append('skNumber', formData.skNumber)
        rawData.append('role', formData.role)
        if (formData.password) {
            rawData.append('password', formData.password)
        }

        startTransition(async () => {
            const res = await updateTranslatorByAdmin(selectedTranslator.id, rawData)
            if (res.success) {
                setSuccess('Data pengguna berhasil diperbarui!')
                setActiveModal(null)
                window.location.reload()
            } else {
                setError(res.error || 'Gagal memperbarui data.')
            }
        })
    }

    const handleDeleteSubmit = async () => {
        if (!selectedTranslator) return
        setError(null)
        setSuccess(null)

        startTransition(async () => {
            const res = await deleteTranslatorByAdmin(selectedTranslator.id)
            if (res.success) {
                setSuccess('Akun pengguna berhasil dihapus.')
                setActiveModal(null)
                window.location.reload()
            } else {
                setError(res.error || 'Gagal menghapus pengguna.')
            }
        })
    }

    return (
        <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span>Daftar Pengguna Sistem ({translators.length})</span>
                </h2>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search Field */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari pengguna..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                        />
                    </div>
                    {/* Add Button */}
                    <div className="flex items-center gap-2">
                        <TranslatorImportButton />
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer flex-shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                            <span>Tambah Anggota/Pengurus</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Messages */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold leading-snug">
                    {success}
                </div>
            )}
            {error && activeModal === null && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-bold leading-snug">
                    {error}
                </div>
            )}

            {/* Table of Users */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Email</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Peran</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor Anggota</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Dokumen</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTranslators.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Pengguna tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredTranslators.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                                        <td className="px-6 py-4 font-bold text-slate-900">{t.name}</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{t.email}</td>
                                        <td className="px-6 py-4">
                                            {t.role === 'SUPERADMIN' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Pengurus IPPTI
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                                                    Penerjemah
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{t.skNumber}</td>
                                        <td className="px-6 py-4 text-center font-bold text-emerald-600">
                                            {t.role === 'SUPERADMIN' ? '-' : t._count.documents}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(t)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Edit Profil"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(t)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Hapus Pengguna"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALS */}
            
            {/* Create & Edit Modal */}
            {(activeModal === 'create' || activeModal === 'edit') && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-100 relative">
                        <button
                            onClick={() => setActiveModal(null)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {activeModal === 'create' ? 'Tambah Pengguna Baru' : 'Edit Profil Pengguna'}
                        </h3>

                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold leading-snug mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={activeModal === 'create' ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="modal-role" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Peran Pengguna</label>
                                <select
                                    id="modal-role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                                >
                                    <option value="TRANSLATOR">Penerjemah Tersumpah</option>
                                    <option value="ADMIN">Pengurus IPPTI (Admin)</option>
                                    <option value="SUPERADMIN">Pengurus IPPTI (Super Admin)</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="modal-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                                <input
                                    id="modal-name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Zaki Syah Iqbal, M.Hum."
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="modal-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat Email</label>
                                <input
                                    id="modal-email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="penerjemah@example.com"
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            {formData.role === 'TRANSLATOR' && (
                                <div>
                                    <label htmlFor="modal-sk" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor Anggota IPPTI</label>
                                    <input
                                        id="modal-sk"
                                        type="text"
                                        required={formData.role === 'TRANSLATOR'}
                                        value={formData.skNumber}
                                        onChange={(e) => setFormData({ ...formData, skNumber: e.target.value })}
                                        placeholder="IPPTI-2025-XXXX"
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="modal-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {activeModal === 'create' ? 'Password Akses' : 'Ganti Password (Kosongkan jika tidak diubah)'}
                                </label>
                                <div className="relative">
                                    <input
                                        id="modal-password"
                                        type={showPassword ? "text" : "password"}
                                        required={activeModal === 'create'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={activeModal === 'create' ? "••••••••" : "Hanya jika ingin diubah"}
                                        className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-5 py-2 border border-slate-250 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer text-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{activeModal === 'create' ? 'Simpan Pengguna' : 'Simpan Perubahan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {activeModal === 'delete' && selectedTranslator && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 border border-slate-100 text-center relative">
                        <button
                            onClick={() => setActiveModal(null)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                            <Trash2 className="w-5 h-5" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Akun Pengguna?</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                            Apakah Anda yakin ingin menghapus akun <strong className="text-slate-800 font-bold">{selectedTranslator.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </p>

                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold leading-snug mb-4 text-justify">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer text-slate-700"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                disabled={isPending}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>Hapus Akun</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
