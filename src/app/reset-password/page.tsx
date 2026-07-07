'use client'

import { useState, useTransition, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { resetPassword } from '@/actions/authActions'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') || ''

    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!token) {
            setError('Token reset tidak valid atau tidak ditemukan di tautan URL Anda.')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setError('')

        if (password !== passwordConfirm) {
            setError('Konfirmasi password tidak cocok.')
            return
        }

        startTransition(async () => {
            const res = await resetPassword(token, passwordConfirm)
            if (res.success) {
                setMessage(res.message || 'Sukses')
                setPassword('')
                setPasswordConfirm('')
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            } else {
                setError(res.error || 'Terjadi kesalahan')
            }
        })
    }

    return (
        <div className="bg-slate-900/80 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-800/80 sm:px-10">
            {message ? (
                <div className="space-y-6 text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 animate-bounce">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-350 leading-relaxed">
                        {message}
                    </p>
                    <p className="text-xs text-slate-500"> Mengalihkan Anda ke halaman login... </p>
                </div>
            ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-sm text-center font-medium leading-snug flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Password Baru
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full pl-3.5 pr-10 py-3 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-650 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer transition-colors duration-200"
                            >
                                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="passwordConfirm" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Konfirmasi Password Baru
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="passwordConfirm"
                                type={showPasswordConfirm ? 'text' : 'password'}
                                required
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                className="appearance-none block w-full pl-3.5 pr-10 py-3 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-650 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer transition-colors duration-200"
                            >
                                {showPasswordConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isPending || !token}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Lock className="w-4 h-4" />
                            )}
                            <span>Perbarui Password</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-pulse"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
                <div className="flex justify-center items-center gap-3">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-10 w-auto rounded bg-white p-0.5 object-contain shadow-md" />
                    <span className="text-2xl font-bold text-white tracking-tight">DocVerify</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Setel Ulang Password
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Masukkan sandi baru Anda di bawah ini untuk memulihkan akses akun.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
                <Suspense fallback={
                    <div className="bg-slate-900/80 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-800/80 sm:px-10 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
                        <p className="text-sm text-slate-450 mt-4">Memuat parameter verifikasi...</p>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
