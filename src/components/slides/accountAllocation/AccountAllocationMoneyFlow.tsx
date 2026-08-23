import React from 'react'
import type { AccountAllocationData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { buildMoneyFlowLayout, computeAllocationSummary } from '../../../services/accountAllocationLayout'
import { currencyLabel } from '../../../export/pptxHelpers'
import { AllocationSummaryBadge } from './AllocationSummaryBadge'

interface Props {
  slide: ProposalSlide<AccountAllocationData>
  theme: ZetaTheme
}

const VB_W = 1000
const VB_H = 480

/** 模板A｜資金流向圖：左側總收入，線條粗細依金額比例分流到中間大項目，右側小項目 */
export function AccountAllocationMoneyFlow({ slide, theme }: Props) {
  const d = slide.data
  const layout = buildMoneyFlowLayout(d, VB_W, VB_H)
  const summary = computeAllocationSummary(d)
  const fmt = (v: number) => `${currencyLabel(d.currency, d.customCurrencyLabel)}${Math.round(v).toLocaleString('zh-Hant-TW')}`

  return (
    <div className="w-full h-full p-[3%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold" style={{ color: theme.navy }}>{d.heading || '收入與帳戶分配圖'}</h2>
        <AllocationSummaryBadge summary={summary} fmt={fmt} theme={theme} />
      </div>
      <div className="w-16 h-[3px] mb-2" style={{ backgroundColor: theme.gold }} />

      <div className="flex-1 min-h-0">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full">
          {layout.edgesIncomeToCategory.map((e, i) => (
            <path
              key={i}
              d={`M ${e.x1} ${e.y1} C ${(e.x1 + e.x2) / 2} ${e.y1}, ${(e.x1 + e.x2) / 2} ${e.y2}, ${e.x2} ${e.y2}`}
              stroke={e.color}
              strokeWidth={e.strokeWidth}
              fill="none"
              opacity={0.55}
              strokeLinecap="round"
            />
          ))}

          <rect x={layout.income.x} y={layout.income.y} width={layout.income.w} height={layout.income.h} rx={10} fill={theme.navy} />
          <text x={layout.income.x + layout.income.w / 2} y={layout.income.y + layout.income.h / 2 - 6} textAnchor="middle" fontSize="13" fill="#FFFFFF" fontWeight="bold">
            {layout.income.label}
          </text>
          <text x={layout.income.x + layout.income.w / 2} y={layout.income.y + layout.income.h / 2 + 14} textAnchor="middle" fontSize="12" fill={theme.gold}>
            {fmt(d.totalIncome)}
          </text>

          {layout.categories.map((box) => (
            <g key={box.label}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} fill="#FFFFFF" stroke={box.color} strokeWidth={1.5} />
              <rect x={box.x} y={box.y} width={5} height={box.h} rx={2} fill={box.color} />
              <text x={box.x + 14} y={box.y + box.h / 2 - 6} fontSize="12" fontWeight="bold" fill={theme.navy}>{box.label}</text>
              <text x={box.x + 14} y={box.y + box.h / 2 + 12} fontSize="11" fill={box.color}>{fmt(box.amount)}（{box.pct.toFixed(1)}%）</text>
            </g>
          ))}

          {layout.subItems.map((sub, i) => (
            <g key={i}>
              <rect x={sub.x} y={sub.y} width={sub.w} height={sub.h} rx={4} fill={theme.ivory} stroke={sub.color} strokeOpacity={0.4} strokeWidth={1} />
              <text x={sub.x + 8} y={sub.y + sub.h / 2 + 4} fontSize="10.5" fill={theme.text}>
                {sub.label}　{fmt(sub.amount)}（{sub.pct.toFixed(0)}%）
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
