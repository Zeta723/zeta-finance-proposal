import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import type { CustomSlideData, ProposalSlide } from '../../types'
import { SlideRenderer } from '../preview/SlideRenderer'
import { ImageBlockEditOverlay } from './ImageBlockEditOverlay'

interface Props {
  slides: ProposalSlide[]
  activeSlideId: string | null
  defaultTheme: string
  onSelect: (id: string) => void
  onOpenFullPreview: () => void
  onUpdateSlideData?: (slideId: string, data: any) => void
}

export function SlidePreviewPanel({ slides, activeSlideId, defaultTheme, onSelect, onOpenFullPreview, onUpdateSlideData }: Props) {
  const [zoom, setZoom] = useState(1)
  const ordered = [...slides].sort((a, b) => a.order - b.order)
  const idx = ordered.findIndex((s) => s.id === activeSlideId)
  const active = ordered[idx] ?? ordered[0]

  const goto = (delta: number) => {
    const next = ordered[idx + delta]
    if (next) onSelect(next.id)
  }

  const editableImageBlock =
    active?.type === 'custom' && active.layoutId === 'imageText' && (active.data as CustomSlideData).imageBlock
      ? (active.data as CustomSlideData).imageBlock
      : undefined

  return (
    <div className="h-full flex flex-col bg-zeta-bg/40">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zeta-bg bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => goto(-1)} disabled={idx <= 0} className="p-1 rounded hover:bg-zeta-bg disabled:opacity-30"><ChevronLeft size={16} /></button>
          <span className="text-xs text-zeta-text/60">{ordered.length ? idx + 1 : 0} / {ordered.length}</span>
          <button onClick={() => goto(1)} disabled={idx >= ordered.length - 1} className="p-1 rounded hover:bg-zeta-bg disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
        <div className="flex items-center gap-2">
          {editableImageBlock && <span className="text-[10px] text-zeta-navy bg-zeta-gold/15 px-2 py-1 rounded-full">拖曳圖片可調整位置與大小</span>}
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-1 rounded hover:bg-zeta-bg"><ZoomOut size={15} /></button>
          <span className="text-xs w-10 text-center text-zeta-text/60">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="p-1 rounded hover:bg-zeta-bg"><ZoomIn size={15} /></button>
          <button onClick={onOpenFullPreview} className="p-1.5 rounded hover:bg-zeta-bg text-zeta-navy" title="完整簡報預覽">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto p-6">
        {active ? (
          <div
            className="zeta-slide-canvas relative bg-white shadow-soft rounded-md overflow-hidden shrink-0"
            style={{ width: `${800 * zoom}px` }}
          >
            <SlideRenderer slide={active} defaultTheme={defaultTheme as any} />
            {editableImageBlock && onUpdateSlideData && (
              <ImageBlockEditOverlay
                block={editableImageBlock}
                onChange={(imageBlock) => onUpdateSlideData(active.id, { ...(active.data as CustomSlideData), imageBlock })}
              />
            )}
          </div>
        ) : (
          <div className="text-sm text-zeta-text/40">尚未有任何頁面，請先新增一頁</div>
        )}
      </div>
    </div>
  )
}
