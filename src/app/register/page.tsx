'use client'

import { useState, useTransition } from 'react'
import { registerTranslator, findTranslatorByMemberNo } from '@/actions/authActions'
import { Loader2, Eye, EyeOff, Search, CheckCircle2, Info } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Form fields state
    const [skNumber, setSkNumber] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [isSearchingMember, setIsSearchingMember] = useState(false)
    const [isMemberFound, setIsMemberFound] = useState(false)

    const handleSearchMember = async () => {
        if (!skNumber.trim()) {
            setError('Silakan masukkan Nomor Anggota terlebih dahulu.')
            return
        }
        setIsSearchingMember(true)
        setError(null)
        setSuccessMsg(null)
        try {
            const res = await findTranslatorByMemberNo(skNumber.trim())
            if (res.success && res.translator) {
                setName(res.translator.name)
                setEmail(res.translator.email || '')
                setIsMemberFound(true)
                setSuccessMsg(`Data Terintegrasi! Profil "${res.translator.name}" berhasil dimuat otomatis. Silakan lengkapi email & password Anda.`);
            } else {
                setError(res.error || 'Nomor Anggota tidak ditemukan dalam database pra-impor.')
                setIsMemberFound(false)
            }
        } catch (err: any) {
            setError('Gagal memverifikasi nomor anggota.')
            setIsMemberFound(false)
        } finally {
            setIsSearchingMember(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setSuccessMsg(null)

        if (!name.trim()) {
            setError('Nama lengkap tidak boleh kosong.')
            return
        }

        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak sama.')
            return
        }

        startTransition(async () => {
            const res = await registerTranslator(formData)
            if (res.success) {
                router.push('/admin')
                router.refresh()
            } else {
                setError(res.error || 'Pendaftaran gagal dilakukan.')
            }
        })
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Blurs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
                <div className="flex justify-center items-center gap-3">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-10 w-auto rounded bg-white p-0.5 object-contain shadow-md" />
                    <span className="text-2xl font-bold text-white tracking-tight">DocVerify</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Daftar Akun Penerjemah
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Atau{' '}
                    <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-350 hover:underline transition-all duration-200">
                        masuk ke profil Anda yang sudah ada
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
                <div className="bg-slate-900/80 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-800/80 sm:px-10">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs text-center font-semibold leading-relaxed">
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-3.5 rounded-xl text-xs text-center font-semibold leading-relaxed flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="skNumber" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Nomor Anggota IPPTI
                            </label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    id="skNumber"
                                    name="skNumber"
                                    type="text"
                                    required
                                    value={skNumber}
                                    onChange={(e) => setSkNumber(e.target.value)}
                                    className="appearance-none block flex-1 px-3.5 py-2.5 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-650 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
                                    placeholder="Contoh: 25004"
                                />
                                <button
                                    type="button"
                                    onClick={handleSearchMember}
                                    disabled={isSearchingMember}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-750 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {isSearchingMember ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Search className="w-3.5 h-3.5" />
                                    )}
                                    <span>Cek</span>
                                </button>
                            </div>
                            <p className="mt-1.5 text-[10px] text-slate-500 flex items-center gap-1">
                                <Info className="w-3 h-3 text-slate-500" />
                                <span>Masukkan nomor anggota untuk memuat data profil otomatis.</span>
                            </p>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Nama Lengkap (Penerjemah Tersumpah)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    readOnly={isMemberFound}
                                    className={`appearance-none block w-full px-3.5 py-2.5 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-650 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200 ${isMemberFound ? 'opacity-70 cursor-not-allowed bg-slate-900 border-emerald-500/30' : ''}`}
                                    placeholder="Nama Lengkap & Gelar Akademis"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Alamat Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3.5 py-2.5 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-655 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
                                    placeholder="penerjemah@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Password Baru
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none block w-full pl-3.5 pr-10 py-2.5 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-650 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer transition-colors duration-200"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Konfirmasi Password Baru
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="appearance-none block w-full pl-3.5 pr-10 py-2.5 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-650 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer transition-colors duration-200"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{isMemberFound ? 'Klaim & Daftar Akun' : 'Daftar Akun Baru'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
