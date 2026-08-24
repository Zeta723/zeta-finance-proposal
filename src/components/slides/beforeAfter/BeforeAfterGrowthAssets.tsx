import React from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useIsExportRender } from '../../../export/ExportRenderContext'
import type { BeforeAfterData, CurrencySettings, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { formatMoney } from '../../../services/currencyService'
import { computeAllGrowthAssetSeries, maxTotalYears } from '../../../services/growthAssetCalc'
import { defaultLineComparisonData } from '../../../data/slideDefaults'
import { defaultCurrencySettings } from '../../../types'

interface Props {
  slide: ProposalSlide<BeforeAfterData>
  theme: ZetaTheme
  currencySettings?: CurrencySettings
}

/** 多項資產獨立試算折線圖：每一項資產各自的投入條件、報酬率、試算年數都不同 */
export function BeforeAfterGrowthAssets({ slide, theme, currencySettings }: Props) {
  const d = slide.data
  const line = d.lineComparison ?? defaultLineComparisonData()
  const settings = currencySettings ?? defaultCurrencySettings()
  const assets = line.growthAssets ?? []
  const series = computeAllGrowthAssetSeries(assets, settings)
  const maxYears = maxTotalYears(assets)
  const isExport = useIsExportRender()

  const fmt = (v: number) => formatMoney(v, settings.primaryDisplayCurrency)

  // 合併成 Recharts 需要的單一陣列：每年一筆，各資產各自的欄位（超過自己試算年限時省略，讓線自然停止）
  const chartData = Array.from({ length: maxYears + 1 }, (_, year) => {
    const row: Record<string, number | string> = { year: line.timeUnit === 'year' ? `第${year}年` : `${year}` }
    series.forEach((s) => {
      const point = s.points.find((p) => p.year === year)
      if (point) row[s.asset.id] = point.value
    })
    return row
  })

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <h2 className="text-2xl font-bold mb-0.5" style={{ color: theme.navy }}>{line.chartTitle || d.heading || '資產成長比較'}</h2>
      {line.chartDescription && <p className="text-xs text-zeta-text/60 mb-2">{line.chartDescription}</p>}
      <div className="w-16 h-[3px] mb-2" style={{ backgroundColor: theme.gold }} />

      {series.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-zeta-text/40">尚未新增任何資產試算項目</div>
      ) : (
        <div className="flex-1 flex gap-3 min-h-0">
          <div className="flex-1 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid stroke="#E8DCCB" strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#333333' }} />
                <YAxis tick={{ fontSize: 10, fill: '#333333' }} tickFormatter={(v) => fmt(Number(v))} width={70} />
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  formatter={(value: any, name: any) => {
                    const s = series.find((x) => x.asset.id === name)
                    return [fmt(Number(value)), s?.asset.name ?? name]
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value: string) => series.find((s) => s.asset.id === value)?.asset.name ?? value}
                />
                {line.showTarget && (
                  <ReferenceLine y={line.targetAmount} stroke={line.targetColor} strokeDasharray="6 4" label={{ value: '目標', fontSize: 10, fill: line.targetColor }} />
                )}
                {series.map((s) => (
                  <Line
                    key={s.asset.id}
                    type="monotone"
                    dataKey={s.asset.id}
                    name={s.asset.id}
                    stroke={s.asset.color}
                    strokeWidth={2.5}
                    dot={{ r: 2.5 }}
                    connectNulls={false}
                    isAnimationActive={!isExport}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="w-44 shrink-0 flex flex-col gap-1.5 justify-center overflow-hidden">
            {series.slice(0, 4).map((s) => (
              <div key={s.asset.id} className="bg-white rounded-card shadow-soft p-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.asset.color }} />
                  <span className="text-[10px] text-zeta-text/60 truncate">{s.asset.name}</span>
                </div>
                <div className="text-sm font-bold" style={{ color: s.asset.color }}>{fmt(s.finalValue)}</div>
                <div className="text-[9px] text-zeta-positive">增值 {fmt(s.estimatedGain)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="text-[9px] text-zeta-text/40 mt-1">以上為假設報酬率試算，不代表保證收益或實際商品利益。換算金額依設定匯率估算，實際金額可能因匯率變動而不同。</div>
    </div>
  )
}
