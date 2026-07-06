import { getDocumentForVerification } from "@/actions/documentActions";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ShieldCheck, XCircle, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ documentId: string }>;
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

export default async function VerificationPage({ params }: PageProps) {
    const { documentId } = await params;

    if (!documentId || documentId.length !== 8) {
        notFound();
    }

    const document = await getDocumentForVerification(documentId);

    if (!document || !document.isQrGenerated) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8 border border-gray-200">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <XCircle className="w-10 h-10 text-rose-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Dokumen Tidak Ditemukan</h1>
                    <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                        Kami tidak dapat memverifikasi dokumen ini. Kode QR mungkin tidak valid, telah dicabut, atau dokumen belum terdaftar di sistem kami.
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                        <p className="text-sm font-mono text-gray-500">ID Dokumen: {documentId}</p>
                    </div>
                    <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors duration-200">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8">
            {/* Header */}
            <div className="w-full max-w-lg mb-8 text-center pt-4">
                <div className="inline-flex items-center justify-center gap-3 mb-2">
                    <img src="/ippti-logo.jpg" alt="IPPTI Logo" className="h-10 w-auto rounded bg-white p-0.5 object-contain shadow-sm" />
                    <span className="text-xl font-bold text-slate-900 tracking-tight">DocVerify</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Portal Verifikasi Resmi Terjemahan Tersumpah</p>
            </div>

            {/* Verification Card */}
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Header Banner - Curated Deep Gradient */}
                <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 p-8 text-center relative overflow-hidden">
                    {/* Legal Watermark secure effect */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                    
                    <div className="relative z-10 space-y-3">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md ring-4 ring-emerald-500/30">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-widest">TERVERIFIKASI</h1>
                            <p className="text-xs text-emerald-100 font-semibold tracking-wider uppercase mt-0.5">Rekam Dokumen Resmi IPPTI</p>
                        </div>
                    </div>
                </div>

                {/* Details list */}
                <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 border-b border-slate-100 pb-6">
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">ID Dokumen</p>
                            <p className="text-lg font-mono font-bold text-slate-900">{document.documentId}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">No. Registrasi</p>
                            <p className="text-base font-bold text-slate-800 font-mono">{document.registrationNumber}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tanggal Terjemah</p>
                            <p className="text-base font-semibold text-slate-800">
                                {format(new Date(document.documentDate), 'dd MMMM yyyy', { locale: localeId })}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status Verifikasi</p>
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    {document.status}
                                </span>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nama di Dokumen (Disamarkan)</p>
                            <p className="text-base font-mono font-bold text-slate-900 mt-1 bg-slate-50 border border-slate-200/80 p-3 rounded-xl select-none tracking-wide">
                                {maskClientName(document.clientName)}
                            </p>
                        </div>

                        <div className="sm:col-span-2 bg-slate-50 rounded-2xl p-4.5 border border-slate-200/60">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Pasangan Bahasa</p>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-slate-800 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200/80 shadow-sm">{document.languagePair}</span>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tipe Dokumen</p>
                            <p className="text-base font-semibold text-slate-800 mt-1">{document.documentType}</p>
                        </div>

                        {/* Sworn Translator Badge Box */}
                        <div className="sm:col-span-2 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Penerjemah Tersumpah</p>
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
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">No. Anggota: {document.translator.skNumber}</p>
                                    </div>
                                </div>
                                {document.translator.languageServices && (
                                    <div className="text-xs border-t border-slate-100/85 pt-3">
                                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Layanan Bahasa:</span>
                                        <p className="text-slate-700 font-semibold">{document.translator.languageServices}</p>
                                    </div>
                                )}
                                {document.translator.bio && (
                                    <div className="text-xs border-t border-slate-100/85 pt-3">
                                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Biografi:</span>
                                        <p className="text-slate-600 leading-relaxed italic text-justify">"{document.translator.bio}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secure Disclaimer box */}
                <div className="bg-amber-50/40 p-6 border-t border-slate-100 border-l-4 border-l-amber-500">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 leading-relaxed text-justify">
                            <strong className="text-slate-800 font-bold">Disclaimer Resmi:</strong> Sistem ini memverifikasi bahwa terjemahan dokumen ini telah resmi terdaftar oleh Penerjemah Tersumpah yang terasosiasi di atas. Harap pastikan fisik dokumen memiliki cap basah/segel pengaman yang sesuai untuk validitas hukum sepenuhnya.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Credit */}
            <div className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest space-y-1">
                <p>&copy; {new Date().getFullYear()} DocVerify IPPTI. Seluruh Hak Cipta Dilindungi.</p>
                <p className="font-semibold text-slate-350">DIVERIFIKASI SECARA ELEKTRONIK & KRIPTOGRAFIS</p>
            </div>
        </div>
    );
}
