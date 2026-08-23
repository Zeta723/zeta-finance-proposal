import React from 'react'
import type { ProposalSlide, RecommendationData } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { RichTextView } from '../../richtext/RichTextView'
import { currencyLabel } from '../../../export/pptxHelpers'
import { isRecFieldVisible } from '../../../data/recommendationFieldVisibility'

interface Props {
  slide: ProposalSlide<RecommendationData>
  theme: ZetaTheme
}

/**
 * 模板B｜顧問建議卡片版：上方橫幅（方案名稱＋核心目標＋關鍵數字橫向排列），
 * 中間三張等寬卡片並列（問題／建議／適合原因），底部為步驟時間軸（橫向），
 * 再加一列補充資訊（方案優勢／預估成果／提取方式／注意事項／顧問補充說明／圖片）。
 */
export function RecommendationAdvisorCard({ slide, theme }: Props) {
  const d = slide.data
  const fmt = (v: number) => `${currencyLabel(d.currency, d.customCurrencyLabel)}${v.toLocaleString('zh-Hant-TW')}`
  const show = (key: keyof RecommendationData) => isRecFieldVisible(d, key)

  const hasEstimatedResult = show('estimatedResult') && d.estimatedResult
  const hasWithdraw = show('withdrawTiming') && (d.withdrawTiming || d.withdrawMethod)
  const hasAdvantages = show('advantages') && d.advantages.length > 0
  const hasCautions = show('cautions') && d.cautions.length > 0
  const hasRiskNotes = show('riskNotes') && d.riskNotes.length > 0
  const hasImage = show('image') && d.image?.dataUrl
  const hasAdvisorNote = show('advisorNote') && d.advisorNote
  const hasFooterRow = hasEstimatedResult || hasWithdraw || hasAdvantages || hasCautions || hasRiskNotes || hasAdvisorNote

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      {/* 上方橫幅 */}
      <div className="px-[4%] py-4 flex items-center justify-between" style={{ backgroundColor: theme.navy }}>
        <div className="flex items-center gap-3">
          {hasImage && <img src={d.image!.dataUrl} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />}
          <div>
            <div className="text-[10px]" style={{ color: theme.gold }}>{d.planType}</div>
            <h2 className="text-xl font-bold text-white">{d.heading || d.planName || '建議方案'}</h2>
            <div className="text-xs text-white/70 mt-0.5">{d.coreGoal}</div>
          </div>
        </div>
        <div className="flex gap-4 shrink-0">
          {[
            ['每月投入', fmt(d.monthlyAmount)],
            ['規劃期間', `${d.durationYears}年`],
            ['預估報酬率', `${d.estimatedAnnualReturn}%`]
          ].map(([label, value]) => (
            <div key={label} className="text-right">
              <div className="text-[9px] text-white/50">{label}</div>
              <div className="text-base font-bold" style={{ color: theme.gold }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-[4%] py-3 flex flex-col gap-2 min-h-0">
        {/* 三張卡片並列 */}
        <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
          {[
            ['客戶目前的問題', d.clientProblem, theme.danger],
            ['顧問建議', d.advisorSuggestion, theme.gold],
            ['適合客戶的原因', d.whySuitable, theme.positive]
          ].map(([label, content, accent]) => (
            <div key={label as string} className="bg-white rounded-card shadow-soft p-3 flex flex-col overflow-hidden">
              <div className="text-xs font-semibold mb-1" style={{ color: accent as string }}>{label as string}</div>
              <RichTextView value={content as any} className="text-[11px] text-zeta-text flex-1 overflow-hidden" />
            </div>
          ))}
        </div>

        {/* 底部橫向步驟時間軸 */}
        <div className="bg-white rounded-card shadow-soft px-4 py-2.5">
          <div className="text-xs font-semibold text-zeta-navy mb-1.5">執行步驟</div>
          <div className="flex items-center">
            {d.steps.slice(0, 5).map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center w-24">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white mb-1" style={{ backgroundColor: theme.gold, color: theme.navy }}>
                    {i + 1}
                  </div>
                  <div className="text-[10px] text-zeta-text leading-tight">{step}</div>
                </div>
                {i < Math.min(d.steps.length, 5) - 1 && <div className="flex-1 h-[2px]" style={{ backgroundColor: theme.cream }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 補充資訊列：預估成果／提取方式／方案優勢／注意事項／顧問補充說明 */}
        {hasFooterRow && (
          <div className="bg-white rounded-card shadow-soft px-4 py-2 text-[9.5px] text-zeta-text space-y-1">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {hasEstimatedResult && (
                <span className="flex items-center gap-1">
                  <span className="font-semibold" style={{ color: theme.positive }}>預估成果：</span>
                  <RichTextView value={d.estimatedResult} className="inline" />
                </span>
              )}
              {hasWithdraw && (
                <span>
                  <span className="font-semibold text-zeta-navy">提取：</span>
                  {[d.withdrawTiming, d.withdrawMethod].filter(Boolean).join('／')}
                </span>
              )}
            </div>
            {hasAdvantages && (
              <div className="flex flex-wrap gap-1">
                {d.advantages.slice(0, 5).map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.gold + '22', color: theme.navy }}>{a}</span>
                ))}
              </div>
            )}
            {(hasCautions || hasRiskNotes) && (
              <div style={{ color: theme.danger }}>
                {[...(hasCautions ? d.cautions : []), ...(hasRiskNotes ? d.riskNotes : [])].slice(0, 3).join('　｜　')}
              </div>
            )}
            {hasAdvisorNote && <RichTextView value={d.advisorNote} className="italic text-zeta-text/50" />}
          </div>
        )}
      </div>
    </div>
  )
}
