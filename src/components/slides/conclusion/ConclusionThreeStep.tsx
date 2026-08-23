import React from 'react'
import type { ConclusionData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { RichTextView } from '../../richtext/RichTextView'

interface Props {
  slide: ProposalSlide<ConclusionData>
  theme: ZetaTheme
}

/** 模板A｜三步驟行動版：深藍背景，三欄卡片橫排（核心建議／優先事項／下一步） */
export function ConclusionThreeStep({ slide, theme }: Props) {
  const d = slide.data
  const contactParts = [d.contact, d.instagram, d.website].filter(Boolean).join('　｜　')

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.navy }}>
      <h2 className="text-2xl font-bold mb-1 text-white">{d.heading || '結論與下一步'}</h2>
      <div className="w-16 h-[3px] mb-3" style={{ backgroundColor: theme.gold }} />
      {d.summary && <RichTextView value={d.summary} className="text-xs mb-3" style={{ color: theme.cream }} />}

      <div className="flex-1 grid grid-cols-3 gap-3">
        {[
          ['核心建議', d.coreAdvice],
          ['優先執行事項', d.priorities],
          ['下一步行動', d.nextSteps]
        ].map(([title, items]) => (
          <div key={title as string} className="bg-white/95 rounded-card p-3 text-xs">
            <div className="font-semibold mb-1.5" style={{ color: theme.navy }}>{title as string}</div>
            {(items as string[]).slice(0, 6).map((it, i) => (
              <div key={i} className="text-zeta-text mb-1">{i + 1}. {it}</div>
            ))}
          </div>
        ))}
      </div>

      {d.closingText && (
        <RichTextView value={d.closingText} className="text-sm italic text-center mt-3" style={{ color: theme.gold }} />
      )}
      {contactParts && <div className="text-center text-[11px] mt-2" style={{ color: theme.cream }}>{contactParts}</div>}
    </div>
  )
}
