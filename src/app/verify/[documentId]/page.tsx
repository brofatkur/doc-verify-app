import { getDocumentForVerification } from "@/actions/documentActions";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentDetailCard from "./DocumentDetailCard";

interface PageProps {
    params: Promise<{ documentId: string }>;
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

    // Map Document to match types in client component
    const mappedDoc = {
        documentId: document.documentId,
        registrationNumber: document.registrationNumber,
        documentDate: document.documentDate.toISOString(),
        documentType: document.documentType,
        languagePair: document.languagePair,
        clientName: document.clientName,
        status: document.status,
        translator: {
            name: document.translator.name,
            skNumber: document.translator.skNumber,
            languageServices: document.translator.languageServices,
            bio: document.translator.bio,
            profilePicture: document.translator.profilePicture
        }
    };

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
            <DocumentDetailCard document={mappedDoc} />

            {/* Bottom Credit */}
            <div className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest space-y-1">
                <p>&copy; {new Date().getFullYear()} DocVerify IPPTI. Seluruh Hak Cipta Dilindungi.</p>
                <p className="font-semibold text-slate-350">DIVERIFIKASI SECARA ELEKTRONIK & KRIPTOGRAFIS</p>
            </div>
        </div>
    );
}
