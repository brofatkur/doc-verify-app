'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/actions/authActions'
import { Loader2, Save, User, Globe, FileText, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserProfile {
    id: string
    name: string
    email: string
    skNumber: string
    role: string
    bio: string | null
    languageServices: string | null
    profilePicture: string | null
}

export default function ProfileForm({ user }: { user: UserProfile }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Local preview for profile picture upload
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.profilePicture)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const res = await updateProfile(formData)
            if (res.success) {
                setSuccess('Profil Anda berhasil diperbarui!')
                router.refresh()
            } else {
                setError(res.error || 'Gagal memperbarui profil.')
            }
        })
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {success && (
                    <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-xl text-xs font-bold leading-snug">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-bold leading-snug">
                        {error}
                    </div>
                )}

                {/* Profile Picture Uploader */}
                <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-100 pb-6">
                    <div className="relative w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner overflow-hidden flex-shrink-0">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Profile Photo" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-slate-400" />
                        )}
                    </div>
                    
                    <div className="space-y-2 text-center sm:text-left">
                        <label htmlFor="profilePicture" className="inline-flex items-center justify-center px-4 py-2 border border-slate-250 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer shadow-sm">
                            Pilih Foto Profil
                        </label>
                        <input
                            type="file"
                            id="profilePicture"
                            name="profilePicture"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p className="text-[10px] text-slate-400">Mendukung format PNG, JPG, atau WEBP (Maksimal 2MB).</p>
                    </div>
                </div>

                {/* Registry Information (Read-only for Security) */}
                <div className="space-y-4 bg-slate-50/60 p-4.5 rounded-2xl border border-slate-200/50">
                    <div className="flex items-start gap-2.5 text-xs text-slate-500 mb-2 leading-relaxed">
                        <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>
                            <strong className="text-slate-800 font-bold">Informasi Pendaftaran Resmi:</strong> Data di bawah ini dikelola langsung oleh Pengurus Pusat IPPTI. Hubungi administrator jika ingin melakukan perubahan.
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                disabled
                                value={user.name}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat Email</label>
                            <input
                                type="text"
                                disabled
                                value={user.email}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Anggota IPPTI / SK</label>
                            <input
                                type="text"
                                disabled
                                value={user.skNumber}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 text-sm font-mono cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Custom Editable Fields */}
                <div className="space-y-5">
                    <div>
                        <label htmlFor="languageServices" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-emerald-600" />
                            <span>Layanan Pasangan Bahasa</span>
                        </label>
                        <input
                            type="text"
                            id="languageServices"
                            name="languageServices"
                            defaultValue={user.languageServices || ''}
                            placeholder="Contoh: Inggris - Indonesia, Belanda - Indonesia, Indonesia - Jerman"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-sm font-medium text-slate-800 placeholder-slate-400"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Sebutkan pasangan bahasa yang Anda layani, pisahkan dengan koma.</p>
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span>Biografi Singkat / Deskripsi Profil</span>
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            defaultValue={user.bio || ''}
                            placeholder="Tuliskan pengalaman penerjemahan Anda, spesialisasi dokumen hukum/teknis, atau informasi kredensial tambahan..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-sm font-medium text-slate-800 placeholder-slate-400"
                        ></textarea>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="pt-6 flex justify-end border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>Simpan Perubahan</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
