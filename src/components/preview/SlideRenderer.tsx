import React from 'react'
import type { Proposal, ProposalSlide } from '../../types'
import { getTheme, type ThemeId } from '../../styles/theme'
import { CoverSlide } from '../slides/cover/CoverSlide'
import { AssetAllocationSlide } from '../slides/assetAllocation/AssetAllocationSlide'
import { BeforeAfterSlide } from '../slides/beforeAfter/BeforeAfterSlide'
import { RecommendationSlide } from '../slides/recommendation/RecommendationSlide'
import { ConclusionSlide } from '../slides/conclusion/ConclusionSlide'
import { CustomSlide } from '../slides/custom/CustomSlide'
import { AccountAllocationSlide } from '../slides/accountAllocation/AccountAllocationSlide'

interface Props {
  slide: ProposalSlide
  defaultTheme: Proposal['themeSettings']['defaultTheme']
}

/** 依 slide.type 分派到對應模板元件；網頁預覽與 PPT 匯出共用同一份 data/theme */
export function SlideRenderer({ slide, defaultTheme }: Props) {
  const theme = getTheme((slide.slideTheme as ThemeId) || defaultTheme)

  switch (slide.type) {
    case 'cover':
      return <CoverSlide slide={slide as any} theme={theme} />
    case 'assetAllocation':
      return <AssetAllocationSlide slide={slide as any} theme={theme} />
    case 'beforeAfter':
      return <BeforeAfterSlide slide={slide as any} theme={theme} />
    case 'recommendation':
      return <RecommendationSlide slide={slide as any} theme={theme} />
    case 'conclusion':
      return <ConclusionSlide slide={slide as any} theme={theme} />
    case 'custom':
      return <CustomSlide slide={slide as any} theme={theme} />
    case 'accountAllocation':
      return <AccountAllocationSlide slide={slide as any} theme={theme} />
    default:
      return null
  }
}
