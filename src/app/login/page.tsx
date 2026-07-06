'use client'

import { useState, useTransition } from 'react'
import { loginTranslator } from '@/actions/authActions'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const res = await loginTranslator(formData)
            if (res.success) {
                router.push('/admin')
                router.refresh()
            } else {
                setError(res.error || 'Email atau password salah.')
            }
        })
    }

    return (
        <div className="min-h-screen bg-slate-955 bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Blurs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
                <div className="flex justify-center items-center gap-3">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-10 w-auto rounded bg-white p-0.5 object-contain shadow-md" />
                    <span className="text-2xl font-bold text-white tracking-tight">DocVerify</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Masuk ke Akun Anda
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Atau{' '}
                    <Link href="/register" className="font-semibold text-emerald-400 hover:text-emerald-350 hover:underline transition-all duration-200">
                        daftar profil penerjemah baru
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
                <div className="bg-slate-900/80 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-800/80 sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-455 text-rose-400 p-3.5 rounded-xl text-sm text-center font-medium leading-snug">
                                {error}
                            </div>
                        )}

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
                                    className="appearance-none block w-full px-3.5 py-3 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
                                    placeholder="penerjemah@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full pl-3.5 pr-10 py-3 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
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
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Masuk</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
