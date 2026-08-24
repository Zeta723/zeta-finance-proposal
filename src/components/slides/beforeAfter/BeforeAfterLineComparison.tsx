import React from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useIsExportRender } from '../../../export/ExportRenderContext'
import type { BeforeAfterData, CurrencySettings, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { formatMoney } from '../../../services/currencyService'
import { resolveLineComparisonPoints, finalGap } from '../../../services/lineComparisonCalc'
import { defaultLineComparisonData } from '../../../data/slideDefaults'
import { defaultCurrencySettings } from '../../../types'
import { BeforeAfterGrowthAssets } from './BeforeAfterGrowthAssets'

interface Props {
  slide: ProposalSlide<BeforeAfterData>
  theme: ZetaTheme
  currencySettings?: CurrencySettings
}

/**
 * 模板C｜資產成長折線比較圖：真正的 XY 座標折線圖（不是圓餅圖）。
 * 若已設定「多項資產獨立試算」（growthAssets），改由 BeforeAfterGrowthAssets 渲染；
 * 否則維持舊版「調整前／調整後」雙線比較，向下相容既有提案 —— 但現在每個資產項目
 * 若設定了自己的投入方式／幣別，計算時會逐項套用並統一換算成主要顯示幣別。
 */
export function BeforeAfterLineComparison({ slide, theme, currencySettings }: Props) {
  const d = slide.data
  const line = d.lineComparison ?? defaultLineComparisonData()
  const settings = currencySettings ?? defaultCurrencySettings()

  if ((line.growthAssets?.length ?? 0) > 0) {
    return <BeforeAfterGrowthAssets slide={slide} theme={theme} currencySettings={currencySettings} />
  }

  const points = resolveLineComparisonPoints(line, d.beforeItems, d.afterItems, settings)
  const fmt = (v: number) => formatMoney(v, settings.primaryDisplayCurrency)
  const gap = finalGap(points)

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <h2 className="text-2xl font-bold mb-0.5" style={{ color: theme.navy }}>{line.chartTitle || d.heading || '資產成長折線比較'}</h2>
      {line.chartDescription && <p className="text-xs text-zeta-text/60 mb-2">{line.chartDescription}</p>}
      <div className="w-16 h-[3px] mb-2" style={{ backgroundColor: theme.gold }} />

      {points.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-zeta-text/40">尚未輸入任何時間點資料</div>
      ) : (
        <div className="flex-1 flex gap-3 min-h-0">
          <div className="flex-1 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid stroke="#E8DCCB" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#333333' }} />
                <YAxis tick={{ fontSize: 10, fill: '#333333' }} tickFormatter={(v) => fmt(Number(v))} width={70} />
                <Tooltip formatter={(v: any) => fmt(Number(v))} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {line.showTarget && (
                  <ReferenceLine y={line.targetAmount} stroke={line.targetColor} strokeDasharray="6 4" label={{ value: '目標', fontSize: 10, fill: line.targetColor }} />
                )}
                <Line type="monotone" dataKey="beforeAmount" name={line.beforeName} stroke={line.beforeColor} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={!useIsExportRender()} label={line.showDataLabels ? { fontSize: 9, position: 'top' } : undefined} />
                <Line type="monotone" dataKey="afterAmount" name={line.afterName} stroke={line.afterColor} strokeWidth={3} dot={{ r: 3 }} isAnimationActive={!useIsExportRender()} label={line.showDataLabels ? { fontSize: 9, position: 'top' } : undefined} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="w-40 shrink-0 flex flex-col gap-2 justify-center">
            <div className="bg-white rounded-card shadow-soft p-2.5">
              <div className="text-[10px] text-zeta-text/50">最終差距</div>
              <div className="text-base font-bold" style={{ color: gap >= 0 ? theme.positive : theme.danger }}>{gap >= 0 ? '+' : ''}{fmt(gap)}</div>
            </div>
            {line.showTarget && (
              <div className="bg-white rounded-card shadow-soft p-2.5">
                <div className="text-[10px] text-zeta-text/50">目標資產</div>
                <div className="text-base font-bold" style={{ color: line.targetColor }}>{fmt(line.targetAmount)}</div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="text-[9px] text-zeta-text/40 mt-1">以上為假設報酬率試算，不代表保證收益。換算金額依設定匯率估算，實際金額可能因匯率變動而不同。</div>
    </div>
  )
}
