import React from 'react'
import type { ProposalSlide, RecommendationData } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { RecommendationDataHighlight } from './RecommendationDataHighlight'
import { RecommendationAdvisorCard } from './RecommendationAdvisorCard'

interface Props {
  slide: ProposalSlide<RecommendationData>
  theme: ZetaTheme
}

/**
 * 建議書／方案頁面類型分派器：
 * - dataHighlight：左側深藍數據欄＋右側雙欄文字說明
 * - advisorCard：上方橫幅＋三張說明卡片並列＋底部步驟時間軸
 */
export function RecommendationSlide({ slide, theme }: Props) {
  switch (slide.layoutId) {
    case 'advisorCard':
      return <RecommendationAdvisorCard slide={slide} theme={theme} />
    case 'dataHighlight':
    default:
      return <RecommendationDataHighlight slide={slide} theme={theme} />
  }
}
