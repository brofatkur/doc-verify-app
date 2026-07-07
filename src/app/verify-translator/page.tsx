'use client'

import { useState, useTransition, useEffect } from "react";
import { searchTranslatorAction } from "@/actions/authActions";
import { Award, Search, ArrowRight, Loader2, AlertCircle, Globe, User } from "lucide-react";
import Link from "next/link";

type LangType = 'id' | 'en' | 'zh' | 'ar';

const translations = {
    id: {
        title_trans: "Portal Validasi Resmi Penerjemah Tersumpah",
        hero_title_trans: "Temukan Penerjemah Tersumpah Resmi.",
        hero_desc_trans: "Cari dan validasi sertifikasi resmi serta keanggotaan penerjemah tersumpah Indonesia.",
        tab_search_trans: "Cari Penerjemah",
        label_trans: "Nama, Nomor Anggota, atau No SK Kemenkumham",
        placeholder_trans: "Cari nama penerjemah, bahasa, atau nomor anggota...",
        desc_trans: "Cari penerjemah tersumpah terdaftar berdasarkan Nama, Nomor SK Kemenkumham, Nomor Anggota, atau Arah Bahasa.",
        not_found_trans: "Penerjemah tidak ditemukan.",
        nav_verify_doc: "Verifikasi Dokumen",
        footer: "DocVerify IPPTI. Keamanan Terjemahan Tersumpah Resmi.",
        results_header: "Hasil Pencarian:"
    },
    en: {
        title_trans: "Official Sworn Translator Validation Portal",
        hero_title_trans: "Find Official Sworn Translators.",
        hero_desc_trans: "Search and validate official certification and membership of Indonesian sworn translators.",
        tab_search_trans: "Search Translator",
        label_trans: "Name, Member ID, or Kemenkumham Decree Number",
        placeholder_trans: "Search translator's name, language, or member ID...",
        desc_trans: "Search registered sworn translators by Name, Decree Number, Member ID, or Language Pairing.",
        not_found_trans: "Translator not found.",
        nav_verify_doc: "Verify Document",
        footer: "DocVerify IPPTI. Official Sworn Translation Security.",
        results_header: "Search Results:"
    },
    zh: {
        title_trans: "官方宣誓翻译员验证门户",
        hero_title_trans: "查找官方宣誓翻译员。",
        hero_desc_trans: "搜索并验证印尼宣誓翻译员的官方认证和成员身份。",
        tab_search_trans: "搜索翻译员",
        label_trans: "姓名、成员 ID 或司法与人权部法令编号",
        placeholder_trans: "搜索翻译员姓名、语言或成员 ID...",
        desc_trans: "按姓名、法令编号、成员 ID 或语言对搜索已注册的宣誓翻译员。",
        not_found_trans: "未找到翻译员。",
        nav_verify_doc: "验证文件",
        footer: "DocVerify IPPTI. 官方宣誓翻译安全。",
        results_header: "搜索结果:"
    },
    ar: {
        title_trans: "البوابة الرسمية للتحقق من المترجمين المحلفين",
        hero_title_trans: "البحث عن المترجمين المحلفين الرسميين.",
        hero_desc_trans: "ابحث وتحقق من الشهادة الرسمية وعضوية المترجمين المحلفين الإندونيسيين.",
        tab_search_trans: "البحث عن مترجم",
        label_trans: "الاسم، رقم العضوية، أو رقم مرسوم وزارة القانون",
        placeholder_trans: "البحث عن اسم المترجم، اللغة، أو رقم العضوية...",
        desc_trans: "ابحث عن المترجمين المحلفين المسجلين حسب الاسم، رقم المرسوم، رقم العضوية، أو زوج اللغات.",
        not_found_trans: "المترجم غير موجود.",
        nav_verify_doc: "التحقق من المستندات",
        footer: "DocVerify IPPTI. أمان الترجمة المحلفة الرسمية.",
        results_header: "نتائج البحث:"
    }
};

