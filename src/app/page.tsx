'use client'

import { useState, useTransition, useRef, useEffect } from "react";
import { searchDocument } from "@/actions/documentActions";
import { ShieldCheck, Search, QrCode, ArrowRight, Loader2, AlertCircle, Camera, Award, Globe, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

type LangType = 'id' | 'en' | 'zh' | 'ar';

const translations = {
    id: {
        title_doc: "Portal Validasi Resmi Dokumen",
        hero_title_doc: "Cari Nomor Registrasi",
        hero_desc_doc: "",
        tab_reg: "Nomor Registrasi",
        tab_qr: "Pindai QR",
        label_reg: "Nomor Registrasi atau 8-Karakter ID Dokumen",
        placeholder_reg: "Contoh: REG-Belanda-001 atau VFY7A8B9",
        desc_reg: "Verifikasi dokumen dengan mencari nomor registrasi yang dibubuhkan oleh penerjemah tersumpah, atau 8-karakter ID verifikasi unik.",
        upload_qr: "Ambil Foto atau Pindai QR",
        upload_qr_desc: "Mendukung jepretan kamera langsung & unggahan gambar",
        desc_qr: "Gunakan kamera perangkat Anda untuk memindai kode QR verifikasi pada dokumen fisik, atau unggah foto/tangkapan layar kode QR.",
        not_found_doc: "Dokumen tidak ditemukan.",
        nav_verify_trans: "Verifikasi Penerjemah",
        footer: "DocVerify IPPTI. Keamanan Terjemahan Tersumpah Resmi.",
        scan_loading: "Membaca Berkas...",
        scan_err_canvas: "Gagal memproses kanvas gambar.",
        scan_err_qr: "Tidak dapat menemukan kode QR yang terbaca. Coba pindai kembali dengan gambar yang lebih jelas.",
        scan_err_decode: "Kode QR ini tidak dikenali sebagai URL verifikasi DocVerify atau ID Dokumen yang valid.",
        scan_err_load: "Gagal memuat berkas gambar."
    },
    en: {
        title_doc: "Official Document Validation Portal",
        hero_title_doc: "Search a Registration Number",
        hero_desc_doc: "",
        tab_reg: "Registration Number",
        tab_qr: "Scan QR",
        label_reg: "Registration Number or 8-Character Document ID",
        placeholder_reg: "Example: REG-Dutch-001 or VFY7A8B9",
        desc_reg: "Verify document by searching registration number issued by sworn translator, or unique 8-character verification ID.",
        upload_qr: "Capture Photo or Scan QR",
        upload_qr_desc: "Supports direct camera shots & image uploads",
        desc_qr: "Use your device camera to scan the verification QR code on the physical document, or upload a photo/screenshot of the QR code.",
        not_found_doc: "Document not found.",
        nav_verify_trans: "Verify Translator",
        footer: "DocVerify IPPTI. Official Sworn Translation Security.",
        scan_loading: "Scanning File...",
        scan_err_canvas: "Failed to process image canvas.",
        scan_err_qr: "Could not find a readable QR code. Try scanning again with a clearer image.",
        scan_err_decode: "This QR code is not recognized as a valid DocVerify verification URL or Document ID.",
        scan_err_load: "Failed to load image file."
    },
    zh: {
        title_doc: "官方文件验证门户",
        hero_title_doc: "搜索注册编号",
        hero_desc_doc: "",
        tab_reg: "注册编号",
        tab_qr: "扫描二维码",
        label_reg: "注册编号或8位文件 ID",
        placeholder_reg: "例如: REG-Dutch-001 或 VFY7A8B9",
        desc_reg: "通过搜索宣誓翻译员发放的注册号或唯一的8位验证 ID 来验证文件。",
        upload_qr: "拍摄照片或扫描二维码",
        upload_qr_desc: "支持直接相机拍摄和图片上传",
        desc_qr: "使用您的设备摄像头扫描纸质文件上的验证二维码，或上传二维码的照片/屏幕截图。",
        not_found_doc: "未找到文件。",
        nav_verify_trans: "验证翻译员",
        footer: "DocVerify IPPTI. 官方宣誓翻译安全。",
        scan_loading: "正在读取文件...",
        scan_err_canvas: "处理图像画布失败。",
        scan_err_qr: "找不到可读取的二维码。请使用更清晰的图片重新扫描。",
        scan_err_decode: "此二维码未被识别为有效的 DocVerify 验证 URL 或文件 ID。",
        scan_err_load: "加载图像文件失败。"
    },
    ar: {
        title_doc: "البوابة الرسمية للتحقق من المستندات",
        hero_title_doc: "البحث عن رقم التسجيل",
        hero_desc_doc: "",
        tab_reg: "رقم التسجيل",
        tab_qr: "مسح رمز QR",
        label_reg: "رقم التسجيل أو معرف مستند من 8 أحرف",
        placeholder_reg: "مثال: REG-Dutch-001 أو VFY7A8B9",
        desc_reg: "تحقق من المستند بالبحث عن رقم التسجيل الصادر عن المترجم المحلف، أو معرف التحقق الفريد المكون dari 8 أحرف.",
        upload_qr: "التقاط صورة أو مسح رمز QR",
        upload_qr_desc: "يدعم لقطات الكاميرا المباشرة وتحميل الصور",
        desc_qr: "استخدم كاميرا جهازك لمسح رمز QR للتحقق على المستند الفعلي، أو قم بتحميل صورة/لقطة شاشة لرمز QR.",
        not_found_doc: "المستند غير موجود.",
        nav_verify_trans: "التحقق من المترجم",
        footer: "DocVerify IPPTI. أمان الترجمة المحلفة الرسمية.",
        scan_loading: "جاري فحص الملف...",
        scan_err_canvas: "فشل في معالجة كانفاس الصورة.",
        scan_err_qr: "لم يتم العثور على رمز QR صالح للقراءة. يرجى المحاولة مرة أخرى بصورة أوضح.",
        scan_err_decode: "لا يتم التعرف على رمز QR هذا كعنوان URL صالح للتحقق من DocVerify أو معرف مستند.",
        scan_err_load: "فشل في تحميل ملف الصورة."
    }
};

export default function Home() {
    const router = useRouter();
    const [lang, setLang] = useState<LangType>('id');
    const [activeTab, setActiveTab] = useState<'search' | 'scan'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [scanLoading, setScanLoading] = useState(false);
    const qrFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedLang = localStorage.getItem('docverify_lang') as LangType;
        if (savedLang && ['id', 'en', 'zh', 'ar'].includes(savedLang)) {
            setLang(savedLang);
        }
    }, []);

    const changeLanguage = (newLang: LangType) => {
        setLang(newLang);
        localStorage.setItem('docverify_lang', newLang);
        // Fire custom event to sync other open tabs/components
        window.dispatchEvent(new Event('docverify_lang_changed'));
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!searchQuery.trim()) return;

        startTransition(async () => {
            const res = await searchDocument(searchQuery);
            if (res.success && res.documentId) {
                router.push(`/verify/${res.documentId}`);
            } else {
                setError(res.error || translations[lang].not_found_doc);
            }
        });
    };

    const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setScanLoading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) {
                    setError(translations[lang].scan_err_canvas);
                    setScanLoading(false);
                    return;
                }
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);
                const imageData = context.getImageData(0, 0, image.width, image.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });

                if (code && code.data) {
                    const match = code.data.match(/\/verify\/([A-Z0-9]{8})/i);
                    if (match && match[1]) {
                        const docId = match[1];
                        router.push(`/verify/${docId}`);
                    } else {
                        const docIdClean = code.data.trim();
                        if (docIdClean.length === 8 && /^[A-Z0-9]+$/i.test(docIdClean)) {
                            router.push(`/verify/${docIdClean.toUpperCase()}`);
                        } else {
                            setError(translations[lang].scan_err_decode);
                            setScanLoading(false);
                        }
                    }
                } else {
                    setError(translations[lang].scan_err_qr);
                    setScanLoading(false);
                }
            };
            image.onerror = () => {
                setError(translations[lang].scan_err_load);
                setScanLoading(false);
            };
            image.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const t = translations[lang];
    const isRtl = lang === 'ar';

    return (
        <div className="min-h-screen bg-slate-50 text-blue-950 flex flex-col justify-between relative overflow-hidden selection:bg-blue-500/20 selection:text-blue-950" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background blur blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full filter blur-[120px] animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-indigo-500/10 rounded-full filter blur-[120px] animate-blob animation-delay-2000"></div>

            {/* Header */}
            <header className="py-6 px-6 md:px-12 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between z-10">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-9 w-auto rounded bg-white p-0.5 object-contain shadow-md" />
                    <span className="text-xl font-bold tracking-tight text-blue-950">DocVerify</span>
                </Link>
                
                <div className="flex items-center gap-4">
                    <Link href="/verify-translator" className="text-sm font-semibold text-blue-900 hover:text-blue-950 hover:underline transition-all duration-200">
                        {t.nav_verify_trans}
                    </Link>
                    
                    {/* Language Switcher */}
                    <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-200 dir-ltr" dir="ltr">
                        {(['id', 'en', 'zh', 'ar'] as LangType[]).map((l) => (
                            <button
                                key={l}
                                onClick={() => changeLanguage(l)}
                                className={`px-2 py-1 rounded text-[10px] font-extrabold tracking-wider transition cursor-pointer ${lang === l ? 'bg-blue-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-semibold tracking-wide uppercase">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                        {t.title_doc}
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 leading-tight">
                        {t.hero_title_doc}
                    </h1>
                </div>

                {/* Tab Container */}
                <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 sm:p-8">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 pb-3.5 mb-6 overflow-x-auto gap-2 scrollbar-none">
                        <button
                            onClick={() => { setActiveTab('search'); setError(null); }}
                            className={`flex-1 flex items-center justify-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all duration-200 cursor-pointer flex-shrink-0 whitespace-nowrap ${activeTab === 'search' ? 'border-blue-950 text-blue-950' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>{t.tab_reg}</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('scan'); setError(null); }}
                            className={`flex-1 flex items-center justify-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all duration-200 cursor-pointer flex-shrink-0 whitespace-nowrap ${activeTab === 'scan' ? 'border-blue-950 text-blue-950' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>{t.tab_qr}</span>
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl text-sm font-medium mb-5">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{error}</span>
                        </div>
                    )}

                    {/* Tab 1: Search Form */}
                    {activeTab === 'search' && (
                        <form onSubmit={handleSearchSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="search-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                                    {t.label_reg}
                                </label>
                                <div className="relative">
                                    <input
                                        id="search-input"
                                        type="text"
                                        required
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t.placeholder_reg}
                                        className="w-full pl-4 pr-12 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-blue-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950 text-sm font-semibold uppercase tracking-wide transition-all duration-200"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className={`absolute ${isRtl ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-2 bg-blue-950 hover:bg-blue-900 disabled:bg-slate-200 text-white rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md`}
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {t.desc_reg}
                            </p>
                        </form>
                    )}

                    {/* Tab 2: QR Scanner */}
                    {activeTab === 'scan' && (
                        <div className="space-y-4 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                ref={qrFileInputRef}
                                onChange={handleQrUpload}
                                className="hidden"
                                id="qr-camera-input"
                            />
                            
                            <label
                                htmlFor="qr-camera-input"
                                className={`flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 hover:border-blue-950 rounded-xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all duration-300 group ${scanLoading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {scanLoading ? (
                                    <Loader2 className="w-10 h-10 text-blue-950 animate-spin mb-4" />
                                ) : (
                                    <Camera className="w-10 h-10 text-slate-400 group-hover:text-blue-950 transition-colors duration-200 mb-4" />
                                )}
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-950 transition-colors duration-200">
                                    {scanLoading ? t.scan_loading : t.upload_qr}
                                </span>
                                <span className="text-xs text-slate-400 mt-1.5">
                                    {t.upload_qr_desc}
                                </span>
                            </label>
                            
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {t.desc_qr}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 px-6 border-t border-slate-200/80 text-center text-xs text-slate-500 z-10 bg-white/70">
                &copy; {new Date().getFullYear()} {t.footer}
            </footer>
        </div>
    );
}
