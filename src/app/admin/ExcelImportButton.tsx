'use client'

import { useState, useTransition, useRef } from 'react'
import { Upload, Loader2, AlertTriangle, CheckCircle, Download } from 'lucide-react'
import { importDocumentsFromExcel } from '@/actions/documentActions'

export default function ExcelImportButton() {
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<{
        success: boolean
        importedCount?: number
        skippedCount?: number
        errors?: string[]
        error?: string
    } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            const resultBase64 = event.target?.result as string
            const base64Data = resultBase64.split(',')[1]
            
            startTransition(async () => {
                const res = await importDocumentsFromExcel(base64Data)
                setResult(res)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
            })
        }
        reader.onloadend = () => {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="relative">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    id="excel-upload-input"
                />
                <label
                    htmlFor="excel-upload-input"
                    className={`flex items-center gap-2 border border-gray-200 hover:border-emerald-500 hover:text-emerald-700 bg-white text-gray-700 px-4 py-2 rounded-lg font-medium transition cursor-pointer ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Upload className="w-5 h-5 text-gray-400" />
                    )}
                    <span>Impor Excel</span>
                </label>
            </div>
            <a
                href="/template-impor-dokumen.csv"
                download
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 px-1 py-1"
                title="Unduh template Excel/CSV yang benar"
            >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template</span>
            </a>

            {result && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-slate-100 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-4">
                            {result.success ? (
                                <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                            ) : (
                                <AlertTriangle className="w-8 h-8 text-rose-500 flex-shrink-0" />
                            )}
                            <h3 className="text-xl font-bold text-slate-800">
                                {result.success ? 'Impor Selesai' : 'Impor Gagal'}
                            </h3>
                        </div>

                        {result.success ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-emerald-600">{result.importedCount}</p>
                                        <p className="text-xs text-slate-500 font-medium font-semibold">Berhasil Diimpor</p>
                                    </div>
                                    <div className="text-center border-l border-slate-200">
                                        <p className="text-2xl font-black text-amber-500">{result.skippedCount}</p>
                                        <p className="text-xs text-slate-500 font-medium font-semibold">Dilewati / Duplikat</p>
                                    </div>
                                </div>

                                {result.errors && result.errors.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-slate-700">Detail Impor:</p>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 max-h-40 overflow-y-auto text-xs font-mono text-slate-600 space-y-1">
                                            {result.errors.map((err, i) => (
                                                <div key={i} className="pb-1 border-b border-slate-100/50 last:border-0">{err}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600">{result.error}</p>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setResult(null)}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
