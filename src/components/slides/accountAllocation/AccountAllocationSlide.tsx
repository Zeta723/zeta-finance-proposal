import React from 'react'
import type { AccountAllocationData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { AccountAllocationMoneyFlow } from './AccountAllocationMoneyFlow'
import { AccountAllocationTree } from './AccountAllocationTree'
import { AccountAllocationCards } from './AccountAllocationCards'

interface Props {
  slide: ProposalSlide<AccountAllocationData>
  theme: ZetaTheme
}

/**
 * 收入與帳戶分配圖頁面類型分派器：
 * - moneyFlow：左到右資金流向圖
 * - treeAccount：由上到下三層樹狀結構
 * - allocationCards：上方總覽＋下方卡片＋進度條
 */
export function AccountAllocationSlide({ slide, theme }: Props) {
  switch (slide.layoutId) {
    case 'treeAccount':
      return <AccountAllocationTree slide={slide} theme={theme} />
    case 'allocationCards':
      return <AccountAllocationCards slide={slide} theme={theme} />
    case 'moneyFlow':
    default:
      return <AccountAllocationMoneyFlow slide={slide} theme={theme} />
  }
}
