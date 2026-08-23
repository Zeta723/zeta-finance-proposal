import React from 'react'
import type { ProposalSlide, RecommendationData } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { RichTextView } from '../../richtext/RichTextView'
import { currencyLabel } from '../../../export/pptxHelpers'

interface Props {
  slide: ProposalSlide<RecommendationData>
  theme: ZetaTheme
}

/** 模板A｜數據重點版：左側深藍色數據欄（大字金額），右側雙欄文字說明＋步驟/風險 */
export function RecommendationDataHighlight({ slide, theme }: Props) {
  const d = slide.data
  const fmt = (v: number) => `${currencyLabel(d.currency, d.customCurrencyLabel)}${v.toLocaleString('zh-Hant-TW')}`

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-xl font-bold" style={{ color: theme.navy }}>{d.heading || d.planName || '建議方案'}</h2>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: theme.gold, color: theme.navy }}>{d.planType}</span>
      </div>
      <div className="w-16 h-[3px] mb-3" style={{ backgroundColor: theme.gold }} />

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-[32%] rounded-card p-4 text-white flex flex-col" style={{ backgroundColor: theme.navy }}>
          <div className="text-[11px]" style={{ color: theme.gold }}>核心目標</div>
          <div className="text-sm mb-3">{d.coreGoal}</div>
          {[
            ['建議每月投入', fmt(d.monthlyAmount)],
            ['一次性投入', fmt(d.lumpSumAmount)],
            ['規劃期間', `${d.durationYears} 年`],
            ['預估年化報酬率', `${d.estimatedAnnualReturn}%`]
          ].map(([label, value]) => (
            <div key={label} className="mb-2">
              <div className="text-[10px]" style={{ color: theme.cream }}>{label}</div>
              <div className="text-lg font-bold" style={{ color: theme.gold }}>{value}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden text-xs">
          {[
            ['客戶目前的問題', d.clientProblem],
            ['顧問建議', d.advisorSuggestion],
            ['適合客戶的原因', d.whySuitable]
          ].map(([label, content]) => (
            <div key={label as string}>
              <div className="font-semibold" style={{ color: theme.gold }}>{label as string}</div>
              <RichTextView value={content as any} className="text-zeta-text" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div>
              <div className="font-semibold text-zeta-navy mb-1">執行步驟</div>
              {d.steps.slice(0, 4).map((s, i) => <div key={i}>{i + 1}. {s}</div>)}
            </div>
            <div>
              <div className="font-semibold" style={{ color: theme.danger }}>注意事項與風險提醒</div>
              {[...d.cautions, ...d.riskNotes].slice(0, 4).map((s, i) => <div key={i}>• {s}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
