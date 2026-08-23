// 品牌 Theme Tokens — 網頁預覽與 PPT 匯出共用同一份設定
// 之後要新增第 4 套風格，只需要在 THEMES 裡新增一筆即可

export type ThemeId = 'classicNavyGold' | 'warmCream' | 'minimalIvory'

export interface ZetaTheme {
  id: ThemeId
  name: string
  navy: string
  gold: string
  cream: string
  ivory: string
  white: string
  text: string
  danger: string
  positive: string
  /** 頁面主要背景色 */
  bgPrimary: string
  /** 頁面次要背景色（卡片、區塊） */
  bgSecondary: string
  /** 標題文字色 */
  headingColor: string
  /** 強調金線是否使用 */
  accentLine: boolean
}

export const THEMES: Record<ThemeId, ZetaTheme> = {
  classicNavyGold: {
    id: 'classicNavyGold',
    name: '經典藍金版',
    navy: '#19324A',
    gold: '#D3AF37',
    cream: '#E8DCCB',
    ivory: '#F8F5EF',
    white: '#FFFFFF',
    text: '#333333',
    danger: '#B54A4A',
    positive: '#4F7965',
    // 注意：bgPrimary 是「內容型頁面」（資產配置圖、Before&After、建議書、
    // 帳戶分配圖、自訂主題頁等）的頁面底色。這些頁面上的內文一律使用深灰色
    // (theme.text) 或深藍色文字，因此 bgPrimary 必須維持淺色才能保持可讀性 ——
    // 深藍色只作為強調用途（卡片、圖表、Cover／結論頁等已有專屬深色設計的版型），
    // 不能直接套用在一般內容頁的整頁背景。
    bgPrimary: '#EEF2F6',
    bgSecondary: '#FFFFFF',
    headingColor: '#19324A',
    accentLine: true
  },
  warmCream: {
    id: 'warmCream',
    name: '溫暖奶茶版',
    navy: '#19324A',
    gold: '#D3AF37',
    cream: '#E8DCCB',
    ivory: '#F8F5EF',
    white: '#FFFFFF',
    text: '#333333',
    danger: '#B54A4A',
    positive: '#4F7965',
    bgPrimary: '#E8DCCB',
    bgSecondary: '#FFFFFF',
    headingColor: '#19324A',
    accentLine: true
  },
  minimalIvory: {
    id: 'minimalIvory',
    name: '極簡米白版',
    navy: '#19324A',
    gold: '#D3AF37',
    cream: '#E8DCCB',
    ivory: '#F8F5EF',
    white: '#FFFFFF',
    text: '#333333',
    danger: '#B54A4A',
    positive: '#4F7965',
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F8F5EF',
    headingColor: '#19324A',
    accentLine: false
  }
}

export const DEFAULT_THEME: ThemeId = 'classicNavyGold'

export function getTheme(id: ThemeId | undefined): ZetaTheme {
  return THEMES[id ?? DEFAULT_THEME]
}

/** 圖表/圓餅圖預設色票，維持品牌一致但可辨識度足夠 */
export const CHART_PALETTE = ['#19324A', '#D3AF37', '#4F7965', '#B54A4A', '#8C6E4B', '#6E8CA0', '#A98BC7', '#C97A5A']
