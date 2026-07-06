'use client'

import { useState, useTransition } from "react";
import { createDocument } from "@/actions/documentActions";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewDocumentPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await createDocument(formData);
            if (res.success) {
                router.push("/admin");
                router.refresh();
            } else {
                setError(res.error || "Gagal mendaftarkan dokumen.");
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-slate-200 rounded-xl transition text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tambah Dokumen Baru</h1>
                    <p className="text-slate-500 text-sm mt-1">Daftarkan dokumen terjemahan tersumpah baru ke dalam sistem.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-semibold leading-snug">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="registrationNumber" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomor Registrasi</label>
                            <input
                                type="text"
                                id="registrationNumber"
                                name="registrationNumber"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 text-sm font-medium text-slate-800 placeholder-slate-400"
                                placeholder="Kosongkan untuk nomor otomatis"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="documentDate" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Dokumen</label>
                            <input
                                type="date"
                                id="documentDate"
                                name="documentDate"
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 text-sm font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="clientName" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama di Dokumen</label>
                            <input
                                type="text"
                                id="clientName"
                                name="clientName"
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 text-sm font-medium text-slate-800 placeholder-slate-400"
                                placeholder="Contoh: Zaki Syah Iqbal"
                            />
                            <p className="text-xs text-slate-400">Nama ini akan disamarkan secara otomatis pada halaman verifikasi publik (contoh: Z*** S*** I***).</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="documentType" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe Dokumen</label>
                            <input
                                type="text"
                                id="documentType"
                                name="documentType"
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 text-sm font-medium text-slate-800 placeholder-slate-400"
                                placeholder="Contoh: Akta Pendaftaran Keputusan Pengadilan"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="languagePair" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Pasangan Bahasa</label>
                            <input
                                type="text"
                                id="languagePair"
                                name="languagePair"
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 text-sm font-medium text-slate-800 placeholder-slate-400"
                                placeholder="Contoh: Belanda - Indonesia"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="flex items-center gap-3.5 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input type="checkbox" name="isQrGenerated" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-150">Buat Kode QR Verifikasi Secara Instan</span>
                                <span className="block text-xs text-slate-500">Aktifkan opsi ini untuk langsung membuat kode QR setelah dokumen disimpan.</span>
                            </div>
                        </label>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                        <Link href="/admin" className="px-6 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all duration-150 text-sm">
                            Batal
                        </Link>
                        <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-50 text-sm cursor-pointer">
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>Simpan Dokumen</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
