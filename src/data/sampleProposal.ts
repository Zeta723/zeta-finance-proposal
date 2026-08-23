import { newId, nowISO } from '../services/idGenerator'
import { SCHEMA_VERSION, type Proposal, type ProposalSlide } from '../types'
import { createSlide, makeAssetItem } from './slideDefaults'

function richText(text: string, highlight?: { text: string; color: string; bold?: boolean }) {
  if (!highlight) {
    return { type: 'doc', content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }] }
  }
  const idx = text.indexOf(highlight.text)
  if (idx === -1) return richText(text)
  const before = text.slice(0, idx)
  const mid = highlight.text
  const after = text.slice(idx + highlight.text.length)
  const marks = [{ type: 'textStyle', attrs: { color: highlight.color } }, ...(highlight.bold ? [{ type: 'bold' }] : [])]
  const content = []
  if (before) content.push({ type: 'text', text: before })
  content.push({ type: 'text', text: mid, marks })
  if (after) content.push({ type: 'text', text: after })
  return { type: 'doc', content: [{ type: 'paragraph', content }] }
}

/** 建立內建示範提案：王小明 個人資產配置與退休規劃 */
export function buildSampleProposal(): Proposal {
  const now = nowISO()

  const cover = createSlide('cover', 0)
  cover.data = {
    ...cover.data,
    proposalTopic: '個人資產配置與退休規劃',
    title: '個人資產配置與退休規劃',
    subtitle: '為王小明整理的財務提案',
    clientName: '王小明',
    clientTitle: '先生',
    proposalDate: now.slice(0, 10),
    advisorName: 'Zeta',
    brandName: 'Zeta｜錢與人生的整理室',
    quote: richText('財務規劃不是把生活變得更辛苦，而是讓每一筆錢，都更靠近你真正想要的人生。')
  } as any

  const assetAllocation = createSlide('assetAllocation', 1)
  assetAllocation.data = {
    heading: '目前資產配置',
    items: [makeAssetItem('現金', 200000, 0), makeAssetItem('ETF', 30000, 1), makeAssetItem('虛擬資產', 500000, 2)],
    chartType: 'donut',
    currency: 'TWD',
    showAmount: true,
    showPercentage: true,
    showNote: false
  } as any

  const beforeAfter = createSlide('beforeAfter', 2)
  beforeAfter.data = {
    heading: 'Before & After 資產配置調整',
    beforeLabel: '調整前',
    afterLabel: '調整後',
    beforeItems: [makeAssetItem('現金', 200000, 0), makeAssetItem('ETF', 30000, 1), makeAssetItem('虛擬資產', 500000, 2)],
    afterItems: [
      makeAssetItem('優利帳戶', 190000, 3),
      makeAssetItem('虛擬資產', 350000, 2),
      makeAssetItem('ETF', 30000, 1),
      makeAssetItem('現金', 120000, 0)
    ],
    currency: 'TWD',
    differenceNote: '預留近期出國旅遊支出（約 40,000 元）',
    lineComparison: {
      chartTitle: '資產成長折線比較（10年）',
      chartDescription: '比較維持現況與採用建議方案後，資產隨時間的成長趨勢',
      mode: 'auto',
      timeUnit: 'year',
      periods: 10,
      startAmount: 730000,
      beforeAnnualReturnRate: 1,
      afterAnnualReturnRate: 6,
      contributionAmount: 3000,
      useCompound: true,
      points: [],
      showTarget: true,
      targetAmount: 1500000,
      beforeColor: '#B9AA8D',
      afterColor: '#D3AF37',
      targetColor: '#4F7965',
      beforeName: '維持現況',
      afterName: '採用建議方案',
      showDataLabels: false,
      currency: 'TWD'
    }
  } as any

  const beforeAfterLine = createSlide('beforeAfter', 3, 'lineComparison')
  beforeAfterLine.data = JSON.parse(JSON.stringify(beforeAfter.data))

  const accountAllocation = createSlide('accountAllocation', 4)
  // 使用 defaultAccountAllocationData() 內建的示範資料（總收入60,000元的分配範例）

  const etfRecommendation = createSlide('recommendation', 5)
  etfRecommendation.data = {
    heading: '建議方案一：ETF定期定額',
    planName: 'ETF定期定額計畫',
    planType: 'ETF定期定額',
    coreGoal: '建立長期複利成長的核心部位',
    clientProblem: richText('目前資金多集中於現金與虛擬資產，缺乏長期穩定成長的部位。'),
    advisorSuggestion: richText('建議每月投入3,000元，持續累積長期資產。', { text: '每月投入3,000元', color: '#D3AF37', bold: true }),
    whySuitable: richText('進場門檻低、資金運用彈性高，適合作為核心配置的第一步。'),
    investAmount: 3000,
    currency: 'TWD',
    monthlyAmount: 3000,
    lumpSumAmount: 0,
    durationYears: 15,
    estimatedAnnualReturn: 6,
    estimatedResult: richText('依歷史平均報酬概算，長期持有有機會累積可觀複利效果（僅供參考，不代表保證報酬）。'),
    withdrawTiming: '依人生階段彈性提取',
    withdrawMethod: '分批贖回',
    advantages: ['進場門檻低', '長期複利效果', '資金運用彈性高'],
    steps: ['開立證券帳戶', '設定定期定額', '每季檢視調整'],
    cautions: ['市場短期波動屬正常現象'],
    riskNotes: ['投資有風險，過去績效不代表未來表現'],
    advisorNote: richText(''),
    showFields: {}
  } as any

  const travelFund = createSlide('custom', 6)
  travelFund.data = {
    heading: '旅遊金規劃',
    title: '旅遊金規劃',
    subtitle: '預留每年出國旅遊的資金空間',
    body: richText('建議從調整後資產中預留 40,000 元作為近期旅遊金，並每月額外提撥小額資金累積下一次旅遊預算。'),
    highlights: [
      { id: newId(), title: '預留金額', content: richText('40,000 元') },
      { id: newId(), title: '用途', content: richText('近期出國旅遊支出') },
      { id: newId(), title: '建議方式', content: richText('獨立於投資帳戶外的專用儲蓄') }
    ]
  } as any

  const retirement = createSlide('custom', 7)
  retirement.data = {
    heading: '退休規劃',
    title: '退休規劃方向',
    subtitle: '',
    body: richText('搭配ETF定期定額與優利帳戶，逐步建立長期退休金部位，並定期檢視提領策略。'),
    highlights: [
      { id: newId(), title: '規劃方向', content: richText('資產防護網 + 長期成長部位') },
      { id: newId(), title: '檢視頻率', content: richText('每年至少檢視一次') }
    ]
  } as any

  const conclusion = createSlide('conclusion', 8)
  conclusion.data = {
    heading: '結論與下一步',
    summary: richText('本次規劃聚焦於資產結構調整、旅遊金與退休金準備，並建立長期資產防護網。'),
    coreAdvice: ['調整資產配置比例', '啟動ETF定期定額每月3,000元', '預留旅遊金40,000元'],
    priorities: ['本月完成優利帳戶與證券帳戶開立'],
    nextSteps: ['簽署規劃書', '安排下次會談確認執行進度'],
    plannedDate: '',
    nextMeetingDate: '',
    advisorReminder: richText('提醒：投資有風險，建議搭配緊急預備金一起規劃。'),
    closingText: richText('財務規劃不是把生活變得更辛苦，而是讓每一筆錢，都更靠近你真正想要的人生。'),
    contact: '',
    instagram: '',
    website: ''
  } as any

  const slides: ProposalSlide[] = [cover, assetAllocation, beforeAfter, beforeAfterLine, accountAllocation, etfRecommendation, travelFund, retirement, conclusion]

  return {
    id: newId(),
    schemaVersion: SCHEMA_VERSION,
    client: {
      proposalName: '王小明．個人資產配置與退休規劃（示範）',
      clientName: '王小明',
      clientTitle: '先生',
      proposalDate: now.slice(0, 10),
      proposalTopic: '個人資產配置與退休規劃',
      advisorName: 'Zeta',
      brandName: 'Zeta｜錢與人生的整理室',
      contact: '',
      instagram: '',
      website: '',
      note: '這是內建示範提案，可以直接刪除。'
    },
    slides,
    themeSettings: { defaultTheme: 'classicNavyGold' },
    createdAt: now,
    updatedAt: now
  }
}
