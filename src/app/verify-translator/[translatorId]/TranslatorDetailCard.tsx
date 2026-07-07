'use client'

import { useState, useEffect } from "react"
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

type LangType = 'id' | 'en' | 'zh' | 'ar';

const translations = {
    id: {
        card_title: "IPPTI Official Registry Card",
        verify_title: "Hasil Verifikasi Penerjemah Tersumpah",
        verify_badge: "Aktif & Terdaftar",
        member_label: "No. Anggota",
        lang_services: "Arah Bahasa",
        validity: "Masa Aktif Registrasi",
        sk_desc: "Keterangan SK Lengkap",
        statement: (name: string, noSk: string, dateSk: string) => `Benar bahwa penerjemah tersumpah atas nama ${name} terdaftar resmi sebagai anggota IPPTI dan merupakan penerjemah tersumpah di bawah Kementerian Hukum dan HAM sesuai SK nomor ${noSk} yang ditetapkan pada tanggal ${dateSk}.`,
        footer_kemenkumham: "Kementerian Hukum dan Hak Asasi Manusia Republik Indonesia",
        official_photo: "Foto Resmi"
    },
    en: {
        card_title: "IPPTI Official Registry Card",
        verify_title: "Sworn Translator Verification Result",
        verify_badge: "Active & Registered",
        member_label: "Member ID",
        lang_services: "Language Pairing",
        validity: "Registration Validity",
        sk_desc: "Decree Full Statement",
        statement: (name: string, noSk: string, dateSk: string) => `It is verified that the sworn translator named ${name} is officially registered as a member of IPPTI and is a sworn translator certified under the Ministry of Law and Human Rights of the Republic of Indonesia pursuant to decree number ${noSk} issued on ${dateSk}.`,
        footer_kemenkumham: "Ministry of Law and Human Rights of the Republic of Indonesia",
        official_photo: "Official Photo"
    },
    zh: {
        card_title: "IPPTI 官方注册卡",
        verify_title: "宣誓翻译员验证结果",
        verify_badge: "活动与已注册",
        member_label: "成员编号",
        lang_services: "翻译语言对",
        validity: "注册有效期",
        sk_desc: "法令完整声明",
        statement: (name: string, noSk: string, dateSk: string) => `确认以下名下的宣誓翻译员 ${name} 已正式注册为 IPPTI 成员，并根据 ${dateSk} 颁布的第 ${noSk} 号法令获得印尼共和国司法与人权部认证。`,
        footer_kemenkumham: "印度尼西亚共和国司法与人权部",
        official_photo: "官方照片"
    },
    ar: {
        card_title: "بطاقة التسجيل الرسمية لـ IPPTI",
        verify_title: "نتيجة التحقق من المترجم المحلف",
        verify_badge: "نشط ومسجل",
        member_label: "رقم العضوية",
        lang_services: "زوج اللغات للترجمة",
        validity: "صلاحية التسجيل",
        sk_desc: "البيان الكامل للمرسوم",
        statement: (name: string, noSk: string, dateSk: string) => `يؤكد أن المترجم المحلف باسم ${name} مسجل رسمياً كعضو في IPPTI ومترجم محلف معتمد من قبل وزارة القانون وحقوق الإنسان في جمهورية إندونيسيا بموجب المرسوم رقم ${noSk} الصادر في ${dateSk}.`,
        footer_kemenkumham: "وزارة القانون وحقوق الإنسان في جمهورية إندونيسيا",
        official_photo: "الصورة الرسمية"
    }
};

export default function TranslatorDetailCard({ translator }: { translator: TranslatorRecord }) {
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

    // Parse the SK details from bio or use default format
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
    const noSk = translator.noSkKemenkum || skDetails
    const dateSk = translator.tglSk || '5 Oktober 2022'

    const t = translations[lang];
    const isRtl = lang === 'ar';

    return (
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header / Language Selector */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {t.card_title}
                    </span>
                </div>
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 dir-ltr" dir="ltr">
                    {(['id', 'en', 'zh', 'ar'] as LangType[]).map((l) => (
                        <button
                            key={l}
                            onClick={() => changeLanguage(l)}
                            className={`px-2.5 py-1 rounded text-[10px] font-extrabold tracking-wider transition cursor-pointer ${lang === l ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-205'}`}
                        >
                            {l.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 items-stretch">
                {/* Left Side: Statement (8 Cols) */}
                <div className="md:col-span-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 ${isRtl ? 'text-right flex-row-reverse' : 'text-left'}`}>
                            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white leading-tight">
                                    {t.verify_title}
                                </h2>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5 animate-pulse">
                                    {t.verify_badge}
                                </p>
                            </div>
                        </div>

                        {/* Green decorative bar */}
                        <div className="h-1.5 bg-emerald-600 rounded-full w-full"></div>

                        {/* Member Details Header */}
                        <div className={`space-y-1 pt-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5" />
                                <span>{t.member_label}</span>
                            </span>
                            <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                {memberNo} <span className="text-slate-500 mx-2">—</span> {name}
                            </p>
                        </div>

                        {/* Statement Body */}
                        <div className={`text-slate-350 text-sm font-medium leading-relaxed pt-2 space-y-3 ${isRtl ? 'text-right font-semibold' : 'text-left'}`}>
                            <p>
                                {t.statement(
                                    `<strong class="text-white font-bold">${name}</strong>`,
                                    `<strong class="text-white font-bold">${noSk}</strong>`,
                                    `<strong class="text-white font-bold">${dateSk}</strong>`
                                ).split(/(<strong.*?>.*?<\/strong>)/).map((part, idx) => {
                                    if (part.startsWith('<strong')) {
                                        const cleanText = part.replace(/<strong.*?>/, '').replace('</strong>', '');
                                        return <strong key={idx} className="text-white font-bold">{cleanText}</strong>;
                                    }
                                    return part;
                                })}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl text-xs mt-3">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.lang_services}</p>
                                    <p className="text-white font-semibold mt-1">{languages}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.validity}</p>
                                    <p className="text-emerald-400 font-bold mt-1">
                                        {lang === 'ar' && translator.masaAktif === 'Seumur Hidup' ? 'مدى الحياة' : (translator.masaAktif || 'Seumur Hidup')}
                                    </p>
                                </div>
                                {translator.skLengkap && (
                                    <div className="col-span-2 border-t border-slate-850 pt-2 mt-1">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.sk_desc}</p>
                                        <p className="text-slate-300 mt-1 font-medium italic">{translator.skLengkap}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Kementerian Footer */}
                    <div className="border-t border-slate-800/80 pt-4 text-[10px] font-bold text-slate-500 font-mono tracking-wider">
                        {t.footer_kemenkumham} &copy; Copyright {new Date().getFullYear()}
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
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{t.official_photo}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
