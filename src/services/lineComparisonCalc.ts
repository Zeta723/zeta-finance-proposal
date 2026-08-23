import type { LineComparisonData, LineComparisonPoint } from '../types'
import { newId } from './idGenerator'

/**
 * 自動試算折線比較資料點。
 *
 * 假設（因規格未完全定義計算細節，明確記錄以下假設）：
 * - 「每月或每年投入金額」在調整前與調整後兩條線都會套用（差異只在報酬率）。
 * - 複利：每期先套用報酬率、再加上投入金額（期末投入）。
 * - 非複利（簡單利息）：以起始資產為本金，每期線性增加「本金 × 年利率 / 每年期數」的利息，
 *   投入金額本身不再複利滾入下一期的利息計算。
 * - 目標線：使用者輸入的單一「目標資產金額」，在圖表上以水平參考線呈現於每一個時間點。
 */
export function computeAutoLineComparisonPoints(data: LineComparisonData): LineComparisonPoint[] {
  const periods = Math.max(0, Math.floor(data.periods))
  const periodsPerYear = data.timeUnit === 'year' ? 1 : 12
  const beforeRatePerPeriod = data.beforeAnnualReturnRate / 100 / periodsPerYear
  const afterRatePerPeriod = data.afterAnnualReturnRate / 100 / periodsPerYear

  const points: LineComparisonPoint[] = []
  let before = data.startAmount
  let after = data.startAmount

  for (let t = 0; t <= periods; t++) {
    if (t === 0) {
      before = data.startAmount
      after = data.startAmount
    } else if (data.useCompound) {
      before = before * (1 + beforeRatePerPeriod) + data.contributionAmount
      after = after * (1 + afterRatePerPeriod) + data.contributionAmount
    } else {
      before = data.startAmount + data.startAmount * beforeRatePerPeriod * t + data.contributionAmount * t
      after = data.startAmount + data.startAmount * afterRatePerPeriod * t + data.contributionAmount * t
    }

    points.push({
      id: newId(),
      label: timeLabel(data, t),
      beforeAmount: Math.round(before),
      afterAmount: Math.round(after),
      targetAmount: data.showTarget ? data.targetAmount : undefined
    })
  }

  return points
}

function timeLabel(data: LineComparisonData, t: number): string {
  if (data.timeUnit === 'year') return `第 ${t} 年`
  if (data.timeUnit === 'month') return `第 ${t} 月`
  return `${data.customUnitLabel || '期'} ${t}`
}

/** 依模式回傳實際要繪製的資料點：自動模式即時計算，手動模式直接使用使用者輸入的 points */
export function resolveLineComparisonPoints(data: LineComparisonData): LineComparisonPoint[] {
  if (data.mode === 'auto') return computeAutoLineComparisonPoints(data)
  return data.points
}

export function finalGap(points: LineComparisonPoint[]): number {
  if (points.length === 0) return 0
  const last = points[points.length - 1]
  return last.afterAmount - last.beforeAmount
}
