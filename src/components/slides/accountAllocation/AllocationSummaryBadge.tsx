import React from 'react'
import type { ZetaTheme } from '../../../styles/theme'
import type { AllocationSummary } from '../../../services/accountAllocationLayout'

/** 尚未分配／超額分配提示徽章，兩種情況都不視為錯誤，僅提示 */
export function AllocationSummaryBadge({ summary, fmt, theme }: { summary: AllocationSummary; fmt: (v: number) => string; theme: ZetaTheme }) {
  if (summary.unallocated > 0) {
    return (
      <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: theme.cream, color: theme.navy }}>
        尚有 {fmt(summary.unallocated)} 未分配
      </span>
    )
  }
  if (summary.overAllocated > 0) {
    return (
      <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: theme.danger, color: '#FFFFFF' }}>
        目前超額分配 {fmt(summary.overAllocated)}
      </span>
    )
  }
  return (
    <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: theme.positive, color: '#FFFFFF' }}>
      已完全分配
    </span>
  )
}
