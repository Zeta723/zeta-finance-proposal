import type { ThemeId } from '../styles/theme'

/** Tiptap 產生的結構化 Rich Text JSON（安全、可轉 PPT RichTextRun） */
export type RichTextContent = Record<string, unknown> | null

export interface ImageAsset {
  /** base64 data URL，第一階段先用這個；未來可換成雲端 URL */
  dataUrl: string
  fit?: 'contain' | 'cover'
  shape?: 'rounded' | 'circle' | 'square'
  /** 原始檔案大小（bytes），用來判斷是否需要壓縮提示 */
  sizeBytes?: number
}

export type SlideType =
  | 'cover'
  | 'assetAllocation'
  | 'beforeAfter'
  | 'recommendation'
  | 'conclusion'
  | 'custom'
  | 'accountAllocation'

// ---------- 封面 ----------
export interface CoverData {
  proposalTopic: string
  title: string
  subtitle: string
  clientName: string
  clientTitle: string
  proposalDate: string
  advisorName: string
  brandName: string
  quote: RichTextContent
  logo?: ImageAsset
  coverPhoto?: ImageAsset
  backgroundImage?: ImageAsset
}

// ---------- 資產配置 ----------
export interface AssetItem {
  id: string
  name: string
  amount: number
  color: string
  note?: string
  visible: boolean
}

export type CurrencyCode = 'TWD' | 'USD' | 'CUSTOM'

export interface AssetAllocationData {
  heading: string
  items: AssetItem[]
  chartType: 'pie' | 'donut' | 'bar'
  currency: CurrencyCode
  customCurrencyLabel?: string
  showAmount: boolean
  showPercentage: boolean
  showNote: boolean
}

// ---------- Before / After ----------
export interface BeforeAfterData {
  heading: string
  beforeLabel: string
  afterLabel: string
  beforeItems: AssetItem[]
  afterItems: AssetItem[]
  currency: CurrencyCode
  customCurrencyLabel?: string
  /** 差額用途說明，例如「預留旅遊金」 */
  differenceNote: string
  /**
   * 「資產成長折線比較圖」模板專用資料。只有在 layoutId === 'lineComparison' 時使用，
   * 用 optional 欄位附掛在既有 BeforeAfterData 上，避免變更資料形狀、影響舊提案相容性。
   */
  lineComparison?: LineComparisonData
}

export type TimeUnit = 'month' | 'year' | 'custom'
export type LineComparisonMode = 'auto' | 'manual'

export interface LineComparisonPoint {
  id: string
  /** 時間點名稱，例如「第1年」「2027年6月」 */
  label: string
  beforeAmount: number
  afterAmount: number
  /** 目標線在此時間點的金額（選填，通常用自動試算的線性/等比推算或使用者手動指定） */
  targetAmount?: number
}

export interface LineComparisonData {
  chartTitle: string
  chartDescription: string
  mode: LineComparisonMode
  timeUnit: TimeUnit
  customUnitLabel?: string
  /** 自動試算模式參數 */
  periods: number
  startAmount: number
  beforeAnnualReturnRate: number
  afterAnnualReturnRate: number
  contributionAmount: number
  useCompound: boolean
  /** 手動輸入模式的時間點資料；自動模式下會由系統計算後暫存於此，供預覽與匯出共用 */
  points: LineComparisonPoint[]
  showTarget: boolean
  targetAmount: number
  beforeColor: string
  afterColor: string
  targetColor: string
  beforeName: string
  afterName: string
  showDataLabels: boolean
  currency: CurrencyCode
  customCurrencyLabel?: string
}

// ---------- 建議書 / 方案 ----------
export type RecommendationPlanType =
  | '現金流整理'
  | '緊急預備金'
  | 'ETF定期定額'
  | '退休規劃'
  | '旅遊金規劃'
  | '教育金規劃'
  | '房產活化'
  | '國際資產配置'
  | '美金高利增值帳戶'
  | '資產防護網'
  | '自訂方案'

