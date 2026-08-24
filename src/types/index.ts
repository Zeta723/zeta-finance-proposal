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
  /**
   * 縮放比例（%），100 為原始顯示大小。每一個圖片欄位（Logo／封面照片／
   * 背景圖片／其他頁面圖片）各自獨立保存在自己的 ImageAsset 物件裡，
   * 調整其中一張不會影響其他張。未設定時視為 100%（向下相容舊資料）。
   */
  scale?: number
  /** 水平位置錨點；未設定時視為置中 */
  positionX?: 'left' | 'center' | 'right'
  /** 垂直位置錨點；未設定時視為置中 */
  positionY?: 'top' | 'center' | 'bottom'
}

export function defaultImageScale(): number {
  return 100
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
  /** 該項目自己的預估年化報酬率（%），用於資產成長試算；未設定時使用該側的預設報酬率 */
  annualReturnRate?: number
  /** 「目前資產金額」（amount）的幣別；未設定時視為新台幣 TWD（向下相容舊資料） */
  currency?: CurrencyCode
  customCurrencyLabel?: string
  /** 是否持續投入；未設定時視為單筆投入（不持續投入），向下相容舊資料 */
  contributionMode?: ContributionMode
  /** 每月或每年投入金額（contributionMode 為 monthly/annual 時使用） */
  periodicAmount?: number
  /** 持續投入金額的幣別；未設定時預設同 currency */
  periodicCurrency?: CurrencyCode
  /** 投入年限：持續投入幾年後停止（僅 monthly/annual 適用） */
  contributionYears?: number
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
  /**
   * 新版：每一項資產獨立試算（分紅保單／ETF／定存…各自的幣別、投入方式、
   * 投入年數、報酬率、試算總年數都不共用）。存在且非空陣列時，圖表改用
   * 這裡的多資產比較模式渲染；為空或未設定時，維持舊版單一調整前/調整後
   * 兩線比較（回頭相容既有提案）。
   */
  growthAssets?: GrowthAsset[]
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

/**
 * 圖片區塊：位置／大小／顯示模式都是獨立可調整的設定，儲存在投影片資料中
 * （不是暫存畫面狀態），x/y/width/height 皆為投影片的百分比座標（0-100），
 * 與投影片實際顯示尺寸（縮放倍率）無關，確保網頁預覽／PDF／PPT三邊算出同樣位置。
 */
export interface ImageBlock {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  objectFit: 'contain' | 'cover' | 'original' | 'free'
  opacity: number
  borderRadius: number
  zIndex: number
  aspectRatioLocked: boolean
  /** 圖片原始寬高比（width/height），用於鎖定比例時的縮放計算 */
  naturalAspectRatio?: number
}

/** 內文文字區塊的版面設定（整段套用，不影響 Rich Text 內的局部格式） */
export interface TextBlockStyle {
  fontSize: number
  lineHeight: number
  textAlign: 'left' | 'center' | 'right'
  letterSpacing: number
  paragraphSpacing: number
}

export function defaultTextBlockStyle(): TextBlockStyle {
  return { fontSize: 16, lineHeight: 1.6, textAlign: 'left', letterSpacing: 0, paragraphSpacing: 8 }
}

export interface CustomSlideData {
  heading: string
  title: string
  subtitle: string
  body: RichTextContent
  highlights: CustomHighlightItem[]
  image?: ImageAsset
  note?: string
  /** 新版可自由拖曳/縮放的圖片區塊。存在時優先於舊版 `image` 欄位使用。 */
  imageBlock?: ImageBlock
  /** 內文區塊的字體大小/行高/對齊等版面設定 */
  bodyStyle?: TextBlockStyle
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
  /** 所屬分類；未設定或分類已被刪除時視為「未分類」 */
  categoryId?: string
  /** 全域幣別顯示設定（試算與金額換算共用） */
  currencySettings?: CurrencySettings
}

/** 首頁的專案分類（例如：初次諮詢／製作中／已完成），使用者自訂名稱 */
export interface ProposalCategory {
  id: string
  name: string
  createdAt: string
}

export interface CurrencySettings {
  /** 圖表與摘要統一換算後顯示用的主要幣別 */
  primaryDisplayCurrency: CurrencyCode
  /** 美元兌台幣匯率（1 美元 = N 台幣），手動設定 */
  usdToTwdRate: number
  /** 匯率最後更新時間（僅手動輸入時也會記錄，供使用者確認） */
  rateUpdatedAt?: string
}

export function defaultCurrencySettings(): CurrencySettings {
  return { primaryDisplayCurrency: 'TWD', usdToTwdRate: 32, rateUpdatedAt: undefined }
}

export type ContributionMode = 'lumpSum' | 'annual' | 'monthly'

/**
 * 資產成長試算項目：每一項資產（例如分紅保單、ETF、定存）都有自己獨立的
 * 幣別、投入方式、投入金額、投入年數與報酬率 —— 彼此不共用同一組假設。
 * 「投入年數」（contributionYears）與「試算總年數」（totalYears）是分開的兩個設定：
 * 投入年數過後不再新增投入，但既有本金仍依報酬率持續複利成長到試算總年數為止。
 */
export interface GrowthAsset {
  id: string
  name: string
  assetKind?: string
  currency: CurrencyCode
  customCurrencyLabel?: string
  contributionMode: ContributionMode
  /** 單筆投入時的起始金額（contributionMode === 'lumpSum' 時使用） */
  initialAmount: number
  /** 每年或每月投入金額（contributionMode === 'annual' | 'monthly' 時使用） */
  periodicAmount: number
  /** 持續投入幾年後停止（僅 annual/monthly 適用；lumpSum 忽略此欄位） */
  contributionYears: number
  annualReturnRate: number
  /** 試算總年數：圖表與最終試算會算到這一年，停止投入後本金仍持續成長到這裡 */
  totalYears: number
  /** 從第幾年開始投入（0 = 立刻開始），用於錯開不同資產的起始時間 */
  startYearOffset: number
  visible: boolean
  color: string
}

export function defaultGrowthAsset(name: string, color: string): GrowthAsset {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name,
    currency: 'TWD',
    contributionMode: 'annual',
    initialAmount: 0,
    periodicAmount: 0,
    contributionYears: 10,
    annualReturnRate: 5,
    totalYears: 20,
    startYearOffset: 0,
    visible: true,
    color
  }
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
  categoryId?: string
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
