import type { CurrencySettings, GrowthAsset } from '../types'
import { toDisplayCurrencyValue } from './currencyService'

export interface GrowthAssetYearPoint {
  year: number
  /** 當年度新增投入（換算成顯示幣別） */
  contributionThisYear: number
  /** 累積投入本金（換算成顯示幣別） */
  cumulativeContribution: number
  /** 當年度預估價值（換算成顯示幣別） */
  value: number
}

export interface GrowthAssetSeries {
  asset: GrowthAsset
  points: GrowthAssetYearPoint[]
  finalValue: number
  totalContribution: number
  estimatedGain: number
}

/**
 * 計算單一資產項目逐年（第 0 年到 asset.totalYears）的投入與價值序列。
 *
 * 假設（因商品計算方式各異，明確記錄於此）：
 * - 單筆投入（lumpSum）：只在第 0 年（或 startYearOffset 那一年）投入一次，之後純複利成長。
 * - 每年投入（annual）：採「年初投入」假設 —— 每年年初投入後，當年即開始計息，
 *   投入期間為 contributionYears 年；超過後不再投入，但本金依報酬率持續複利到 totalYears。
 * - 每月投入（monthly）：依年化報酬率換算成月報酬率（rate/12），逐月計算，
 *   換算回每年的期末餘額呈現在年度序列中；投入期間同樣是 contributionYears 年（換算為月）。
 * - 「投入年數」與「試算總年數」分開：投入年數決定何時停止新增投入，
 *   試算總年數決定圖表與最終結果算到第幾年。
 */
export function computeGrowthAssetSeries(asset: GrowthAsset, settings: CurrencySettings): GrowthAssetSeries {
  const points: GrowthAssetYearPoint[] = []
  const annualRate = asset.annualReturnRate / 100

  let cumulativeContribution = 0
  let value = 0

  const toDisplay = (v: number) => toDisplayCurrencyValue(v, asset.currency, settings)

  if (asset.contributionMode === 'monthly') {
    // 以月為單位試算，逐月複利，年底取值放進年度序列
    const monthlyRate = annualRate / 12
    let monthValue = 0
    const contributionMonths = asset.contributionYears * 12
    const totalMonths = asset.totalYears * 12
    let monthlyContribThisYear = 0

    for (let m = 1; m <= totalMonths; m++) {
      const stillContributing = m <= contributionMonths
      if (stillContributing) {
        monthValue = monthValue * (1 + monthlyRate) + asset.periodicAmount
        cumulativeContribution += asset.periodicAmount
        monthlyContribThisYear += asset.periodicAmount
      } else {
        monthValue = monthValue * (1 + monthlyRate)
      }
      if (m % 12 === 0) {
        const year = m / 12
        points.push({
          year,
          contributionThisYear: toDisplay(monthlyContribThisYear),
          cumulativeContribution: toDisplay(cumulativeContribution),
          value: toDisplay(monthValue)
        })
        monthlyContribThisYear = 0
      }
    }
    points.unshift({ year: 0, contributionThisYear: 0, cumulativeContribution: 0, value: 0 })
    value = monthValue
  } else {
    for (let year = 0; year <= asset.totalYears; year++) {
      let contributionThisYear = 0
      if (year === 0) {
        if (asset.contributionMode === 'lumpSum') {
          value = asset.initialAmount
          cumulativeContribution = asset.initialAmount
          contributionThisYear = asset.initialAmount
        } else if (asset.contributionMode === 'annual' && asset.contributionYears > 0) {
          value = asset.periodicAmount
          cumulativeContribution = asset.periodicAmount
          contributionThisYear = asset.periodicAmount
        }
      } else if (asset.contributionMode === 'annual') {
        const stillContributing = year <= asset.contributionYears
        value = value * (1 + annualRate) + (stillContributing ? asset.periodicAmount : 0)
        if (stillContributing) {
          cumulativeContribution += asset.periodicAmount
          contributionThisYear = asset.periodicAmount
        }
      } else {
        // lumpSum：純複利成長，不再新增投入
        value = value * (1 + annualRate)
      }

      points.push({
        year,
        contributionThisYear: toDisplay(contributionThisYear),
        cumulativeContribution: toDisplay(cumulativeContribution),
        value: toDisplay(value)
      })
    }
  }

  const last = points[points.length - 1]
  return {
    asset,
    points,
    finalValue: last?.value ?? 0,
    totalContribution: last?.cumulativeContribution ?? 0,
    estimatedGain: (last?.value ?? 0) - (last?.cumulativeContribution ?? 0)
  }
}

export function computeAllGrowthAssetSeries(assets: GrowthAsset[], settings: CurrencySettings): GrowthAssetSeries[] {
  return assets.filter((a) => a.visible).map((a) => computeGrowthAssetSeries(a, settings))
}

/** 圖表橫軸以所有可見資產中最長的試算年數為準；較短方案到自己的年限後不再有資料點（不延伸也不補值） */
export function maxTotalYears(assets: GrowthAsset[]): number {
  return assets.filter((a) => a.visible).reduce((max, a) => Math.max(max, a.totalYears), 0)
}
