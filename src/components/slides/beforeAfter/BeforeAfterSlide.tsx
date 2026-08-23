import React from 'react'
import type { AssetItem, BeforeAfterData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { BeforeAfterDualPie } from './BeforeAfterDualPie'
import { BeforeAfterSideCards } from './BeforeAfterSideCards'
import { BeforeAfterLineComparison } from './BeforeAfterLineComparison'

interface Props {
  slide: ProposalSlide<BeforeAfterData>
  theme: ZetaTheme
}

export function sumVisible(items: AssetItem[]) {
  return items.filter((i) => i.visible).reduce((s, i) => s + Math.max(0, i.amount), 0)
}

/**
 * Before & After 頁面類型的模板分派器。
 * 三種 layoutId 對應三個完全獨立的元件、各自不同的版面結構：
 * - dualPie：左右雙環形圖對照（有圖表）
 * - sideCards：左右直式卡片逐項金額對照（無圖表，資訊密度高）
 * - lineComparison：真正的 XY 折線圖，比較資產隨時間成長趨勢
 */
export function BeforeAfterSlide({ slide, theme }: Props) {
  switch (slide.layoutId) {
    case 'sideCards':
      return <BeforeAfterSideCards slide={slide} theme={theme} />
    case 'lineComparison':
      return <BeforeAfterLineComparison slide={slide} theme={theme} />
    case 'dualPie':
    default:
      return <BeforeAfterDualPie slide={slide} theme={theme} />
  }
}
