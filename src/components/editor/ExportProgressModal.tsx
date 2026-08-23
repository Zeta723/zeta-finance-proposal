import React from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  current: number
  total: number
  label: string
}

/** PDF/圖表匯出進度視窗，滿足「顯示匯出進度」的要求，避免使用者以為介面卡住 */
export function ExportProgressModal({ open, current, total, label }: Props) {
  if (!open) return null
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zeta-navy/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-card shadow-soft px-6 py-5 w-full max-w-xs text-center">
        <Loader2 className="mx-auto mb-3 animate-spin text-zeta-navy" size={26} />
        <div className="text-sm font-medium text-zeta-navy mb-2">{label}</div>
        <div className="h-2 rounded-full bg-zeta-bg overflow-hidden mb-1.5">
          <div className="h-full bg-zeta-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-zeta-text/60">{current} / {total}（{pct}%）</div>
      </div>
    </div>
  )
}
