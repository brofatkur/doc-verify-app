'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { forgotPassword } from '@/actions/authActions'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setError('')

        startTransition(async () => {
            const res = await forgotPassword(email)
            if (res.success) {
                setMessage(res.message || 'Sukses')
                setEmail('')
            } else {
                setError(res.error || 'Terjadi kesalahan')
            }
        })
    }

    return (
        <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-pulse"></div>
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
                <div className="flex justify-center items-center gap-3">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-10 w-auto rounded bg-white p-0.5 object-contain shadow-md" />
                    <span className="text-2xl font-bold text-white tracking-tight">DocVerify</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Lupa Password?
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Masukkan email Anda untuk menerima tautan pemulihan kata sandi.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
                <div className="bg-slate-900/80 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-800/80 sm:px-10">
                    {message ? (
                        <div className="space-y-6 text-center">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <p className="text-sm text-slate-350 leading-relaxed">
                                {message}
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-350 hover:underline transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Kembali ke Halaman Masuk</span>
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-sm text-center font-medium leading-snug flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Alamat Email Terdaftar
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3.5 py-3 border border-slate-800 rounded-xl bg-slate-950/60 placeholder-slate-650 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
                                        placeholder="penerjemah@example.com"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Mail className="w-4 h-4" />
                                    )}
                                    <span>Kirim Tautan Reset</span>
                                </button>

                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-450 hover:text-slate-200 transition"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        <span>Batal dan Kembali</span>
                                    </Link>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
