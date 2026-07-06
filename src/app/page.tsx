'use client'

import { useState, useTransition, useRef } from "react";
import { searchDocument } from "@/actions/documentActions";
import { ShieldCheck, Search, QrCode, ArrowRight, Loader2, AlertCircle, Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

export default function Home() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'search' | 'scan'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [scanLoading, setScanLoading] = useState(false);
    const qrFileInputRef = useRef<HTMLInputElement>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!searchQuery.trim()) return;

        startTransition(async () => {
            const res = await searchDocument(searchQuery);
            if (res.success && res.documentId) {
                router.push(`/verify/${res.documentId}`);
            } else {
                setError(res.error || "Dokumen tidak ditemukan.");
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
                    setError("Gagal memproses kanvas gambar.");
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
                            setError("Kode QR ini tidak dikenali sebagai URL verifikasi DocVerify atau ID Dokumen yang valid.");
                            setScanLoading(false);
                        }
                    }
                } else {
                    setError("Tidak dapat menemukan kode QR yang terbaca. Coba pindai kembali dengan gambar yang lebih jelas.");
                    setScanLoading(false);
                }
            };
            image.onerror = () => {
                setError("Gagal memuat berkas gambar.");
                setScanLoading(false);
            };
            image.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
            {/* Background blur blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full filter blur-[120px] animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-blue-500/5 rounded-full filter blur-[120px] animate-blob animation-delay-2000"></div>
            <div className="absolute top-[30%] right-[10%] w-[35vw] h-[35vw] bg-teal-500/5 rounded-full filter blur-[120px] animate-blob animation-delay-4000"></div>

            {/* Header */}
            <header className="py-6 px-6 md:px-12 border-b border-slate-900 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-9 w-auto rounded bg-white p-0.5 object-contain shadow-md" />
                    <span className="text-xl font-bold tracking-tight text-white">DocVerify</span>
                </div>
                <Link href="/admin" className="text-sm font-semibold text-emerald-400 hover:text-emerald-350 hover:underline transition-all duration-200">
                    Akses Penerjemah
                </Link>
            </header>

            {/* Main Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 max-w-4xl mx-auto w-full">
                <div className="text-center space-y-6 mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Portal Validasi Resmi Dokumen Terjemahan
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                        Kepercayaan Berlandaskan <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                            Bukti Kriptografis.
                        </span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Verifikasi pendaftaran dan keaslian dokumen terjemahan tersumpah Anda secara instan menggunakan alat pemeriksa validasi kami.
                    </p>
                </div>

                {/* Tab Container */}
                <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-8">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-800 pb-3.5 mb-6">
                        <button
                            onClick={() => { setActiveTab('search'); setError(null); }}
                            className={`flex-1 flex items-center justify-center gap-2.5 pb-3 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${activeTab === 'search' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                        >
                            <Search className="w-4 h-4" />
                            <span>Verifikasi via Nomor</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('scan'); setError(null); }}
                            className={`flex-1 flex items-center justify-center gap-2.5 pb-3 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${activeTab === 'scan' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                        >
                            <QrCode className="w-4 h-4" />
                            <span>Pindai Kode QR</span>
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-sm font-medium mb-5">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{error}</span>
                        </div>
                    )}

                    {/* Tab 1: Search Form */}
                    {activeTab === 'search' && (
                        <form onSubmit={handleSearchSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="search-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                                    Nomor Registrasi atau 8-Karakter ID Dokumen
                                </label>
                                <div className="relative">
                                    <input
                                        id="search-input"
                                        type="text"
                                        required
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Contoh: REG-Belanda-001 atau VFY7A8B9"
                                        className="w-full pl-4 pr-12 py-3.5 border border-slate-800 rounded-xl bg-slate-950/60 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm font-semibold uppercase tracking-wide transition-all duration-200"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md"
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Verifikasi dokumen dengan mencari nomor registrasi yang dibubuhkan oleh penerjemah tersumpah, atau 8-karakter ID verifikasi unik.
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
                                className={`flex flex-col items-center justify-center p-8 border border-dashed border-slate-800 hover:border-emerald-500 rounded-xl bg-slate-950/30 cursor-pointer transition-all duration-300 group ${scanLoading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {scanLoading ? (
                                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
                                ) : (
                                    <Camera className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 transition-colors duration-200 mb-4" />
                                )}
                                <span className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors duration-200">
                                    {scanLoading ? 'Membaca Berkas...' : 'Ambil Foto atau Unggah QR'}
                                </span>
                                <span className="text-xs text-slate-500 mt-1.5">
                                    Mendukung jepretan kamera langsung & unggahan gambar
                                </span>
                            </label>
                            
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Ambil foto kode QR yang dibubuhkan pada dokumen terjemahan untuk mendekode dan memverifikasi secara otomatis.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 px-6 border-t border-slate-900 text-center text-xs text-slate-500 z-10 bg-slate-950/40">
                &copy; {new Date().getFullYear()} DocVerify IPPTI. Keamanan Terjemahan Tersumpah Resmi.
            </footer>
        </div>
    );
}
