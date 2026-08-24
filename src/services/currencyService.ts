import type { CurrencyCode, CurrencySettings } from '../types'

/**
 * 幣別換算服務。所有換算都只在「顯示層」進行 —— 原始輸入金額與原始幣別
 * 永遠原封不動保存在資料裡（例如 GrowthAsset.currency / initialAmount /
 * periodicAmount），這裡的函式只負責「需要換算成另一種幣別顯示時」的計算，
 * 絕不會覆寫或修改原始資料。
 */

export function currencySymbol(currency: CurrencyCode, customLabel?: string): string {
  if (currency === 'TWD') return 'NT$'
  if (currency === 'USD') return 'US$'
  return customLabel || ''
}

/** 將金額從一種幣別換算成另一種幣別（僅支援 TWD/USD 之間，自訂幣別無法自動換算） */
export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode, usdToTwdRate: number): number {
  if (from === to) return amount
  if (from === 'CUSTOM' || to === 'CUSTOM') return amount // 自訂幣別無匯率可換算，原樣回傳
  if (from === 'USD' && to === 'TWD') return amount * usdToTwdRate
  if (from === 'TWD' && to === 'USD') return amount / usdToTwdRate
  return amount
}

/** 格式化金額為清楚標示幣別的字串，例如 "NT$224,000" 或 "US$7,000"（絕不只顯示裸的 "$"） */
export function formatMoney(amount: number, currency: CurrencyCode, customLabel?: string): string {
  const rounded = Math.round(amount)
  return `${currencySymbol(currency, customLabel)}${rounded.toLocaleString('zh-Hant-TW')}`
}

/**
 * 格式化「原始金額（換算後金額）」雙幣別顯示，例如：
 * "US$7,000（≈ NT$224,000）"。若原始幣別已經等於顯示幣別，只顯示一次。
 */
export function formatWithConversion(amount: number, originalCurrency: CurrencyCode, settings: CurrencySettings, customLabel?: string): string {
  const display = settings.primaryDisplayCurrency
  const original = formatMoney(amount, originalCurrency, customLabel)
  if (originalCurrency === display || originalCurrency === 'CUSTOM') return original
  const converted = convertAmount(amount, originalCurrency, display, settings.usdToTwdRate)
  return `${original}（≈ ${formatMoney(converted, display)}）`
}

/** 換算成統一顯示幣別的純數字（用於圖表座標，圖表不能混用不同幣別的原始數字比較） */
export function toDisplayCurrencyValue(amount: number, originalCurrency: CurrencyCode, settings: CurrencySettings): number {
  if (originalCurrency === 'CUSTOM') return amount
  return convertAmount(amount, originalCurrency, settings.primaryDisplayCurrency, settings.usdToTwdRate)
}
