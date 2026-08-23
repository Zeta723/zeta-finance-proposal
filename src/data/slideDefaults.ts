import { newId, nowISO } from '../services/idGenerator'
import { CHART_PALETTE } from '../styles/theme'
import type {
  AccountAllocationData,
  AllocationCategory,
  AssetAllocationData,
  AssetItem,
  BeforeAfterData,
  ConclusionData,
  CoverData,
  CustomSlideData,
  LineComparisonData,
  ProposalSlide,
  RecommendationData,
  SlideData,
  SlideType
} from '../types'

function richText(text: string) {
  return { type: 'doc', content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }] }
}

export function makeAssetItem(name: string, amount: number, colorIndex: number, note = ''): AssetItem {
  return { id: newId(), name, amount, color: CHART_PALETTE[colorIndex % CHART_PALETTE.length], note, visible: true }
}

export function defaultCoverData(): CoverData {
  return {
    proposalTopic: '個人資產配置與退休規劃',
    title: '財務規劃提案',
    subtitle: '為你的人生，整理一份安心的財務地圖',
    clientName: '',
    clientTitle: '先生/小姐',
    proposalDate: new Date().toISOString().slice(0, 10),
    advisorName: 'Zeta',
    brandName: 'Zeta｜錢與人生的整理室',
    quote: richText('財務規劃不是把生活變得更辛苦，而是讓每一筆錢，都更靠近你真正想要的人生。')
  }
}

export function defaultAssetAllocationData(): AssetAllocationData {
  return {
    heading: '目前資產配置',
    items: [makeAssetItem('現金', 200000, 0), makeAssetItem('ETF', 30000, 1), makeAssetItem('虛擬資產', 500000, 2)],
    chartType: 'donut',
    currency: 'TWD',
    showAmount: true,
    showPercentage: true,
    showNote: false
  }
}

export function defaultLineComparisonData(): LineComparisonData {
  return {
    chartTitle: '資產成長折線比較',
    chartDescription: '比較調整前與調整後，資產隨時間的成長趨勢',
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
    targetAmount: 2000000,
    beforeColor: '#B9AA8D',
    afterColor: '#D3AF37',
    targetColor: '#4F7965',
    beforeName: '調整前',
    afterName: '調整後',
    showDataLabels: false,
    currency: 'TWD'
  }
}

export function defaultBeforeAfterData(): BeforeAfterData {
  return {
    heading: '資產配置調整建議',
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
    differenceNote: '預留近期出國旅遊支出',
    lineComparison: defaultLineComparisonData()
  }
}

export function defaultRecommendationData(): RecommendationData {
  return {
    heading: '建議方案',
    planName: 'ETF定期定額規劃',
    planType: 'ETF定期定額',
    coreGoal: '建立長期複利成長的核心部位',
    clientProblem: richText('資金多以現金與虛擬資產持有，缺乏長期穩定成長的部位。'),
    advisorSuggestion: richText('建議每月投入3,000元，持續累積長期資產。'),
    whySuitable: richText('資金彈性高、風險可控，適合作為長期核心配置的第一步。'),
    investAmount: 3000,
    currency: 'TWD',
    monthlyAmount: 3000,
    lumpSumAmount: 0,
    durationYears: 10,
    estimatedAnnualReturn: 6,
    estimatedResult: richText('依歷史平均報酬概算，長期持有有機會累積可觀複利效果（僅供參考，不代表保證報酬）。'),
    withdrawTiming: '依人生階段彈性提取',
    withdrawMethod: '分批贖回',
    advantages: ['進場門檻低', '長期複利效果', '資金運用彈性高'],
    steps: ['開立證券帳戶', '設定定期定額', '每季檢視調整'],
    cautions: ['市場短期波動屬正常現象', '建議搭配緊急預備金一起規劃'],
    riskNotes: ['投資有風險，過去績效不代表未來表現'],
    advisorNote: richText(''),
    showFields: {}
  }
}

export function defaultConclusionData(): ConclusionData {
  return {
    heading: '結論與下一步',
    summary: richText('本次規劃聚焦於資產結構調整、旅遊金與退休金準備，並建立長期資產防護網。'),
    coreAdvice: ['調整資產配置比例', '啟動ETF定期定額', '預留旅遊金與緊急預備金'],
    priorities: ['本月完成帳戶開立', '設定自動扣款'],
    nextSteps: ['簽署規劃書', '安排下次會談確認執行進度'],
    plannedDate: '',
    nextMeetingDate: '',
    advisorReminder: richText(''),
    closingText: richText('財務規劃不是把生活變得更辛苦，而是讓每一筆錢，都更靠近你真正想要的人生。'),
    contact: '',
    instagram: '',
    website: ''
  }
}

