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

/** 模板B｜上圖下卡片：上方大字總資產＋居中圖表，下方橫向資產卡片列，適合快速閱讀重點 */
export function AssetAllocationTopTotalBottomChart({ slide, theme }: Props) {
  const d = slide.data
  const visible = d.items.filter((i) => i.visible)
  const total = visible.reduce((s, i) => s + Math.max(0, i.amount), 0)
  const fmt = (v: number) => `${currencyLabel(d.currency, d.customCurrencyLabel)}${v.toLocaleString('zh-Hant-TW')}`

  return (
    <div className="w-full h-full p-[4%] flex flex-col items-center" style={{ backgroundColor: theme.bgPrimary }}>
      <h2 className="text-xl font-bold mb-0.5" style={{ color: theme.navy }}>{d.heading || '資產配置'}</h2>
      <div className="text-[11px] text-zeta-text/50">總資產</div>
      <div className="text-4xl font-bold mb-2" style={{ color: theme.navy }}>{fmt(total)}</div>

      <div className="w-40 h-40 shrink-0 mb-3">
        {total <= 0 ? (
          <div className="w-full h-full flex items-center justify-center text-zeta-text/40 text-xs">尚未輸入資產金額</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={visible} dataKey="amount" nameKey="name" innerRadius="60%" outerRadius="95%" paddingAngle={1} isAnimationActive={!useIsExportRender()}>
                {visible.map((item, i) => <Cell key={i} fill={item.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="w-full flex-1 flex gap-3 items-stretch overflow-hidden">
        {visible.map((item) => {
          const pct = total > 0 ? ((Math.max(0, item.amount) / total) * 100).toFixed(1) : '0.0'
          return (
            <div key={item.id} className="flex-1 bg-white rounded-card shadow-soft px-3 py-2.5 flex flex-col justify-center border-l-4" style={{ borderColor: item.color }}>
              <div className="text-[10px] text-zeta-text/60 truncate">{item.name}</div>
              {d.showAmount && <div className="text-sm font-bold" style={{ color: theme.navy }}>{fmt(item.amount)}</div>}
              {d.showPercentage && <div className="text-[10px]" style={{ color: item.color }}>{pct}%</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
