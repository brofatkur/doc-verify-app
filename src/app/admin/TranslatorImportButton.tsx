'use client'

import { useState, useTransition, useRef } from 'react'
import { Upload, Loader2, AlertTriangle, CheckCircle, Download, X, HelpCircle } from 'lucide-react'
import { importTranslatorsFromExcel } from '@/actions/adminActions'
import * as XLSX from 'xlsx'

export default function TranslatorImportButton() {
    const [isPending, startTransition] = useTransition()
    const [previewRows, setPreviewRows] = useState<any[]>([])
    const [base64Data, setBase64Data] = useState<string>('')
    const [isValidFormat, setIsValidFormat] = useState<boolean>(true)
    const [showPreview, setShowPreview] = useState<boolean>(false)
    
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
            try {
                const resultBase64 = event.target?.result as string
                const base64 = resultBase64.split(',')[1]
                setBase64Data(base64)

                const buffer = new Uint8Array(event.target?.result as ArrayBuffer || [])
                const workbook = XLSX.read(buffer, { type: 'array' })
                const firstSheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[firstSheetName]
                const parsedRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" })

                if (parsedRows.length === 0) {
                    alert('Berkas yang diunggah kosong.')
                    return
                }

                // Check headers normalization
                const firstRow = parsedRows[0]
                const headers = Object.keys(firstRow)
                const normalizeKey = (key: any) => String(key).toLowerCase().replace(/[^a-z0-9]/g, '').trim()
                
                let hasNoAnggota = false
                let hasNamaPenerjemah = false

                for (const header of headers) {
                    const h = normalizeKey(header)
                    if (['noanggota', 'nomoranggota', 'membernumber'].includes(h)) {
                        hasNoAnggota = true
                    }
                    if (['namapenerjemah', 'nama', 'fullname', 'name'].includes(h)) {
                        hasNamaPenerjemah = true
                    }
                }

                setIsValidFormat(hasNoAnggota && hasNamaPenerjemah)
                setPreviewRows(parsedRows.slice(0, 5)) // show first 5 rows for preview
                setShowPreview(true)
            } catch (err: any) {
                alert('Gagal membaca berkas Excel: ' + err.message)
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const executeImport = () => {
        startTransition(async () => {
            const res = await importTranslatorsFromExcel(base64Data)
            setResult(res)
            setShowPreview(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        })
    }

    const cancelImport = () => {
        setShowPreview(false)
        setPreviewRows([])
        setBase64Data('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    id="translator-upload-input"
                />
                <label
                    htmlFor="translator-upload-input"
                    className={`flex items-center gap-1.5 border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 bg-white text-gray-700 px-3 py-2 rounded-xl font-semibold transition cursor-pointer text-xs shadow-sm ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                        <Upload className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span>Impor Penerjemah</span>
                </label>
            </div>
            <a
                href="/template-impor-penerjemah.xlsx"
                download
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 px-1 py-1"
                title="Unduh templat impor penerjemah (.xlsx)"
            >
                <Download className="w-3 h-3" />
                <span>Templat</span>
            </a>

            {/* Preview & Confirmation Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl p-6 border border-slate-100 max-h-[85vh] flex flex-col text-left">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-shrink-0">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-emerald-600" />
                                <span>Pratinjau Data Impor Penerjemah</span>
                            </h3>
                            <button onClick={cancelImport} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {!isValidFormat ? (
                                <div className="bg-rose-50 border-l-4 border-l-rose-500 border border-rose-100 p-4.5 rounded-xl text-rose-800 text-sm font-semibold flex items-start gap-3 shadow-sm">
                                    <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-extrabold text-rose-900 text-base">Peringatan: File tidak sesuai format!</p>
                                        <p className="text-rose-700 font-medium text-xs mt-1 leading-relaxed">
                                            Berkas yang diunggah tidak memiliki kolom header template yang diwajibkan. Pastikan berkas memiliki kolom: <strong>No Anggota</strong>, <strong>Nama Penerjemah</strong>, dan <strong>Email</strong>.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-semibold text-slate-650 leading-relaxed text-slate-600">
                                        Menampilkan pratinjau 5 baris pertama data penerjemah dari Excel. Password default untuk semua akun yang baru diimpor adalah <strong className="text-slate-900">penerjemah123</strong>.
                                    </div>

                                    <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-inner">
                                        <table className="w-full text-left text-[10px]">
                                            <thead className="bg-slate-100 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-3 py-2 font-bold text-slate-500">No Anggota</th>
                                                    <th className="px-3 py-2 font-bold text-slate-500">Nama</th>
                                                    <th className="px-3 py-2 font-bold text-slate-500">No SK Kemenkum</th>
                                                    <th className="px-3 py-2 font-bold text-slate-500">Tanggal SK</th>
                                                    <th className="px-3 py-2 font-bold text-slate-500">Arah Bahasa</th>
                                                    <th className="px-3 py-2 font-bold text-slate-500">Masa Aktif</th>
                                                    <th className="px-3 py-2 font-bold text-slate-500">SK Lengkap</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {previewRows.map((row, i) => {
                                                    const normalize = (key: any) => String(key).toLowerCase().replace(/[^a-z0-9]/g, '').trim()
                                                    const keys = Object.keys(row)
                                                    
                                                    const find = (arr: string[]) => {
                                                        const match = keys.find(k => arr.includes(normalize(k)))
                                                        return match ? row[match] : ''
                                                    }

                                                    const no = find(['noanggota', 'nomoranggota', 'membernumber']) || '-'
                                                    const name = find(['namapenerjemah', 'nama', 'fullname', 'name']) || '-'
                                                    const email = find(['email', 'alamatemail']) || `${no}@ippti.or.id`
                                                    const noSk = find(['noskkemenkum', 'skkemenkumham', 'nomorsk', 'sk']) || '-'
                                                    const tglSk = find(['tglsk', 'tanggalsk']) || '-'
                                                    const pair = find(['arahbahasa', 'pasanganbahasa']) || '-'
                                                    const status = find(['masaaktif']) || '-'
                                                    const skFull = find(['sklengkap', 'bio']) || '-'

                                                    return (
                                                        <tr key={i} className="hover:bg-slate-50/50">
                                                            <td className="px-3 py-2 font-mono text-[9px] text-slate-700 truncate max-w-[80px]">{no}</td>
                                                            <td className="px-3 py-2 text-slate-800 font-bold truncate max-w-[100px]">{name}</td>
                                                            <td className="px-3 py-2 text-slate-600 truncate max-w-[100px]">{noSk}</td>
                                                            <td className="px-3 py-2 text-slate-650 truncate max-w-[80px]">{tglSk}</td>
                                                            <td className="px-3 py-2 text-slate-600 truncate max-w-[90px]">{pair}</td>
                                                            <td className="px-3 py-2 text-slate-550 truncate max-w-[70px]">{status}</td>
                                                            <td className="px-3 py-2 text-slate-500 truncate max-w-[100px]">{skFull}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-t border-slate-100 pt-4 mt-4 flex justify-end gap-3 flex-shrink-0">
                            <button
                                onClick={cancelImport}
                                className="px-5 py-2.5 border border-slate-250 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                            >
                                Batal
                            </button>
                            {isValidFormat && (
                                <button
                                    onClick={executeImport}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer active:scale-95 transition"
                                >
                                    Ya, Impor Sekarang
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Results Feedback Modal */}
            {result && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-slate-100 max-h-[80vh] overflow-y-auto text-left">
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
                                        <p className="text-xs text-slate-500 font-semibold">Berhasil Diimpor</p>
                                    </div>
                                    <div className="text-center border-l border-slate-200">
                                        <p className="text-2xl font-black text-amber-500">{result.skippedCount}</p>
                                        <p className="text-xs text-slate-500 font-semibold">Dilewati / Duplikat</p>
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
                            <p className="text-sm text-slate-650 font-medium">{result.error}</p>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setResult(null)
                                    window.location.reload()
                                }}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
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