export interface RecommendationData {
  heading: string
  planName: string
  planType: RecommendationPlanType
  coreGoal: string
  clientProblem: RichTextContent
  advisorSuggestion: RichTextContent
  whySuitable: RichTextContent
  investAmount: number
  currency: CurrencyCode
  customCurrencyLabel?: string
  monthlyAmount: number
  lumpSumAmount: number
  durationYears: number
  estimatedAnnualReturn: number
  estimatedResult: RichTextContent
  withdrawTiming: string
  withdrawMethod: string
  advantages: string[]
  steps: string[]
  cautions: string[]
  riskNotes: string[]
  advisorNote: RichTextContent
  image?: ImageAsset
  showFields: Partial<Record<keyof RecommendationData, boolean>>
}

// ---------- 結論 / 下一步 ----------
export interface ConclusionData {
  heading: string
  summary: RichTextContent
  coreAdvice: string[]
  priorities: string[]
  nextSteps: string[]
  plannedDate: string
  nextMeetingDate: string
  advisorReminder: RichTextContent
  closingText: RichTextContent
  contact: string
  instagram: string
  website: string
  qrCode?: ImageAsset
  advisorPhoto?: ImageAsset
  logo?: ImageAsset
}

// ---------- 自訂主題頁 ----------
export interface CustomHighlightItem {
  id: string
  title: string
  content: RichTextContent
  icon?: string
  number?: string
}

export interface CustomSlideData {
  heading: string
  title: string
  subtitle: string
  body: RichTextContent
  highlights: CustomHighlightItem[]
  image?: ImageAsset
  note?: string
}

// ---------- 收入與帳戶分配圖 ----------
export interface AllocationSubItem {
  id: string
  name: string
  amount: number
  note?: string
  visible: boolean
}

export interface AllocationCategory {
  id: string
  name: string
  amount: number
  color: string
  note?: string
  visible: boolean
  subItems: AllocationSubItem[]
}

export interface AccountAllocationData {
  heading: string
  totalIncome: number
  currency: CurrencyCode
  customCurrencyLabel?: string
  categories: AllocationCategory[]
  showAmount: boolean
  showPercentage: boolean
}

export type SlideData =
  | CoverData
  | AssetAllocationData
  | BeforeAfterData
  | RecommendationData
  | ConclusionData
  | CustomSlideData
  | AccountAllocationData

export interface ProposalSlide<T extends SlideData = SlideData> {
  id: string
  type: SlideType
  /** 該頁類型下所選用的版型 id，例如 'classic' | 'warm' | 'minimal' */
  layoutId: string
  slideTheme: string
  data: T
  order: number
  hidden: boolean
  createdAt: string
  updatedAt: string
}

export interface ClientInfo {
  proposalName: string
  clientName: string
  clientTitle: string
  proposalDate: string
  proposalTopic: string
  advisorName: string
  brandName: string
  contact: string
  instagram: string
  website: string
  note: string
}

export interface ThemeSettings {
  defaultTheme: ThemeId
}

export interface Proposal {
  id: string
  schemaVersion: number
  client: ClientInfo
  slides: ProposalSlide[]
  themeSettings: ThemeSettings
  createdAt: string
  updatedAt: string
  /** 縮圖（第一頁截圖／示意色塊），非必要 */
  thumbnail?: string
}

export interface ProposalSummary {
  id: string
  name: string
  clientName: string
  topic: string
  slideCount: number
  createdAt: string
  updatedAt: string
  thumbnail?: string
}

/** 匯出模式：可編輯PowerPoint／Keynote相容PowerPoint／PDF。詳見 export/exportModes.ts */
export type ExportMode = 'editablePptx' | 'keynotePptx' | 'pdf'

/**
 * 資料格式版本號歷史：
 * v1 — 初版（封面/資產配置/Before&After/建議書/結論/自訂頁）
 * v2 — 新增 accountAllocation 頁面類型、BeforeAfterData.lineComparison 折線比較資料。
 *      純新增欄位，v1 資料可以直接讀取，不需要破壞性遷移。
 */
export const SCHEMA_VERSION = 2
