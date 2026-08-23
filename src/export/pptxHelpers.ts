import type pptxgen from 'pptxgenjs'
import type { CurrencyCode, RichTextContent } from '../types'
import type { ZetaTheme } from '../styles/theme'

/** PPT 匯出的圖表相容性模式：editable 優先可編輯性（原生 Chart），keynote 優先相容性（PNG 圖片） */
export type PptChartMode = 'editable' | 'keynote'

/** PPT 中文字型：使用系統常見字型，避免換電腦跑版 */
export const PPT_FONT = 'Microsoft JhengHei'

export const SLIDE_W = 13.333
export const SLIDE_H = 7.5

export function currencyLabel(currency: CurrencyCode, custom?: string): string {
  if (currency === 'TWD') return 'NT$'
  if (currency === 'USD') return 'US$'
  return custom || ''
}

export function formatAmount(amount: number, currency: CurrencyCode, custom?: string): string {
  const safe = Number.isFinite(amount) ? amount : 0
  const formatted = safe.toLocaleString('zh-Hant-TW', { maximumFractionDigits: 0 })
  return `${currencyLabel(currency, custom)}${formatted}`
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${value.toFixed(1)}%`
}

/**
 * 將 Tiptap JSON 轉換成 PptxGenJS 的 TextProps[]（RichTextRun 陣列）。
 * 保留：顏色、粗體、斜體、底線、換行、對齊、項目符號。
 * 絕對不轉成圖片 — 全部維持可編輯文字。
 */
export function richTextToPptxRuns(
  value: RichTextContent,
  base: { fontSize?: number; color?: string; align?: 'left' | 'center' | 'right' } = {}
): pptxgen.TextProps[] {
  const runs: pptxgen.TextProps[] = []
  if (!value || typeof value !== 'object') return [{ text: '', options: { fontFace: PPT_FONT, ...base } }]
  const doc = value as any
  const paragraphs = doc.content ?? []

  if (paragraphs.length === 0) {
    return [{ text: '', options: { fontFace: PPT_FONT, ...base } }]
  }

  paragraphs.forEach((para: any, pIndex: number) => {
    const isList = para.type === 'bulletList' || para.type === 'orderedList'
    if (isList) {
      const items = para.content ?? []
      items.forEach((li: any, i: number) => {
        const inline = (li.content?.[0]?.content ?? []) as any[]
        pushInlineRuns(runs, inline, base, {
          bullet: para.type === 'bulletList' ? true : { code: '25CF' },
          breakLine: true,
          align: base.align
        })
        void i
      })
      return
    }
    const align = para.attrs?.textAlign ?? base.align
    const inline = para.content ?? []
    pushInlineRuns(runs, inline, base, { breakLine: pIndex < paragraphs.length - 1, align })
  })

  if (runs.length === 0) return [{ text: '', options: { fontFace: PPT_FONT, ...base } }]
  return runs
}

function pushInlineRuns(
  runs: pptxgen.TextProps[],
  inline: any[],
  base: { fontSize?: number; color?: string },
  extra: Record<string, unknown>
) {
  if (inline.length === 0) {
    runs.push({ text: '', options: { fontFace: PPT_FONT, ...base, ...extra } as any })
    return
  }
  inline.forEach((textNode: any, i: number) => {
    if (textNode.type !== 'text') return
    const options: Record<string, unknown> = { fontFace: PPT_FONT, ...base, ...(i === inline.length - 1 ? extra : { ...extra, breakLine: false }) }
    for (const mark of textNode.marks ?? []) {
      if (mark.type === 'bold') options.bold = true
      if (mark.type === 'italic') options.italic = true
      if (mark.type === 'underline') options.underline = { style: 'sng' }
      if (mark.type === 'strike') options.strike = 'sngStrike'
      if (mark.type === 'textStyle' && mark.attrs?.color) options.color = String(mark.attrs.color).replace('#', '')
      if (mark.type === 'textStyle' && mark.attrs?.fontSize) options.fontSize = Number(mark.attrs.fontSize)
      if (mark.type === 'highlight') options.highlight = String(mark.attrs?.color ?? 'E8DCCB').replace('#', '')
    }
    runs.push({ text: textNode.text ?? '', options: options as any })
  })
}

export function hex(color: string): string {
  return color.replace('#', '')
}

/** 加入頁首品牌名稱 + 頁尾頁碼，所有頁面共用 */
export function addHeaderFooter(
  slide: pptxgen.Slide,
  theme: ZetaTheme,
  opts: { brandName: string; pageNumber: number; light?: boolean }
) {
  const color = opts.light ? theme.white : theme.navy
  slide.addText(opts.brandName, {
    x: 0.4,
    y: SLIDE_H - 0.42,
    w: 6,
    h: 0.32,
    fontSize: 9,
    color: hex(color),
    fontFace: PPT_FONT
  })
  slide.addText(String(opts.pageNumber), {
    x: SLIDE_W - 0.9,
    y: SLIDE_H - 0.42,
    w: 0.5,
    h: 0.32,
    fontSize: 9,
    align: 'right',
    color: hex(color),
    fontFace: PPT_FONT
  })
}

export function addGoldRule(slide: pptxgen.Slide, x: number, y: number, w: number, color: string) {
  slide.addShape('line', { x, y, w, h: 0, line: { color: hex(color), width: 1.5 } })
}

export function safeText(text: string | undefined | null, fallback = ''): string {
  const t = (text ?? '').trim()
  return t.length > 0 ? t : fallback
}

/** 長文字自動縮小字級的簡易估算（避免溢出投影片） */
export function autoFitFontSize(text: string, baseSize: number, maxChars: number): number {
  if (text.length <= maxChars) return baseSize
  const ratio = maxChars / text.length
  return Math.max(baseSize * Math.max(ratio, 0.6), baseSize * 0.6)
}

/** px（圖表匯出畫布單位）轉投影片使用的英吋單位，供 addImage 定位/尺寸使用 */
export function pxToIn(px: number, pxPerIn = 96): number {
  return px / pxPerIn
}

/**
 * 在投影片上加入一張以 canvas 產生的圖表 PNG（dataUrl），並確保：
 * - 使用固定尺寸，不做超出投影片邊界的定位
 * - 不群組、不加裁切遮罩（Keynote 相容性考量）
 */
export function addChartImage(
  slide: pptxgen.Slide,
  dataUrl: string,
  opts: { x: number; y: number; w: number; h: number }
) {
  slide.addImage({ data: dataUrl, x: opts.x, y: opts.y, w: opts.w, h: opts.h })
}
