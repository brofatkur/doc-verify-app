'use client'

import { useState } from "react"
import { ShieldCheck, FileText, CheckCircle2, ShieldAlert, Globe, Info } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface Translator {
    name: string
    skNumber: string
    languageServices: string | null
    bio: string | null
    profilePicture: string | null
}

interface Document {
    documentId: string
    registrationNumber: string
    documentDate: string | Date
    documentType: string
    languagePair: string
    clientName: string
    status: string
    translator: Translator
}

function maskClientName(name: string): string {
    if (!name) return "";
    return name
        .split(" ")
        .map((word) => {
            if (word.length <= 1) return word;
            return word[0] + "*".repeat(word.length - 1);
        })
        .join(" ");
}

export default function DocumentDetailCard({ document }: { document: Document }) {
    const [lang, setLang] = useState<'id' | 'en'>('id')

    const dateFormatted = format(new Date(document.documentDate), 'dd MMMM yyyy', { locale: localeId })
    const dateFormattedEn = format(new Date(document.documentDate), 'MMMM dd, yyyy')

    return (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
            {/* Language Selector inside card */}
            <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Document Credentials
                    </span>
                </div>
                <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setLang('id')}
                        className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider transition cursor-pointer ${lang === 'id' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        INDONESIA
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider transition cursor-pointer ${lang === 'en' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        ENGLISH
                    </button>
                </div>
            </div>

            {/* Header Banner - Curated Deep Gradient */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                
                <div className="relative z-10 space-y-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md ring-4 ring-emerald-500/30">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-widest">
                            {lang === 'id' ? 'TERVERIFIKASI' : 'VERIFIED'}
                        </h1>
                        <p className="text-xs text-emerald-100 font-semibold tracking-wider uppercase mt-0.5">
                            {lang === 'id' ? 'Rekam Dokumen Resmi IPPTI' : 'IPPTI Official Document Record'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Details list */}
            <div className="p-6 sm:p-8 space-y-6 text-left">
                <div className="flex flex-col sm:flex-row gap-4 border-b border-slate-100 pb-6">
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {lang === 'id' ? 'ID Dokumen' : 'Document ID'}
                        </p>
                        <p className="text-lg font-mono font-bold text-slate-900">{document.documentId}</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {lang === 'id' ? 'No. Registrasi' : 'Registration No.'}
                        </p>
                        <p className="text-base font-bold text-slate-800 font-mono">{document.registrationNumber}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {lang === 'id' ? 'Tanggal Terjemah' : 'Translation Date'}
                        </p>
                        <p className="text-base font-semibold text-slate-800">
                            {lang === 'id' ? dateFormatted : dateFormattedEn}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {lang === 'id' ? 'Status Verifikasi' : 'Verification Status'}
                        </p>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {lang === 'id' ? document.status : 'Active / Valid'}
                            </span>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {lang === 'id' ? 'Nama di Dokumen (Disamarkan)' : 'Name on Document (Masked)'}
                        </p>
                        <p className="text-base font-mono font-bold text-slate-900 mt-1 bg-slate-50 border border-slate-200/80 p-3 rounded-xl select-none tracking-wide">
                            {maskClientName(document.clientName)}
                        </p>
                    </div>

                    <div className="sm:col-span-2 bg-slate-50 rounded-2xl p-4.5 border border-slate-200/60">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                            {lang === 'id' ? 'Pasangan Bahasa' : 'Language Pair'}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-800 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200/80 shadow-sm">{document.languagePair}</span>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {lang === 'id' ? 'Tipe Dokumen' : 'Document Type'}
                        </p>
                        <p className="text-base font-semibold text-slate-800 mt-1">{document.documentType}</p>
                    </div>

                    {/* Sworn Translator Badge Box */}
                    <div className="sm:col-span-2 border-t border-slate-100 pt-6">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            {lang === 'id' ? 'Penerjemah Tersumpah' : 'Sworn Translator'}
                        </p>
                        <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100 shadow-sm overflow-hidden">
                                    {document.translator.profilePicture ? (
                                        <img src={document.translator.profilePicture} alt={document.translator.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="w-5 h-5 text-emerald-600" />
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-base font-bold text-slate-900 truncate">{document.translator.name}</p>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                                        {lang === 'id' ? 'No. Anggota: ' : 'Member ID: '}{document.translator.skNumber}
                                    </p>
                                </div>
                            </div>
                            {document.translator.languageServices && (
                                <div className="text-xs border-t border-slate-100/85 pt-3">
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        {lang === 'id' ? 'Layanan Bahasa:' : 'Language Services:'}
                                    </span>
                                    <p className="text-slate-700 font-semibold">{document.translator.languageServices}</p>
                                </div>
                            )}
                            {document.translator.bio && (
                                <div className="text-xs border-t border-slate-100/85 pt-3">
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        {lang === 'id' ? 'Biografi:' : 'Biography:'}
                                    </span>
                                    <p className="text-slate-600 leading-relaxed italic text-justify">"{document.translator.bio}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Secure Disclaimer box */}
            <div className="bg-amber-50/40 p-6 border-t border-slate-100 border-l-4 border-l-amber-500 text-left">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed text-justify">
                        {lang === 'id' ? (
                            <span>
                                <strong className="text-slate-800 font-bold">Disclaimer Resmi:</strong> Sistem ini memverifikasi bahwa terjemahan dokumen ini telah resmi terdaftar oleh Penerjemah Tersumpah yang terasosiasi di atas. Harap pastikan fisik dokumen memiliki cap basah/segel pengaman yang sesuai untuk validitas hukum sepenuhnya.
                            </span>
                        ) : (
                            <span>
                                <strong className="text-slate-800 font-bold">Official Disclaimer:</strong> This system verifies that the translation of this document has been officially registered by the sworn translator associated above. Please ensure that the physical document bears the appropriate wet stamp or security seal for full legal validity.
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}