export function defaultCustomSlideData(): CustomSlideData {
  return {
    heading: '自訂主題頁',
    title: '主題標題',
    subtitle: '',
    body: richText(''),
    highlights: [
      { id: newId(), title: '重點一', content: richText('') },
      { id: newId(), title: '重點二', content: richText('') },
      { id: newId(), title: '重點三', content: richText('') }
    ]
  }
}

function makeAllocationCategory(name: string, amount: number, colorIndex: number, subItems: [string, number][]): AllocationCategory {
  return {
    id: newId(),
    name,
    amount,
    color: CHART_PALETTE[colorIndex % CHART_PALETTE.length],
    visible: true,
    subItems: subItems.map(([n, a]) => ({ id: newId(), name: n, amount: a, visible: true }))
  }
}

export function defaultAccountAllocationData(): AccountAllocationData {
  return {
    heading: '收入與帳戶分配圖',
    totalIncome: 60000,
    currency: 'TWD',
    showAmount: true,
    showPercentage: true,
    categories: [
      makeAllocationCategory('存款', 15000, 0, [
        ['緊急預備金', 5000],
        ['退休準備', 5000],
        ['目標存款', 5000]
      ]),
      makeAllocationCategory('生活開支', 30000, 3, [
        ['房租', 15000],
        ['飲食', 8000],
        ['交通', 2000],
        ['其他生活費', 5000]
      ]),
      makeAllocationCategory('旅遊', 5000, 1, [
        ['國內旅遊', 2000],
        ['海外旅遊', 3000]
      ]),
      makeAllocationCategory('投資', 7000, 2, [
        ['ETF', 4000],
        ['其他投資', 3000]
      ]),
      makeAllocationCategory('保險', 3000, 4, [])
    ]
  }
}

export function defaultDataFor(type: SlideType): SlideData {
  switch (type) {
    case 'cover':
      return defaultCoverData()
    case 'assetAllocation':
      return defaultAssetAllocationData()
    case 'beforeAfter':
      return defaultBeforeAfterData()
    case 'recommendation':
      return defaultRecommendationData()
    case 'conclusion':
      return defaultConclusionData()
    case 'custom':
      return defaultCustomSlideData()
    case 'accountAllocation':
      return defaultAccountAllocationData()
  }
}

export const DEFAULT_LAYOUT_BY_TYPE: Record<SlideType, string> = {
  cover: 'classic',
  assetAllocation: 'leftChartRightTable',
  beforeAfter: 'dualPie',
  recommendation: 'dataHighlight',
  conclusion: 'threeStep',
  custom: 'textHighlight',
  accountAllocation: 'moneyFlow'
}

export function createSlide(type: SlideType, order: number, layoutId?: string): ProposalSlide {
  const now = nowISO()
  return {
    id: newId(),
    type,
    layoutId: layoutId ?? DEFAULT_LAYOUT_BY_TYPE[type],
    slideTheme: '',
    data: defaultDataFor(type),
    order,
    hidden: false,
    createdAt: now,
    updatedAt: now
  } as ProposalSlide
}

export const SLIDE_TYPE_LABELS: Record<SlideType, string> = {
  cover: '首頁／封面',
  assetAllocation: '資產配置圖',
  beforeAfter: 'Before & After',
  recommendation: '建議書／方案',
  conclusion: '結論／下一步',
  custom: '自訂主題頁',
  accountAllocation: '收入與帳戶分配圖'
}

/**
 * Template Registry —— 每個頁面類型底下所有可選模板的唯一登記處。
 * templateId（沿用既有欄位名 layoutId）在整個系統中都是「決定要 render 哪個版面」的
 * 唯一依據：預覽元件（SlideRenderer 底下各 slides/<type> 元件）與 PPT／PDF 匯出函式
 * 都必須直接 switch 這個 id，不可以忽略它。
 */
export interface TemplateDefinition {
  id: string
  name: string
  description: string
  useCase: string
  features: string[]
}

