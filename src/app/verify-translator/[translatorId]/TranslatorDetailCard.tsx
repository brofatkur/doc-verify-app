'use client'

import { useState } from "react"
import { CheckCircle2, Globe, ShieldCheck, User } from "lucide-react"

interface TranslatorRecord {
    id: string
    name: string
    email: string
    skNumber: string
    role: string
    languageServices: string | null
    bio: string | null
    profilePicture: string | null
    noSkKemenkum?: string | null
    tglSk?: string | null
    masaAktif?: string | null
    skLengkap?: string | null
}

export default function TranslatorDetailCard({ translator }: { translator: TranslatorRecord }) {
    const [lang, setLang] = useState<'id' | 'en'>('id')

    // Parse the SK details from bio or use default format
    // For Muhammad Arifin: "AHU-55 AH.03.07.2022 Tanggal 5 Oktober 2022"
    let skDetails = translator.bio || ''
    if (skDetails.startsWith('Pernyataan verifikasi Kemenkumham: ')) {
        skDetails = skDetails.replace('Pernyataan verifikasi Kemenkumham: ', '')
    }
    if (!skDetails || skDetails.trim() === '') {
        skDetails = `AHU-${translator.skNumber} Tanggal 5 Oktober 2022`
    }

    const name = translator.name
    const memberNo = translator.skNumber
    const languages = translator.languageServices || 'Indonesia - Inggris, Inggris - Indonesia'

    return (
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10">
            {/* Header / Language Selector */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                        IPPTI Official Registry Card
                    </span>
                </div>
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setLang('id')}
                        className={`px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider transition cursor-pointer ${lang === 'id' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        INDONESIA
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        className={`px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider transition cursor-pointer ${lang === 'en' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        ENGLISH
                    </button>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 items-stretch">
                {/* Left Side: Statement (8 Cols) */}
                <div className="md:col-span-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white leading-tight">
                                    {lang === 'id' ? 'Hasil Verifikasi Penerjemah Tersumpah' : 'Sworn Translator Verification Result'}
                                </h2>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
                                    {lang === 'id' ? 'Aktif & Terdaftar' : 'Active & Registered'}
                                </p>
                            </div>
                        </div>

                        {/* Green decorative bar */}
                        <div className="h-1.5 bg-emerald-600 rounded-full w-full"></div>

                        {/* Member Details Header */}
                        <div className="space-y-1 pt-2 text-left">
                            <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5" />
                                <span>No. Anggota</span>
                            </span>
                            <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                {memberNo} <span className="text-slate-500 mx-2">—</span> {name}
                            </p>
                        </div>

                        {/* Statement Body */}
                        <div className="text-slate-300 text-sm font-medium leading-relaxed pt-2 space-y-3 text-left">
                            {lang === 'id' ? (
                                <>
                                    <p>
                                        Benar bahwa penerjemah tersumpah atas nama <strong className="text-white font-bold">{name}</strong> terdaftar resmi sebagai anggota IPPTI dan merupakan penerjemah tersumpah di bawah <strong className="text-white font-bold">Kementerian Hukum dan HAM</strong> sesuai SK nomor <strong className="text-white font-bold">{translator.noSkKemenkum || skDetails}</strong> yang ditetapkan pada tanggal <strong className="text-white font-bold">{translator.tglSk || '5 Oktober 2022'}</strong>.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 border border-slate-800 rounded-2xl text-xs mt-3">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Arah Bahasa</p>
                                            <p className="text-white font-semibold mt-1">{languages}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Masa Aktif Registrasi</p>
                                            <p className="text-emerald-400 font-bold mt-1">{translator.masaAktif || 'Seumur Hidup'}</p>
                                        </div>
                                        {translator.skLengkap && (
                                            <div className="col-span-2 border-t border-slate-850 pt-2 mt-1">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Keterangan SK Lengkap</p>
                                                <p className="text-slate-300 mt-1 font-medium italic">{translator.skLengkap}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p>
                                        It is verified that the sworn translator named <strong className="text-white font-bold">{name}</strong> is officially registered as a member of IPPTI and is a sworn translator certified under the <strong className="text-white font-bold">Ministry of Law and Human Rights</strong> of the Republic of Indonesia pursuant to decree number <strong className="text-white font-bold">{translator.noSkKemenkum || skDetails}</strong> issued on <strong className="text-white font-bold">{translator.tglSk || 'October 5, 2022'}</strong>.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 border border-slate-800 rounded-2xl text-xs mt-3">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Language Pairing</p>
                                            <p className="text-white font-semibold mt-1">{languages}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Registration Validity</p>
                                            <p className="text-emerald-400 font-bold mt-1">{translator.masaAktif === 'Seumur Hidup' ? 'Lifetime' : (translator.masaAktif || 'Lifetime')}</p>
                                        </div>
                                        {translator.skLengkap && (
                                            <div className="col-span-2 border-t border-slate-850 pt-2 mt-1">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Decree Full Statement</p>
                                                <p className="text-slate-300 mt-1 font-medium italic">{translator.skLengkap}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Kementerian Footer */}
                    <div className="border-t border-slate-800/80 pt-4 text-[10px] font-bold text-slate-500 font-mono tracking-wider">
                        {lang === 'id' ? (
                            <span>Kementerian Hukum dan Hak Asasi Manusia Republik Indonesia &copy; Copyright {new Date().getFullYear()}</span>
                        ) : (
                            <span>Ministry of Law and Human Rights of the Republic of Indonesia &copy; Copyright {new Date().getFullYear()}</span>
                        )}
                    </div>
                </div>

                {/* Right Side: Photo Frame (4 Cols) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[210px] aspect-[3/4] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-1 bg-gradient-to-br from-slate-900 to-slate-950">
                        {translator.profilePicture ? (
                            <img
                                src={translator.profilePicture}
                                alt={translator.name}
                                className="w-full h-full object-cover rounded-xl grayscale-[15%] hover:grayscale-0 transition-all duration-350"
                            />
                        ) : (
                            <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center border border-slate-800/50">
                                <User className="w-16 h-16 text-slate-650" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Foto Resmi</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
