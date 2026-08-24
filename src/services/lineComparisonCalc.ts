import type { AssetItem, CurrencySettings, LineComparisonData, LineComparisonPoint } from '../types'
import { defaultCurrencySettings } from '../types'
import { newId } from './idGenerator'
import { toDisplayCurrencyValue } from './currencyService'

/**
 * 自動試算折線比較資料點。
 *
 * 逐項試算模型（每項資產工具完全獨立設定）：
 * - 每個資產項目（來自「調整前/調整後資產項目」清單）都有自己的：
 *   目前資產金額＋幣別、投入方式（單筆／每月／每年）、投入金額＋幣別、
 *   投入年限、年化報酬率 —— 彼此互不影響，也不共用同一組假設。
 * - 金額計算前，先把「目前資產金額」與「投入金額」都換算成統一的主要顯示幣別
 *   （CurrencySettings.primaryDisplayCurrency），避免把美元數字和台幣數字直接相加。
 * - 單筆投入：只在第 0 期計入本金，之後純複利／單利成長，不再新增投入。
 * - 每年／每月投入：投入年限內每期持續投入；超過投入年限後不再新增投入，
 *   但既有金額依報酬率持續成長到試算期數結束。
 * - 沒有設定 annualReturnRate 的項目，退回使用該側（調整前/調整後）的預設報酬率。
 *
 * 若沒有提供任何資產項目（例如舊資料或尚未在頁面中新增項目），退回使用
 * `startAmount` 作為單一本金、套用該側的預設報酬率計算，維持向下相容。
 */
export function computeAutoLineComparisonPoints(
  data: LineComparisonData,
  beforeItems: AssetItem[] = [],
  afterItems: AssetItem[] = [],
  currencySettings: CurrencySettings = defaultCurrencySettings()
): LineComparisonPoint[] {
  const periods = Math.max(0, Math.floor(data.periods))
  const periodsPerYear = data.timeUnit === 'year' ? 1 : 12
  const beforeVisible = beforeItems.filter((i) => i.visible)
  const afterVisible = afterItems.filter((i) => i.visible)

  const itemValueAt = (item: AssetItem, defaultRate: number, t: number): number => {
    const rate = (item.annualReturnRate ?? defaultRate) / 100 / periodsPerYear
    const mode = item.contributionMode ?? 'lumpSum'
    const baseAmount = toDisplayCurrencyValue(Math.max(0, item.amount), item.currency ?? 'TWD', currencySettings)

    if (mode === 'lumpSum') {
      return data.useCompound ? baseAmount * Math.pow(1 + rate, t) : baseAmount + baseAmount * rate * t
    }

    const contributionPeriods = Math.max(0, item.contributionYears ?? 0) * (mode === 'monthly' ? 12 : 1)
    const periodicAmount = toDisplayCurrencyValue(Math.max(0, item.periodicAmount ?? 0), item.periodicCurrency ?? item.currency ?? 'TWD', currencySettings)

    if (data.useCompound) {
      let v = baseAmount
      for (let i = 1; i <= t; i++) v = v * (1 + rate) + (i <= contributionPeriods ? periodicAmount : 0)
      return v
    }
    return baseAmount + baseAmount * rate * t + periodicAmount * Math.min(t, contributionPeriods)
  }

  const principalAt = (items: AssetItem[], defaultRate: number, t: number): number => {
    if (items.length === 0) return 0
    return items.reduce((sum, item) => sum + itemValueAt(item, defaultRate, t), 0)
  }

  const points: LineComparisonPoint[] = []
  const hasItems = beforeVisible.length > 0 || afterVisible.length > 0

  for (let t = 0; t <= periods; t++) {
    const before = hasItems
      ? principalAt(beforeVisible, data.beforeAnnualReturnRate, t)
      : computeFallback(data.startAmount, data.beforeAnnualReturnRate, data, periodsPerYear, t)
    const after = hasItems
      ? principalAt(afterVisible, data.afterAnnualReturnRate, t)
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

/** 依模式回傳實際要繪製的資料點：自動模式即時計算（逐項試算＋幣別換算），手動模式直接使用使用者輸入的 points */
export function resolveLineComparisonPoints(
  data: LineComparisonData,
  beforeItems: AssetItem[] = [],
  afterItems: AssetItem[] = [],
  currencySettings?: CurrencySettings
): LineComparisonPoint[] {
  if (data.mode === 'auto') return computeAutoLineComparisonPoints(data, beforeItems, afterItems, currencySettings)
  return data.points
}

export function finalGap(points: LineComparisonPoint[]): number {
  if (points.length === 0) return 0
  const last = points[points.length - 1]
  return last.afterAmount - last.beforeAmount
}
