import React from 'react'
import type { CoverData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { RichTextView } from '../../richtext/RichTextView'
import { imageTransformStyle, imageObjectPosition } from '../../../services/imageTransform'

interface Props {
  slide: ProposalSlide<CoverData>
  theme: ZetaTheme
}

/** 封面／首頁模板：經典藍金版 / 溫暖奶茶版 / 極簡留白版 */
export function CoverSlide({ slide, theme }: Props) {
  const d = slide.data
  const layout = slide.layoutId

  const bg = layout === 'warm' ? theme.cream : layout === 'minimal' ? theme.ivory : theme.navy
  const headingColor = layout === 'classic' ? '#FFFFFF' : theme.navy
  const bodyColor = layout === 'classic' ? 'rgba(255,255,255,0.85)' : 'rgba(51,51,51,0.85)'

  return (
    <div className="w-full h-full relative flex flex-col justify-between p-[5%]" style={{ backgroundColor: bg }}>
      <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: theme.gold }} />
      {d.backgroundImage?.dataUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={d.backgroundImage.dataUrl}
            className="w-full h-full opacity-20"
            style={{
              objectFit: d.backgroundImage.fit === 'contain' ? 'contain' : 'cover',
              objectPosition: imageObjectPosition(d.backgroundImage),
              ...imageTransformStyle(d.backgroundImage)
            }}
            alt=""
          />
        </div>
      )}
      <div className="relative z-10">
        <div className="text-xs tracking-[0.2em] font-bold mb-2" style={{ color: theme.gold }}>
          {d.proposalTopic || '財務規劃提案'}
        </div>
        <h1 className="text-[2.6rem] leading-tight font-bold mb-3" style={{ color: headingColor }}>
          {d.title || '財務規劃提案'}
        </h1>
        <p className="text-lg mb-4" style={{ color: bodyColor }}>{d.subtitle}</p>
        {d.quote && <RichTextView value={d.quote} className="text-sm italic max-w-xl" style={{ color: bodyColor } as any} />}
      </div>
      <div className="relative z-10 flex items-end justify-between">
        <div className="bg-white/95 rounded-card shadow-soft px-5 py-4 max-w-sm" style={{ borderTop: `2px solid ${theme.gold}` }}>
          <div className="font-semibold text-zeta-navy text-sm">客戶：{d.clientName || '—'} {d.clientTitle}</div>
          <div className="text-xs text-zeta-text/70 mt-1">提案日期：{d.proposalDate || '—'}</div>
          <div className="text-xs text-zeta-text/70">財務顧問：{d.advisorName || 'Zeta'}｜{d.brandName}</div>
        </div>
        {d.coverPhoto?.dataUrl && (
          <div className="w-40 h-28 overflow-hidden rounded-card shadow-soft">
            <img src={d.coverPhoto.dataUrl} className="w-full h-full object-cover" style={imageTransformStyle(d.coverPhoto)} alt="" />
          </div>
        )}
      </div>
      {d.logo?.dataUrl && (
        <div className="absolute top-[5%] right-[5%] w-16 h-16 overflow-visible">
          <img src={d.logo.dataUrl} className="w-full h-full object-contain" style={imageTransformStyle(d.logo)} alt="logo" />
        </div>
      )}
    </div>
  )
}
