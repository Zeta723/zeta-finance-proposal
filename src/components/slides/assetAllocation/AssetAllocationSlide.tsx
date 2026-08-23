import React from 'react'
import type { AssetAllocationData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { AssetAllocationLeftChartRightTable } from './AssetAllocationLeftChartRightTable'
import { AssetAllocationTopTotalBottomChart } from './AssetAllocationTopTotalBottomChart'
import { AssetAllocationDashboard } from './AssetAllocationDashboard'

interface Props {
  slide: ProposalSlide<AssetAllocationData>
  theme: ZetaTheme
}

/**
 * 資產配置圖頁面類型分派器：
 * - leftChartRightTable：左側大型環形圖＋右側明細表，上方總資產
 * - topTotalBottomChart：上方總資產＋圖表，下方橫向資產卡片
 * - cardStyle：數據儀表板（左上總資產／右上最大類別／下方長條圖＋卡片群）
 */
export function AssetAllocationSlide({ slide, theme }: Props) {
  switch (slide.layoutId) {
    case 'topTotalBottomChart':
      return <AssetAllocationTopTotalBottomChart slide={slide} theme={theme} />
    case 'cardStyle':
      return <AssetAllocationDashboard slide={slide} theme={theme} />
    case 'leftChartRightTable':
    default:
      return <AssetAllocationLeftChartRightTable slide={slide} theme={theme} />
  }
}
