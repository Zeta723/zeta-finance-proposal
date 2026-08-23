import React from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useIsExportRender } from '../../../export/ExportRenderContext'
import type { AssetAllocationData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { currencyLabel } from '../../../export/pptxHelpers'

interface Props {
  slide: ProposalSlide<AssetAllocationData>
  theme: ZetaTheme
}

/**
 * 模板C｜數據儀表板：左上總資產、右上最大資產類別，下方長條圖＋資產卡片群，
 * 整體呈現財務Dashboard的四象限資訊結構，與模板A/B皆不使用圓餅圖，改用長條圖為主視覺。
 */
export function AssetAllocationDashboard({ slide, theme }: Props) {
  const d = slide.data
  const visible = d.items.filter((i) => i.visible)
  const total = visible.reduce((s, i) => s + Math.max(0, i.amount), 0)
  const fmt = (v: number) => `${currencyLabel(d.currency, d.customCurrencyLabel)}${v.toLocaleString('zh-Hant-TW')}`
  const largest = visible.reduce((max, i) => (i.amount > (max?.amount ?? -Infinity) ? i : max), visible[0])
  const largestPct = largest && total > 0 ? ((Math.max(0, largest.amount) / total) * 100).toFixed(1) : '0.0'

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <h2 className="text-lg font-bold mb-2" style={{ color: theme.navy }}>{d.heading || '資產配置'}</h2>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-card p-3 text-white" style={{ backgroundColor: theme.navy }}>
          <div className="text-[10px] opacity-70">總資產</div>
          <div className="text-2xl font-bold" style={{ color: theme.gold }}>{fmt(total)}</div>
        </div>
        <div className="rounded-card p-3 bg-white shadow-soft">
          <div className="text-[10px] text-zeta-text/50">最大資產類別</div>
          {largest ? (
            <>
              <div className="text-lg font-bold flex items-center gap-1.5" style={{ color: theme.navy }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: largest.color }} />
                {largest.name}
              </div>
              <div className="text-xs" style={{ color: largest.color }}>{fmt(largest.amount)}（{largestPct}%）</div>
            </>
          ) : (
            <div className="text-xs text-zeta-text/40">尚無資料</div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-card shadow-soft p-3 flex gap-3 min-h-0">
        <div className="w-1/2 h-full">
          {total <= 0 ? (
            <div className="w-full h-full flex items-center justify-center text-zeta-text/40 text-xs">尚未輸入資產金額</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visible} layout="vertical" margin={{ left: 4, right: 12 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={64} tick={{ fontSize: 10 }} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} isAnimationActive={!useIsExportRender()}>
                  {visible.map((item, i) => <Cell key={i} fill={item.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="w-1/2 grid grid-cols-2 gap-2 content-start overflow-hidden">
          {visible.map((item) => {
            const pct = total > 0 ? ((Math.max(0, item.amount) / total) * 100).toFixed(1) : '0.0'
            return (
              <div key={item.id} className="rounded-lg px-2 py-1.5 text-[10px]" style={{ backgroundColor: theme.bgSecondary === theme.white ? '#F3F4F6' : theme.ivory }}>
                <div className="truncate text-zeta-text/70">{item.name}</div>
                {d.showAmount && <div className="font-semibold" style={{ color: theme.navy }}>{fmt(item.amount)}</div>}
                {d.showPercentage && <div style={{ color: item.color }}>{pct}%</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
