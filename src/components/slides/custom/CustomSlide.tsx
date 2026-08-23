import React from 'react'
import type { CustomSlideData, ImageBlock, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { RichTextView } from '../../richtext/RichTextView'

interface Props {
  slide: ProposalSlide<CustomSlideData>
  theme: ZetaTheme
}

function objectFitFor(mode: ImageBlock['objectFit']): React.CSSProperties['objectFit'] {
  if (mode === 'contain') return 'contain'
  if (mode === 'cover') return 'cover'
  if (mode === 'original') return 'none'
  return 'fill' // free
}

/** 依 imageBlock 設定渲染定位圖片；PDF/PPT 匯出與網頁預覽都呼叫同一份邏輯的等效版本 */
export function CustomSlideImageBlock({ block }: { block: ImageBlock }) {
  return (
    <img
      src={block.src}
      alt=""
      style={{
        position: 'absolute',
        left: `${block.x}%`,
        top: `${block.y}%`,
        width: `${block.width}%`,
        height: `${block.height}%`,
        objectFit: objectFitFor(block.objectFit),
        opacity: block.opacity / 100,
        borderRadius: `${block.borderRadius}px`,
        zIndex: block.zIndex
      }}
    />
  )
}

function bodyTextStyle(d: CustomSlideData): React.CSSProperties {
  const s = d.bodyStyle
  if (!s) return {}
  return {
    fontSize: `${s.fontSize}px`,
    lineHeight: s.lineHeight,
    textAlign: s.textAlign,
    letterSpacing: `${s.letterSpacing}px`
  }
}

export function CustomSlide({ slide, theme }: Props) {
  const d = slide.data
  const layout = slide.layoutId
  const hasImageBlock = layout === 'imageText' && !!d.imageBlock

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="w-full h-full p-[4%] flex flex-col">
        <h2 className="text-xl font-bold mb-1" style={{ color: theme.navy }}>{d.heading || d.title || '自訂主題頁'}</h2>
        <div className="w-16 h-[3px] mb-2" style={{ backgroundColor: theme.gold }} />
        {d.subtitle && <div className="text-sm text-zeta-text/70 mb-2">{d.subtitle}</div>}

        {layout === 'imageText' ? (
          <div className="flex-1 flex gap-4">
            <RichTextView
              value={d.body}
              className={hasImageBlock ? 'w-1/2 text-sm' : 'w-1/2 text-sm'}
              style={bodyTextStyle(d)}
              paragraphSpacing={d.bodyStyle?.paragraphSpacing}
            />
            {/* 舊版沒有 imageBlock 時，維持原本的靜態顯示（相容舊提案） */}
            {!hasImageBlock && (
              d.image?.dataUrl ? (
                <img src={d.image.dataUrl} className="w-1/2 h-full object-cover rounded-card" alt="" />
              ) : (
                <div className="w-1/2 h-full bg-zeta-cream/40 rounded-card flex items-center justify-center text-xs text-zeta-text/40">尚未上傳圖片</div>
              )
            )}
            {hasImageBlock && <div className="w-1/2 shrink-0" />}
          </div>
        ) : layout === 'threeCards' ? (
          <div className="flex-1 grid grid-cols-3 gap-3">
            {d.highlights.slice(0, 3).map((h, i) => (
              <div key={h.id} className="bg-white rounded-card shadow-soft p-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-2" style={{ backgroundColor: theme.gold, color: theme.navy }}>{i + 1}</div>
                <div className="font-semibold text-sm mb-1" style={{ color: theme.navy }}>{h.title}</div>
                <RichTextView value={h.content} className="text-xs text-zeta-text" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex gap-4">
            <RichTextView value={d.body} className="w-2/3 text-sm" style={bodyTextStyle(d)} paragraphSpacing={d.bodyStyle?.paragraphSpacing} />
            <div className="w-1/3 space-y-2">
              {d.highlights.slice(0, 4).map((h) => (
                <div key={h.id} className="bg-white rounded-card border p-2" style={{ borderColor: theme.gold }}>
                  <div className="text-[10px] font-semibold text-zeta-navy">{h.title}</div>
                  <RichTextView value={h.content} className="text-sm font-bold" style={{ color: theme.gold }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasImageBlock && d.imageBlock && <CustomSlideImageBlock block={d.imageBlock} />}
    </div>
  )
}
