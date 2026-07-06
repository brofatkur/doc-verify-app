'use client'

import { useTransition, useState } from 'react'
import { toggleQrStatus } from '@/actions/documentActions'
import { QrCode, Loader2, Download, Eye, X } from 'lucide-react'
import QRCode from 'qrcode'

export default function QrToggleButton({
    id,
    isQrGenerated,
    documentId
}: {
    id: string,
    isQrGenerated: boolean,
    documentId: string
}) {
    const [isPending, startTransition] = useTransition()
    const [qrModalUrl, setQrModalUrl] = useState<string | null>(null)
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

    const handleToggle = () => {
        startTransition(async () => {
            await toggleQrStatus(id, isQrGenerated)
        })
    }

    const showQrModal = async () => {
        const origin = window.location.origin
        const verificationUrl = `${origin}/verify/${documentId}`
        
        try {
            const dataUrl = await QRCode.toDataURL(verificationUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff'
                }
            })
            setQrCodeDataUrl(dataUrl)
            setQrModalUrl(verificationUrl)
        } catch (err) {
            console.error('Failed to generate QR Code:', err)
        }
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {isQrGenerated && (
                <>
                    <button
                        onClick={showQrModal}
                        className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Lihat & Unduh Kode QR"
                    >
                        <QrCode className="w-4 h-4" />
                    </button>
                    <a
                        href={`/verify/${documentId}`}
                        target="_blank"
                        className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Buka Halaman Publik"
                    >
                        <Eye className="w-4 h-4" />
                    </a>
                </>
            )}

            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${isQrGenerated
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    } disabled:opacity-50`}
            >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isQrGenerated ? 'Cabut QR' : 'Buat QR'}
            </button>

            {qrModalUrl && qrCodeDataUrl && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 border border-slate-100 text-center relative">
                        <button
                            onClick={() => {
                                setQrModalUrl(null)
                                setQrCodeDataUrl(null)
                            }}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">Kode QR Verifikasi</h3>
                        <p className="text-xs text-slate-500 mb-4 truncate font-mono">ID: {documentId}</p>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-center items-center mb-4">
                            <img src={qrCodeDataUrl} alt="Document QR Code" className="w-48 h-48 rounded" />
                        </div>

                        <p className="text-xs text-slate-400 mb-6 truncate max-w-full font-mono bg-slate-50 p-2 rounded border border-slate-100">
                            {qrModalUrl}
                        </p>

                        <a
                            href={qrCodeDataUrl}
                            download={`QR_Verifikasi_${documentId}.png`}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
                        >
                            <Download className="w-4 h-4" />
                            <span>Unduh PNG</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}
