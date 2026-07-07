'use client'

import { useState, useEffect } from "react"
import { ShieldCheck, FileText, CheckCircle2, ShieldAlert } from "lucide-react"
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

type LangType = 'id' | 'en' | 'zh' | 'ar';

const translations = {
    id: {
        credentials: "Document Credentials",
        verified: "TERVERIFIKASI",
        record: "Rekam Dokumen Resmi IPPTI",
        doc_id: "ID Dokumen",
        reg_no: "No. Registrasi",
        trans_date: "Tanggal Terjemah",
        status: "Status Verifikasi",
        masked_name: "Nama di Dokumen (Disamarkan)",
        lang_pair: "Pasangan Bahasa",
        doc_type: "Tipe Dokumen",
        translator: "Nama Penerjemah Tersumpah",
        member_id: "No. Anggota: ",
        services: "Layanan Bahasa:",
        bio: "Biografi:",
        disclaimer_title: "Disclaimer Resmi:",
        disclaimer_text: "Sistem ini memverifikasi bahwa terjemahan dokumen ini telah resmi terdaftar oleh Penerjemah Tersumpah yang terasosiasi di atas. Harap pastikan fisik dokumen memiliki cap basah/segel pengaman yang sesuai untuk validitas hukum sepenuhnya."
    },
    en: {
        credentials: "Document Credentials",
        verified: "VERIFIED",
        record: "IPPTI Official Document Record",
        doc_id: "Document ID",
        reg_no: "Registration No.",
        trans_date: "Translation Date",
        status: "Verification Status",
        masked_name: "Name on Document (Masked)",
        lang_pair: "Language Pair",
        doc_type: "Document Type",
        translator: "Name of Sworn Translator",
        member_id: "Member ID: ",
        services: "Language Services:",
        bio: "Biography:",
        disclaimer_title: "Official Disclaimer:",
        disclaimer_text: "This system verifies that the translation of this document has been officially registered by the sworn translator associated above. Please ensure that the physical document bears the appropriate wet stamp or security seal for full legal validity."
    },
    zh: {
        credentials: "文件凭证",
        verified: "已验证",
        record: "IPPTI 官方文件记录",
        doc_id: "文件 ID",
        reg_no: "注册号",
        trans_date: "翻译日期",
        status: "验证状态",
        masked_name: "文件姓名（已遮蔽）",
        lang_pair: "语言对",
        doc_type: "文件类型",
        translator: "宣誓翻译员姓名",
        member_id: "成员 ID: ",
        services: "语言服务:",
        bio: "个人简介:",
        disclaimer_title: "官方免责声明:",
        disclaimer_text: "此系统验证此文件的翻译已由上述关联的宣誓翻译员正式注册。请确保纸质文件上有相应的湿盖章或安全封条，以具备完全的法律效力。"
    },
    ar: {
        credentials: "وثائق المستند",
        verified: "تم التحقق",
        record: "سجل المستندات الرسمي لـ IPPTI",
        doc_id: "معرف المستند",
        reg_no: "رقم التسجيل",
        trans_date: "تاريخ الترجمة",
        status: "حالة التحقق",
        masked_name: "الاسم على المستند (مخفي)",
        lang_pair: "زوج اللغات",
        doc_type: "نوع المستند",
        translator: "اسم المترجم المحلف",
        member_id: "رقم العضوية: ",
        services: "خدمات اللغة:",
        bio: "السيرة الذاتية:",
        disclaimer_title: "إخلاء مسؤولية رسمي:",
        disclaimer_text: "يتحقق هذا النظام من أن ترجمة هذا المستند قد تم تسجيلها رسمياً بواسطة المترجم المحلف المرتبط أعلاه. يرجى التأكد من أن المستند المادي يحمل الختم المائي أو الختم الأمني المناسب للصلاحية القانونية الكاملة."
    }
};

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
    const [lang, setLang] = useState<LangType>('id');

    useEffect(() => {
        const savedLang = localStorage.getItem('docverify_lang') as LangType;
        if (savedLang && ['id', 'en', 'zh', 'ar'].includes(savedLang)) {
            setLang(savedLang);
        }

        const handleLangChange = () => {
            const currentSaved = localStorage.getItem('docverify_lang') as LangType;
            if (currentSaved) {
                setLang(currentSaved);
            }
        };

        window.addEventListener('docverify_lang_changed', handleLangChange);
        return () => {
            window.removeEventListener('docverify_lang_changed', handleLangChange);
        };
    }, []);

    const changeLanguage = (newL: LangType) => {
        setLang(newL);
        localStorage.setItem('docverify_lang', newL);
        window.dispatchEvent(new Event('docverify_lang_changed'));
    };

    const dateFormatted = format(new Date(document.documentDate), 'dd MMMM yyyy', { locale: localeId })
    const dateFormattedEn = format(new Date(document.documentDate), 'MMMM dd, yyyy')

    const t = translations[lang];
    const isRtl = lang === 'ar';

    return (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Language Selector inside card */}
            <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {t.credentials}
                    </span>
                </div>
                <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 dir-ltr" dir="ltr">
                    {(['id', 'en', 'zh', 'ar'] as LangType[]).map((l) => (
                        <button
                            key={l}
                            onClick={() => changeLanguage(l)}
                            className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider transition cursor-pointer ${lang === l ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {l.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Header Banner - Curated Deep Gradient */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                
                <div className="relative z-10 space-y-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md ring-4 ring-emerald-500/30 animate-pulse">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-widest">
                            {t.verified}
                        </h1>
                        <p className="text-xs text-emerald-100 font-semibold tracking-wider uppercase mt-0.5">
                            {t.record}
                        </p>
                    </div>
                </div>
            </div>

            {/* Details list */}
            <div className="p-6 sm:p-8 space-y-6 text-left">
                <div className={`border-b border-slate-100 pb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        {t.reg_no}
                    </p>
                    <p className="text-lg font-bold text-slate-900 font-mono">{document.registrationNumber}</p>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {t.trans_date}
                        </p>
                        <p className="text-base font-semibold text-slate-800">
                            {lang === 'id' ? dateFormatted : dateFormattedEn}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {t.status}
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
                            {t.masked_name}
                        </p>
                        <p className="text-base font-mono font-bold text-slate-900 mt-1 bg-slate-50 border border-slate-200/80 p-3 rounded-xl select-none tracking-wide text-center">
                            {maskClientName(document.clientName)}
                        </p>
                    </div>

                    <div className="sm:col-span-2 bg-slate-50 rounded-2xl p-4.5 border border-slate-200/60">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                            {t.lang_pair}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-800 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200/80 shadow-sm">{document.languagePair}</span>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {t.doc_type}
                        </p>
                        <p className="text-base font-semibold text-slate-800 mt-1">{document.documentType}</p>
                    </div>

                    {/* Sworn Translator Badge Box */}
                    <div className="sm:col-span-2 border-t border-slate-100 pt-6">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            {t.translator}
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
                                        {t.member_id}{document.translator.skNumber}
                                    </p>
                                </div>
                            </div>

                            {document.translator.bio && (
                                <div className="text-xs border-t border-slate-100/85 pt-3">
                                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        {t.bio}
                                    </span>
                                    <p className="text-slate-600 leading-relaxed italic">"{document.translator.bio}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Secure Disclaimer box */}
            <div className={`bg-amber-50/40 p-6 border-t border-slate-100 border-l-4 border-l-amber-500 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="flex items-start gap-3">
                    <p className="text-xs text-slate-600 leading-relaxed text-justify">
                        <strong className="text-slate-800 font-bold">{t.disclaimer_title} </strong>
                        {t.disclaimer_text}
                    </p>
                </div>
            </div>
        </div>
    )
}
