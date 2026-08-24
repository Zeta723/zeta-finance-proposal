import React from 'react'
import type { BeforeAfterData, CurrencySettings, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { BeforeAfterDualPie } from './BeforeAfterDualPie'
import { BeforeAfterSideCards } from './BeforeAfterSideCards'
import { BeforeAfterLineComparison } from './BeforeAfterLineComparison'

interface Props {
  slide: ProposalSlide<BeforeAfterData>
  theme: ZetaTheme
  currencySettings?: CurrencySettings
}

/**
 * Before & After 頁面類型的模板分派器。
 * 三種 layoutId 對應三個完全獨立的元件、各自不同的版面結構：
 * - dualPie：左右雙環形圖對照（有圖表）
 * - sideCards：左右直式卡片逐項金額對照（無圖表，資訊密度高）
 * - lineComparison：真正的 XY 折線圖，比較資產隨時間成長趨勢（含多資產獨立試算模式）
 * 三種版型都會把 currencySettings 往下傳，確保不同幣別的資產項目一律先換算成
 * 統一顯示幣別再加總／比較，不會把 USD 數字和 TWD 數字直接混算。
 */
export function BeforeAfterSlide({ slide, theme, currencySettings }: Props) {
  switch (slide.layoutId) {
    case 'sideCards':
      return <BeforeAfterSideCards slide={slide} theme={theme} currencySettings={currencySettings} />
    case 'lineComparison':
      return <BeforeAfterLineComparison slide={slide} theme={theme} currencySettings={currencySettings} />
    case 'dualPie':
    default:
      return <BeforeAfterDualPie slide={slide} theme={theme} currencySettings={currencySettings} />
  }
}
