import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { useIsExportRender } from '../../../export/ExportRenderContext'
import type { AssetAllocationData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { currencyLabel } from '../../../export/pptxHelpers'

interface Props {
  slide: ProposalSlide<AssetAllocationData>
  theme: ZetaTheme
}

/** 模板A｜左圖右表：上方總資產標示，左側大型環形/圓餅圖，右側完整明細表 */
export function AssetAllocationLeftChartRightTable({ slide, theme }: Props) {
  const d = slide.data
  const visible = d.items.filter((i) => i.visible)
  const total = visible.reduce((s, i) => s + Math.max(0, i.amount), 0)
  const fmt = (v: number) => `${currencyLabel(d.currency, d.customCurrencyLabel)}${v.toLocaleString('zh-Hant-TW')}`

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-2xl font-bold" style={{ color: theme.navy }}>{d.heading || '資產配置'}</h2>
        <div className="text-right">
          <div className="text-[10px] text-zeta-text/50">總資產</div>
          <div className="text-xl font-bold" style={{ color: theme.navy }}>{fmt(total)}</div>
        </div>
      </div>
      <div className="w-16 h-[3px] mb-4" style={{ backgroundColor: theme.gold }} />

      <div className="flex-1 flex gap-8 items-center">
        <div className="w-[45%] h-full">
          {total <= 0 ? (
            <div className="w-full h-full flex items-center justify-center text-zeta-text/40 text-sm">尚未輸入資產金額</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={visible} dataKey="amount" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={1} isAnimationActive={!useIsExportRender()}>
                  {visible.map((item, i) => <Cell key={i} fill={item.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex-1 text-sm">
          <div className="grid grid-cols-3 gap-2 pb-1 mb-1 border-b border-zeta-cream font-semibold text-zeta-navy">
            <span>項目</span>
            {d.showAmount && <span className="text-right">金額</span>}
            {d.showPercentage && <span className="text-right">占比</span>}
          </div>
          {visible.map((item) => {
            const pct = total > 0 ? ((Math.max(0, item.amount) / total) * 100).toFixed(1) : '0.0'
            return (
              <div key={item.id} className="grid grid-cols-3 gap-2 py-1.5 items-center border-b border-zeta-bg/60">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                {d.showAmount && <span className="text-right">{fmt(item.amount)}</span>}
                {d.showPercentage && <span className="text-right">{pct}%</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
