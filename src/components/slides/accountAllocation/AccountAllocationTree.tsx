import React from 'react'
import type { AccountAllocationData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { buildTreeLayout, computeAllocationSummary } from '../../../services/accountAllocationLayout'
import { currencyLabel } from '../../../export/pptxHelpers'
import { AllocationSummaryBadge } from './AllocationSummaryBadge'

interface Props {
  slide: ProposalSlide<AccountAllocationData>
  theme: ZetaTheme
}

const VB_W = 1000
const VB_H = 420

/** 模板B｜樹狀帳戶圖：由上到下三層樹狀結構（總收入 → 大項目 → 小項目），適合項目較多的提案 */
export function AccountAllocationTree({ slide, theme }: Props) {
  const d = slide.data
  const layout = buildTreeLayout(d, VB_W, VB_H)
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
          {layout.edgesRootToLevel2.map((e, i) => (
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={e.color} strokeWidth={e.strokeWidth} opacity={0.6} />
          ))}
          {layout.edgesLevel2ToLevel3.map((e, i) => (
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={e.color} strokeWidth={e.strokeWidth} opacity={0.45} />
          ))}

          <rect x={layout.root.x} y={layout.root.y} width={layout.root.w} height={layout.root.h} rx={10} fill={theme.navy} />
          <text x={layout.root.x + layout.root.w / 2} y={layout.root.y + layout.root.h / 2 - 4} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#FFFFFF">總收入</text>
          <text x={layout.root.x + layout.root.w / 2} y={layout.root.y + layout.root.h / 2 + 14} textAnchor="middle" fontSize="11" fill={theme.gold}>{fmt(d.totalIncome)}</text>

          {layout.level2.map((box) => (
            <g key={box.label}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} fill={box.color} />
              <text x={box.x + box.w / 2} y={box.y + box.h / 2 - 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#FFFFFF">{box.label}</text>
              <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 13} textAnchor="middle" fontSize="10.5" fill="#FFFFFF" opacity={0.9}>{fmt(box.amount)}（{box.pct.toFixed(0)}%）</text>
            </g>
          ))}

          {layout.level3.map((box, i) => (
            <g key={i}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={6} fill="#FFFFFF" stroke={box.color} strokeWidth={1.2} />
              <text x={box.x + box.w / 2} y={box.y + box.h / 2 - 4} textAnchor="middle" fontSize="9.5" fontWeight="600" fill={theme.navy}>{box.label}</text>
              <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 11} textAnchor="middle" fontSize="9" fill={box.color}>{fmt(box.amount)}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
