import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { CurrencySettings, ProposalSlide } from '../../types'
import { SlideRenderer } from '../preview/SlideRenderer'

interface Props {
  open: boolean
  slides: ProposalSlide[]
  defaultTheme: string
  currencySettings?: CurrencySettings
  onClose: () => void
}

/** 完整簡報預覽（僅顯示未隱藏的頁面），支援鍵盤左右鍵切換 */
export function FullPreviewModal({ open, slides, defaultTheme, currencySettings, onClose }: Props) {
  const visible = [...slides].filter((s) => !s.hidden).sort((a, b) => a.order - b.order)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (open) setIdx(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(i + 1, visible.length - 1))
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(i - 1, 0))
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, visible.length, onClose])

  if (!open) return null
  const active = visible[idx]

  return (
    <div className="fixed inset-0 z-[60] bg-zeta-navy/95 flex flex-col items-center justify-center p-6">
      <button onClick={onClose} className="absolute top-5 right-5 text-white/70 hover:text-white"><X size={24} /></button>
      <div className="w-full max-w-5xl aspect-video bg-white rounded-md overflow-hidden shadow-2xl">
        {active ? <SlideRenderer slide={active} defaultTheme={defaultTheme as any} currencySettings={currencySettings} /> : <div className="p-10 text-center text-zeta-text/50">沒有可預覽的頁面</div>}
      </div>
      <div className="flex items-center gap-4 mt-4 text-white">
        <button onClick={() => setIdx((i) => Math.max(i - 1, 0))} disabled={idx <= 0} className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30"><ChevronLeft /></button>
        <span className="text-sm">{visible.length ? idx + 1 : 0} / {visible.length}</span>
        <button onClick={() => setIdx((i) => Math.min(i + 1, visible.length - 1))} disabled={idx >= visible.length - 1} className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30"><ChevronRight /></button>
      </div>
    </div>
  )
}