export const LAYOUTS_BY_TYPE: Record<SlideType, TemplateDefinition[]> = {
  cover: [
    { id: 'classic', name: '經典藍金版', description: '深藍底、金色標題文字，正式且有份量', useCase: '適合正式提案開場', features: ['深藍背景', '金色主標題', '白色資訊卡'] },
    { id: 'warm', name: '溫暖奶茶版', description: '奶茶色底，親和溫暖', useCase: '適合強調陪伴感的提案', features: ['奶茶色背景', '深藍標題', '白色資訊卡'] },
    { id: 'minimal', name: '極簡留白版', description: '米白底、大量留白，簡潔現代', useCase: '適合年輕客群或簡約風格', features: ['米白背景', '大留白', '輕量資訊卡'] }
  ],
  assetAllocation: [
    { id: 'leftChartRightTable', name: '左圖右表', description: '左側大型環形圖，右側完整明細表，上方總資產標示', useCase: '適合呈現詳細比例與精確金額', features: ['左側環形圖', '右側資產明細表', '單欄式閱讀'] },
    { id: 'topTotalBottomChart', name: '上圖下卡片', description: '上方總資產＋圖表，下方橫向資產卡片', useCase: '適合快速閱讀重點', features: ['上方總資產大字', '下方橫向卡片', '雙層資訊結構'] },
    { id: 'cardStyle', name: '數據儀表板', description: '左上總資產、右上最大資產類別、下方長條圖與卡片群，像財務Dashboard', useCase: '適合強調數據分析與比較', features: ['儀表板式四象限', '長條圖', '最大類別標註'] }
  ],
  beforeAfter: [
    { id: 'dualPie', name: '雙圓餅圖對照版', description: '左右並排兩個環形圖＋明細清單，中央金色箭頭連接', useCase: '適合強調配置比例的變化', features: ['左右雙環形圖', '中央箭頭', '明細清單並列'] },
    { id: 'sideCards', name: '左右卡片對照版', description: '左右兩張直式資產卡片堆疊比較，無圖表，純數字對照', useCase: '適合資產項目多、需要逐項比對金額的場合', features: ['直式卡片堆疊', '逐項金額對照', '無圖表、資訊密度高'] },
    { id: 'lineComparison', name: '資產成長折線比較圖', description: '真正的XY折線圖，X軸時間、Y軸資產金額，比較調整前後成長曲線，可加目標線', useCase: '適合呈現長期複利成長趨勢', features: ['XY折線圖', '調整前/後兩條線', '可選目標線', '自動試算或手動輸入'] }
  ],
  recommendation: [
    { id: 'dataHighlight', name: '數據重點版', description: '左側深藍數據卡（大字顯示金額與報酬率），右側文字說明＋步驟兩欄', useCase: '適合強調具體數字與投入金額', features: ['左側深藍數據欄', '大字金額', '右側雙欄文字'] },
    { id: 'advisorCard', name: '顧問建議卡片版', description: '上方橫幅顯示方案名稱與核心目標，下方三張卡片並列（問題／建議／原因），底部時間軸式步驟', useCase: '適合以顧問對話口吻說明方案', features: ['上方橫幅', '三張說明卡片並列', '底部步驟時間軸'] }
  ],
  conclusion: [
    { id: 'threeStep', name: '三步驟行動版', description: '深藍背景，三欄卡片（核心建議／優先事項／下一步），底部置中結語', useCase: '適合條列式收尾', features: ['深藍背景三欄卡片', '置中金色結語'] },
    { id: 'warmClosing', name: '溫暖結語與聯絡資訊版', description: '奶茶色背景，單欄大字結語置中偏上，下方左右分欄顯示摘要與聯絡資訊卡', useCase: '適合強調溫度與後續聯繫', features: ['奶茶色背景', '大字結語置中', '左右分欄聯絡資訊'] }
  ],
  custom: [
    { id: 'textHighlight', name: '純文字重點版', description: '左側大段內文，右側直向重點卡片堆疊', useCase: '適合說明性內容搭配重點提示', features: ['左文右卡', '直向重點堆疊'] },
    { id: 'imageText', name: '圖片＋文字並排版', description: '左右對半，一側圖片、一側內文', useCase: '適合搭配情境照片說明', features: ['左右對半', '大圖'] },
    { id: 'threeCards', name: '三張重點卡片版', description: '三張等寬卡片橫向並排，各自標號', useCase: '適合三個並列重點', features: ['三欄等寬卡片', '編號圓標'] }
  ],
  accountAllocation: [
    { id: 'moneyFlow', name: '資金流向圖', description: '左側總收入，中間以粗細不一的連接線分流到右側各大項目與小項目，由左到右閱讀', useCase: '適合強調資金流動與分配路徑', features: ['左到右資金流向', '線條粗細依金額比例', '高解析度圖像匯出'] },
    { id: 'treeAccount', name: '樹狀帳戶圖', description: '最上方總收入，第二層大項目，第三層小項目，由上到下樹狀展開', useCase: '適合項目較多、階層清楚的場合', features: ['三層樹狀結構', '由上到下閱讀', '適合項目多的提案'] },
    { id: 'allocationCards', name: '分配卡片圖', description: '上方總收入與已分配比例，下方多張大項目卡片，卡片內含小項目與進度條', useCase: '適合手機閱讀或簡潔呈現', features: ['上方總覽', '卡片＋進度條', '手機友善'] }
  ]
}
