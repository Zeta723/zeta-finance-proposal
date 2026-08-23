import React from 'react'
import type { ConclusionData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { ConclusionThreeStep } from './ConclusionThreeStep'
import { ConclusionWarmClosing } from './ConclusionWarmClosing'

interface Props {
  slide: ProposalSlide<ConclusionData>
  theme: ZetaTheme
}

/**
 * 結論／下一步頁面類型分派器：
 * - threeStep：深藍背景，三欄卡片橫排
 * - warmClosing：奶茶色背景，結語置中放大，下方左右分欄（摘要 vs 聯絡資訊卡）
 */
export function ConclusionSlide({ slide, theme }: Props) {
  switch (slide.layoutId) {
    case 'warmClosing':
      return <ConclusionWarmClosing slide={slide} theme={theme} />
    case 'threeStep':
    default:
      return <ConclusionThreeStep slide={slide} theme={theme} />
  }
}
