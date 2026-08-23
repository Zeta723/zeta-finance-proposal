import React, { useRef, useState } from 'react'
import type { ImageBlock } from '../../types'

interface Props {
  block: ImageBlock
  onChange: (block: ImageBlock) => void
}

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se'

const MIN_SIZE = 5 // 最小寬高（投影片百分比）

/**
 * 圖片區塊的拖曳/縮放編輯覆蓋層。疊在 SlideRenderer 上方同一個座標系統
 * （相對於同一個 16:9 容器的百分比座標），讓使用者可以直接在預覽畫面裡
 * 拖曳移動、拉四個角落縮放圖片，變更會即時寫回投影片資料。
 */
export function ImageBlockEditOverlay({ block, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<{ mode: DragMode; startX: number; startY: number; start: ImageBlock } | null>(null)

  const getContainerRect = () => containerRef.current?.parentElement?.getBoundingClientRect()

  const startDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragState({ mode, startX: e.clientX, startY: e.clientY, start: block })
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState) return
    const rect = getContainerRect()
    if (!rect) return

    const dxPct = ((e.clientX - dragState.startX) / rect.width) * 100
    const dyPct = ((e.clientY - dragState.startY) / rect.height) * 100
    const s = dragState.start
    let next: ImageBlock = { ...block }

    if (dragState.mode === 'move') {
      next.x = clamp(s.x + dxPct, 0, 100 - s.width)
      next.y = clamp(s.y + dyPct, 0, 100 - s.height)
    } else {
      // 四角縮放：計算新的 width/height，若鎖定比例則以較大的變化量為準等比例縮放
      let newW = s.width
      let newH = s.height
      let newX = s.x
      let newY = s.y

      if (dragState.mode === 'se') {
        newW = clamp(s.width + dxPct, MIN_SIZE, 100 - s.x)
        newH = s.aspectRatioLocked && s.naturalAspectRatio ? newW / s.naturalAspectRatio : clamp(s.height + dyPct, MIN_SIZE, 100 - s.y)
      } else if (dragState.mode === 'sw') {
        newW = clamp(s.width - dxPct, MIN_SIZE, s.x + s.width)
        newX = s.x + s.width - newW
        newH = s.aspectRatioLocked && s.naturalAspectRatio ? newW / s.naturalAspectRatio : clamp(s.height + dyPct, MIN_SIZE, 100 - s.y)
      } else if (dragState.mode === 'ne') {
        newW = clamp(s.width + dxPct, MIN_SIZE, 100 - s.x)
        newH = s.aspectRatioLocked && s.naturalAspectRatio ? newW / s.naturalAspectRatio : clamp(s.height - dyPct, MIN_SIZE, s.y + s.height)
        newY = s.aspectRatioLocked && s.naturalAspectRatio ? s.y + (s.height - newH) : s.y + s.height - newH
      } else if (dragState.mode === 'nw') {
        newW = clamp(s.width - dxPct, MIN_SIZE, s.x + s.width)
        newX = s.x + s.width - newW
        newH = s.aspectRatioLocked && s.naturalAspectRatio ? newW / s.naturalAspectRatio : clamp(s.height - dyPct, MIN_SIZE, s.y + s.height)
        newY = s.aspectRatioLocked && s.naturalAspectRatio ? s.y + (s.height - newH) : s.y + s.height - newH
      }

      next = { ...block, x: newX, y: newY, width: newW, height: newH }
    }

    onChange(next)
  }

  const endDrag = () => setDragState(null)

  return (
    <div
      ref={containerRef}
      className="absolute border-2 border-zeta-gold cursor-move"
      style={{
        left: `${block.x}%`,
        top: `${block.y}%`,
        width: `${block.width}%`,
        height: `${block.height}%`,
        zIndex: 1000
      }}
      onPointerDown={startDrag('move')}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
    >
      <div className="absolute -top-6 left-0 text-[10px] bg-zeta-navy text-white px-1.5 py-0.5 rounded whitespace-nowrap">
        {block.width.toFixed(0)}% × {block.height.toFixed(0)}%
      </div>
      {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
        <div
          key={corner}
          onPointerDown={startDrag(corner)}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          className="absolute w-3 h-3 bg-white border-2 border-zeta-gold rounded-full"
          style={{
            cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize',
            top: corner.includes('n') ? -6 : undefined,
            bottom: corner.includes('s') ? -6 : undefined,
            left: corner.includes('w') ? -6 : undefined,
            right: corner.includes('e') ? -6 : undefined
          }}
        />
      ))}
    </div>
  )
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), Math.max(min, max))
}
