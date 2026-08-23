import type { AssetItem, LineComparisonData, LineComparisonPoint } from '../types'
import { newId } from './idGenerator'

/**
 * 自動試算折線比較資料點。
 *
 * 逐項報酬率模型（每項資產工具可以有自己的成長利率）：
 * - 本金部分：Before/After 各自的資產項目清單（來自同一頁「資產配置」區塊的
 *   beforeItems／afterItems）分別複利成長，每個項目使用自己的
 *   `annualReturnRate`；未個別設定時，退回使用該側的預設報酬率
 *   （beforeAnnualReturnRate／afterAnnualReturnRate）。
 * - 投入金額部分：視為與個別工具分開的「定期投入」資金流，用該側的預設報酬率
 *   複利成長（因為新增的投入資金通常還沒被歸類到特定工具）。
 * - 兩者相加得到每個時間點的 Before／After 總額。
 * - 非複利（簡單利息）模式：本金以「原始金額 × 年利率 × 期數」線性增加，
 *   投入金額本身不再複利滾入下一期的利息計算。
 * - 目標線：使用者輸入的單一「目標資產金額」，在圖表上以水平參考線呈現於每一個時間點。
 *
 * 若沒有提供任何資產項目（例如舊資料或尚未在頁面中新增項目），退回使用
 * `startAmount` 作為單一本金、套用該側的預設報酬率計算，維持向下相容。
 */
export function computeAutoLineComparisonPoints(
  data: LineComparisonData,
  beforeItems: AssetItem[] = [],
  afterItems: AssetItem[] = []
): LineComparisonPoint[] {
  const periods = Math.max(0, Math.floor(data.periods))
  const periodsPerYear = data.timeUnit === 'year' ? 1 : 12
  const beforeVisible = beforeItems.filter((i) => i.visible)
  const afterVisible = afterItems.filter((i) => i.visible)

  const principalAt = (items: AssetItem[], defaultRate: number, t: number): number => {
    if (items.length === 0) return 0
    return items.reduce((sum, item) => {
      const rate = (item.annualReturnRate ?? defaultRate) / 100 / periodsPerYear
      const amount = Math.max(0, item.amount)
      if (data.useCompound) return sum + amount * Math.pow(1 + rate, t)
      return sum + amount + amount * rate * t
    }, 0)
  }

  const contributionAt = (defaultRate: number, t: number): number => {
    if (data.contributionAmount === 0) return 0
    const rate = defaultRate / 100 / periodsPerYear
    if (!data.useCompound) return data.contributionAmount * t
    // 每期定期投入複利：期末投入，逐期滾入
    let total = 0
    for (let i = 0; i < t; i++) total = total * (1 + rate) + data.contributionAmount
    return total
  }

  const points: LineComparisonPoint[] = []
  const hasItems = beforeVisible.length > 0 || afterVisible.length > 0

  for (let t = 0; t <= periods; t++) {
    const before = hasItems
      ? principalAt(beforeVisible, data.beforeAnnualReturnRate, t) + contributionAt(data.beforeAnnualReturnRate, t)
      : computeFallback(data.startAmount, data.beforeAnnualReturnRate, data, periodsPerYear, t)
    const after = hasItems
      ? principalAt(afterVisible, data.afterAnnualReturnRate, t) + contributionAt(data.afterAnnualReturnRate, t)
      : computeFallback(data.startAmount, data.afterAnnualReturnRate, data, periodsPerYear, t)

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

function computeFallback(startAmount: number, rate: number, data: LineComparisonData, periodsPerYear: number, t: number): number {
  const ratePerPeriod = rate / 100 / periodsPerYear
  if (data.useCompound) {
    let v = startAmount
    for (let i = 0; i < t; i++) v = v * (1 + ratePerPeriod) + data.contributionAmount
    return v
  }
  return startAmount + startAmount * ratePerPeriod * t + data.contributionAmount * t
}

function timeLabel(data: LineComparisonData, t: number): string {
  if (data.timeUnit === 'year') return `第 ${t} 年`
  if (data.timeUnit === 'month') return `第 ${t} 月`
  return `${data.customUnitLabel || '期'} ${t}`
}

/** 依模式回傳實際要繪製的資料點：自動模式即時計算（可逐項報酬率），手動模式直接使用使用者輸入的 points */
export function resolveLineComparisonPoints(data: LineComparisonData, beforeItems: AssetItem[] = [], afterItems: AssetItem[] = []): LineComparisonPoint[] {
  if (data.mode === 'auto') return computeAutoLineComparisonPoints(data, beforeItems, afterItems)
  return data.points
}

export function finalGap(points: LineComparisonPoint[]): number {
  if (points.length === 0) return 0
  const last = points[points.length - 1]
  return last.afterAmount - last.beforeAmount
}
