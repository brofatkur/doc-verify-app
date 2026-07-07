import Link from "next/link";
import { getDocuments, getAllTranslators } from "@/actions/documentActions";
import { getSession } from "@/actions/authActions";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Plus, FileText, QrCode, ShieldAlert, Users, Award } from "lucide-react";
import QrToggleButton from "./QrToggleButton";
import ExcelImportButton from "./ExcelImportButton";
import TranslatorManager from "./TranslatorManager";

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

export default async function AdminDashboard() {
    const session = await getSession();
    const documents = await getDocuments();
    const isSuperAdmin = session?.role === "SUPERADMIN";

    if (isSuperAdmin) {
        const translators = await getAllTranslators();
        const totalTranslators = translators.length;
        const totalDocs = documents.length;
        const totalQrCodes = documents.filter(d => d.isQrGenerated).length;

        return (
            <div className="space-y-8">
                {/* Board Portal Header Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full w-max mb-2.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span className="tracking-wider uppercase">PORTAL AUDIT NASIONAL IPPTI</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ikhtisar Registrasi Nasional</h1>
                        <p className="text-slate-500 text-sm mt-1">Sistem audit terpadu untuk registrasi penerjemah tersumpah dan dokumen resmi se-Indonesia.</p>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
                        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">{totalTranslators}</p>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Penerjemah Terdaftar</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
                        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">{totalDocs}</p>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Total Dokumen Terdaftar</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
                        <div className="p-3.5 bg-amber-50 text-amber-500 rounded-xl">
                            <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">{totalQrCodes}</p>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Verifikasi QR Aktif</p>
                        </div>
                    </div>
                </div>

                {/* Audit Logs */}
                <div className="space-y-4 pt-2">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <span>Log Audit Registrasi Dokumen Nasional</span>
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Dokumen</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor Registrasi</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama di Dokumen</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Dokumen</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Arah Bahasa</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Penerjemah</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status QR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {documents.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                Belum ada dokumen terjemahan yang diunggah ke sistem.
                                            </td>
                                        </tr>
                                    ) : (
                                        documents.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                                                <td className="px-6 py-4 font-mono font-bold text-emerald-650 text-emerald-600">
                                                    {doc.documentId}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 font-semibold font-mono text-xs">{doc.registrationNumber}</td>
                                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{maskClientName(doc.clientName)}</td>
                                                <td className="px-6 py-4 text-slate-600 truncate max-w-[150px] font-medium" title={doc.documentType}>{doc.documentType}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-700 font-semibold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded text-xs">
                                                        {doc.languagePair}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 text-xs">{doc.translator?.name}</div>
                                                    <div className="text-[10px] text-slate-450 text-slate-400 font-medium font-mono mt-0.5">No. Anggota: {doc.translator?.skNumber}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <QrToggleButton id={doc.id} isQrGenerated={doc.isQrGenerated} documentId={doc.documentId} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const totalDocs = documents.length;
    const qrGeneratedDocs = documents.filter(d => d.isQrGenerated).length;

    return (
        <div className="space-y-6">
            {/* Translator Portal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Dokumen</h1>
                    <p className="text-slate-500 text-sm mt-1">Daftarkan dokumen terjemahan tersumpah Anda dan kelola kode QR verifikasi publik.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <ExcelImportButton />
                    <Link
                        href="/admin/new"
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        <span>Dokumen Baru</span>
                    </Link>
                </div>
            </div>

            {/* Translator Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{totalDocs}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Total Dokumen Terdaftar</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
                    <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                        <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{qrGeneratedDocs}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">QR Verifikasi Terbit</p>
                    </div>
                </div>
            </div>

            {/* Document List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Dokumen</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor Registrasi</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama di Dokumen</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Dokumen</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Arah Bahasa</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Input</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {documents.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                        Dokumen belum terdaftar. Silakan tambah dokumen baru secara manual atau impor dari berkas Excel untuk memulai.
                                    </td>
                                </tr>
                            ) : (
                                documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                                        <td className="px-6 py-4 font-mono font-bold text-emerald-650 text-emerald-600">
                                            {doc.documentId}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-semibold font-mono text-xs">{doc.registrationNumber}</td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{maskClientName(doc.clientName)}</td>
                                        <td className="px-6 py-4 text-slate-600 truncate max-w-[200px] font-medium" title={doc.documentType}>{doc.documentType}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-700 font-semibold bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded text-xs">
                                                {doc.languagePair}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {format(new Date(doc.documentDate), 'dd MMM yyyy', { locale: localeId })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <QrToggleButton id={doc.id} isQrGenerated={doc.isQrGenerated} documentId={doc.documentId} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
