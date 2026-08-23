import React from 'react'
import type { AccountAllocationData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { computeAllocationSummary } from '../../../services/accountAllocationLayout'
import { currencyLabel } from '../../../export/pptxHelpers'
import { AllocationSummaryBadge } from './AllocationSummaryBadge'

interface Props {
  slide: ProposalSlide<AccountAllocationData>
  theme: ZetaTheme
}

/** 模板C｜分配卡片圖：上方總收入與已分配比例，下方多張大項目卡片（含小項目與進度條），適合手機閱讀 */
export function AccountAllocationCards({ slide, theme }: Props) {
  const d = slide.data
  const summary = computeAllocationSummary(d)
  const fmt = (v: number) => `${currencyLabel(d.currency, d.customCurrencyLabel)}${Math.round(v).toLocaleString('zh-Hant-TW')}`
  const visible = d.categories.filter((c) => c.visible)
  const allocatedPct = d.totalIncome > 0 ? Math.min(100, (summary.allocatedTotal / d.totalIncome) * 100) : 0

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold" style={{ color: theme.navy }}>{d.heading || '收入與帳戶分配圖'}</h2>
        <AllocationSummaryBadge summary={summary} fmt={fmt} theme={theme} />
      </div>
      <div className="w-16 h-[3px] mb-3" style={{ backgroundColor: theme.gold }} />

      <div className="rounded-card p-3 mb-3 text-white flex items-center justify-between" style={{ backgroundColor: theme.navy }}>
        <div>
          <div className="text-[10px] opacity-70">總收入</div>
          <div className="text-xl font-bold" style={{ color: theme.gold }}>{fmt(d.totalIncome)}</div>
        </div>
        <div className="flex-1 mx-4 h-2 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${allocatedPct}%`, backgroundColor: theme.gold }} />
        </div>
        <div className="text-xs">{allocatedPct.toFixed(0)}% 已分配</div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-2.5 content-start overflow-hidden">
        {visible.map((cat) => {
          const pct = d.totalIncome > 0 ? (Math.max(0, cat.amount) / d.totalIncome) * 100 : 0
          return (
            <div key={cat.id} className="bg-white rounded-card shadow-soft p-2.5 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold truncate" style={{ color: theme.navy }}>{cat.name}</span>
                <span className="text-[10px]" style={{ color: cat.color }}>{pct.toFixed(0)}%</span>
              </div>
              {d.showAmount && <div className="text-sm font-bold mb-1" style={{ color: cat.color }}>{fmt(cat.amount)}</div>}
              <div className="h-1.5 rounded-full bg-zeta-bg overflow-hidden mb-1.5">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: cat.color }} />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {cat.subItems.filter((s) => s.visible).slice(0, 4).map((sub) => (
                  <div key={sub.id} className="text-[9.5px] text-zeta-text/70 flex justify-between">
                    <span className="truncate">{sub.name}</span>
                    {d.showAmount && <span className="shrink-0 ml-1">{fmt(sub.amount)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