export default function VerifyTranslatorPage() {
    const [lang, setLang] = useState<LangType>('id');
    const [translatorQuery, setTranslatorQuery] = useState('');
    const [translatorResults, setTranslatorResults] = useState<any[]>([]);
    const [isTranslatorPending, startTranslatorTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedLang = localStorage.getItem('docverify_lang') as LangType;
        if (savedLang && ['id', 'en', 'zh', 'ar'].includes(savedLang)) {
            setLang(savedLang);
        }
    }, []);

    const changeLanguage = (newLang: LangType) => {
        setLang(newLang);
        localStorage.setItem('docverify_lang', newLang);
        window.dispatchEvent(new Event('docverify_lang_changed'));
    };

    const handleTranslatorSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setTranslatorResults([]);
        if (!translatorQuery.trim()) return;

        startTranslatorTransition(async () => {
            const res = await searchTranslatorAction(translatorQuery);
            if (res.success && res.translators) {
                if (res.translators.length === 0) {
                    setError(translations[lang].not_found_trans);
                } else {
                    setTranslatorResults(res.translators);
                }
            } else {
                setError(res.error || translations[lang].not_found_trans);
            }
        });
    };

    const t = translations[lang];
    const isRtl = lang === 'ar';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background blur blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full filter blur-[120px] animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-blue-500/5 rounded-full filter blur-[120px] animate-blob animation-delay-2000"></div>

            {/* Header */}
            <header className="py-6 px-6 md:px-12 border-b border-slate-900 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between z-10">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-9 w-auto rounded bg-white p-0.5 object-contain shadow-md" />
                    <span className="text-xl font-bold tracking-tight text-white">DocVerify</span>
                </Link>
                
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-semibold text-emerald-400 hover:text-emerald-350 hover:underline transition-all duration-200">
                        {t.nav_verify_doc}
                    </Link>
                    
                    {/* Language Switcher */}
                    <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 dir-ltr" dir="ltr">
                        {(['id', 'en', 'zh', 'ar'] as LangType[]).map((l) => (
                            <button
                                key={l}
                                onClick={() => changeLanguage(l)}
                                className={`px-2 py-1 rounded text-[10px] font-extrabold tracking-wider transition cursor-pointer ${lang === l ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-255'}`}
                            >
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 max-w-4xl mx-auto w-full">
                <div className="text-center space-y-6 mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {t.title_trans}
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                        {lang === 'id' ? (
                            <>
                                Temukan Penerjemah <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                                    Tersumpah Resmi.
                                </span>
                            </>
                        ) : lang === 'en' ? (
                            <>
                                Find Official <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                                    Sworn Translators.
                                </span>
                            </>
                        ) : lang === 'zh' ? (
                            <>
                                查找官方 <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                                    宣誓翻译员。
                                </span>
                            </>
                        ) : (
                            <>
                                البحث عن المترجمين <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                                    المحلفين الرسميين.
                                </span>
                            </>
                        )}
                    </h1>

                    <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                        {t.hero_desc_trans}
                    </p>
                </div>

                {/* Tab Container */}
                <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-8">
                    <div className="flex border-b border-slate-800 pb-3.5 mb-6">
                        <div className="flex-1 flex items-center justify-center gap-2 pb-3 text-xs font-bold border-b-2 border-emerald-400 text-emerald-400">
                            <Award className="w-4 h-4" />
                            <span>{t.tab_search_trans}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-sm font-medium mb-5">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        <form onSubmit={handleTranslatorSearchSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="translator-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-left">
                                    {t.label_trans}
                                </label>
                                <div className="relative">
                                    <input
                                        id="translator-input"
                                        type="text"
                                        required
                                        value={translatorQuery}
                                        onChange={(e) => setTranslatorQuery(e.target.value)}
                                        placeholder={t.placeholder_trans}
                                        className="w-full pl-4 pr-12 py-3.5 border border-slate-800 rounded-xl bg-slate-950/60 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold transition-all duration-200"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isTranslatorPending}
                                        className={`absolute ${isRtl ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md`}
                                    >
                                        {isTranslatorPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed text-left">
                                {t.desc_trans}
                            </p>
                        </form>

                        {/* Translator Results */}
                        {translatorResults.length > 0 && (
                            <div className="space-y-3 pt-2 text-left">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.results_header}</p>
                                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                    {translatorResults.map((t) => (
                                        <Link
                                            key={t.id}
                                            href={`/verify-translator/${t.id}`}
                                            className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-emerald-500/60 hover:bg-slate-900/60 transition group cursor-pointer"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold overflow-hidden flex-shrink-0">
                                                {t.profilePicture ? (
                                                    <img src={t.profilePicture} alt={t.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate">{t.name}</p>
                                                <p className="text-[10px] text-slate-450 truncate font-mono">No. Anggota: {t.skNumber}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 px-6 border-t border-slate-900 text-center text-xs text-slate-500 z-10 bg-slate-950/40">
                &copy; {new Date().getFullYear()} {t.footer}
            </footer>
        </div>
    );
}
