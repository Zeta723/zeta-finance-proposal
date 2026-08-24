import React from 'react'
import type { ConclusionData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { RichTextView } from '../../richtext/RichTextView'
import { imageTransformStyle } from '../../../services/imageTransform'

interface Props {
  slide: ProposalSlide<ConclusionData>
  theme: ZetaTheme
}

/**
 * 模板B｜溫暖結語與聯絡資訊版：奶茶色背景，結語文字置中放大在最上方視覺焦點，
 * 下方改為「左側摘要與待辦清單／右側顧問照片＋聯絡資訊卡」左右分欄，
 * 完全沒有模板A的三欄卡片結構，資訊階層與視覺焦點都不同。
 */
export function ConclusionWarmClosing({ slide, theme }: Props) {
  const d = slide.data

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.cream }}>
      {d.closingText && (
        <RichTextView value={d.closingText} className="text-lg italic text-center mb-3 px-8" style={{ color: theme.navy }} />
      )}
      <div className="w-20 h-[3px] mx-auto mb-4" style={{ backgroundColor: theme.gold }} />

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 bg-white/70 rounded-card p-4 overflow-hidden">
          <h3 className="text-sm font-bold mb-2" style={{ color: theme.navy }}>{d.heading || '結論與下一步'}</h3>
          {d.summary && <RichTextView value={d.summary} className="text-xs text-zeta-text mb-3" />}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="font-semibold text-zeta-navy mb-1">核心建議</div>
              {d.coreAdvice.slice(0, 4).map((it, i) => <div key={i} className="text-zeta-text">• {it}</div>)}
            </div>
            <div>
              <div className="font-semibold text-zeta-navy mb-1">下一步行動</div>
              {d.nextSteps.slice(0, 4).map((it, i) => <div key={i} className="text-zeta-text">• {it}</div>)}
            </div>
          </div>
        </div>

        <div className="w-56 shrink-0 bg-white rounded-card shadow-soft p-4 flex flex-col items-center text-center">
          {d.advisorPhoto?.dataUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
              <img src={d.advisorPhoto.dataUrl} className="w-full h-full object-cover" style={imageTransformStyle(d.advisorPhoto)} alt="advisor" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full mb-2" style={{ backgroundColor: theme.cream }} />
          )}
          <div className="text-xs font-semibold text-zeta-navy">聯絡資訊</div>
          <div className="text-[11px] text-zeta-text/70 mt-1 space-y-0.5">
            {d.contact && <div>{d.contact}</div>}
            {d.instagram && <div>{d.instagram}</div>}
            {d.website && <div>{d.website}</div>}
          </div>
          {d.qrCode?.dataUrl && (
            <div className="w-16 h-16 mt-2 overflow-hidden">
              <img src={d.qrCode.dataUrl} className="w-full h-full object-contain" style={imageTransformStyle(d.qrCode)} alt="qr" />
            </div>
          )}
          {d.nextMeetingDate && (
            <div className="mt-3 text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: theme.gold, color: theme.navy }}>
              下次會談：{d.nextMeetingDate}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
