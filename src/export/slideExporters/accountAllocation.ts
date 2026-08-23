import type pptxgen from 'pptxgenjs'
import type { AccountAllocationData, ProposalSlide } from '../../types'
import type { ZetaTheme } from '../../styles/theme'
import { PPT_FONT, SLIDE_H, SLIDE_W, formatAmount, hex, addChartImage, type PptChartMode } from '../pptxHelpers'
import { buildMoneyFlowLayout, buildTreeLayout, computeAllocationSummary } from '../../services/accountAllocationLayout'
import { renderFlowDiagramPng } from '../chartRenderer'

export function exportAccountAllocationSlide(pptx: pptxgen, slide: ProposalSlide<AccountAllocationData>, theme: ZetaTheme, mode: PptChartMode) {
  const s = pptx.addSlide()
  const d = slide.data
  s.background = { color: hex(theme.bgPrimary) }
  const summary = computeAllocationSummary(d)
  const fmt = (v: number) => formatAmount(v, d.currency, d.customCurrencyLabel)

  s.addText(d.heading || '收入與帳戶分配圖', { x: 0.6, y: 0.35, w: 8, h: 0.5, fontSize: 22, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  addAllocationBadge(s, theme, summary, fmt)
  s.addShape('line', { x: 0.62, y: 0.95, w: 1.6, h: 0, line: { color: hex(theme.gold), width: 2 } })

  switch (slide.layoutId) {
    case 'treeAccount':
      exportTree(s, d, theme, mode)
      break
    case 'allocationCards':
      exportCards(s, d, theme)
      break
    case 'moneyFlow':
    default:
      exportMoneyFlow(s, d, theme, mode)
  }
}

function addAllocationBadge(s: pptxgen.Slide, theme: ZetaTheme, summary: ReturnType<typeof computeAllocationSummary>, fmt: (v: number) => string) {
  let text = '已完全分配'
  let bg = theme.positive
  if (summary.unallocated > 0) { text = `尚有 ${fmt(summary.unallocated)} 未分配`; bg = theme.cream }
  if (summary.overAllocated > 0) { text = `目前超額分配 ${fmt(summary.overAllocated)}`; bg = theme.danger }
  s.addShape('roundRect', { x: 9.8, y: 0.4, w: 2.9, h: 0.4, fill: { color: hex(bg) }, rectRadius: 0.2 })
  s.addText(text, { x: 9.8, y: 0.4, w: 2.9, h: 0.4, fontSize: 9, bold: true, color: hex(bg === theme.cream ? theme.navy : '#FFFFFF'), fontFace: PPT_FONT, align: 'center', valign: 'middle' })
}

/**
 * 模板A（資金流向圖）與模板B（樹狀帳戶圖）都是含有大量連接線與多層節點的複雜關係圖，
 * 兩種匯出模式一律轉成高解析度 PNG（而非嘗試用大量原生形狀拼湊），
 * 確保可編輯版與 Keynote 相容版的視覺效果一致、且穩定可靠。
 */
function exportMoneyFlow(s: pptxgen.Slide, d: AccountAllocationData, theme: ZetaTheme, _mode: PptChartMode) {
  // 版面座標系的寬高比例，必須與實際嵌入的 box（12.3in x 5.6in）一致，否則整張圖會被拉伸變形
  const layout = buildMoneyFlowLayout(d, 1000, Math.round(1000 * (5.6 / 12.3)))
  const boxes = [layout.income, ...layout.categories]
  const png = renderFlowDiagramPng(boxes, layout.edgesIncomeToCategory, {
    width: layout.width, height: layout.height, amountFormatter: (v) => formatAmount(v, d.currency, d.customCurrencyLabel),
    boxFill: (b) => (b === layout.income ? theme.navy : b.color)
  })
  addChartImage(s, png, { x: 0.5, y: 1.15, w: 12.3, h: 5.6 })

  // 小項目以獨立文字方塊疊加在圖片上方對應位置（保持文字可編輯，同時不影響圖片主體）
  const scaleX = 12.3 / layout.width
  const scaleY = 5.6 / layout.height
  layout.subItems.forEach((sub) => {
    s.addText(`${sub.label}　${formatAmount(sub.amount, d.currency, d.customCurrencyLabel)}`, {
      x: 0.5 + sub.x * scaleX, y: 1.15 + sub.y * scaleY, w: sub.w * scaleX, h: sub.h * scaleY,
      fontSize: 8, color: hex(theme.text), fontFace: PPT_FONT, valign: 'middle'
    })
  })
}

function exportTree(s: pptxgen.Slide, d: AccountAllocationData, theme: ZetaTheme, _mode: PptChartMode) {
  // 同上，版面座標系比例需與 box（12.3in x 5.6in）一致
  const layout = buildTreeLayout(d, 1000, Math.round(1000 * (5.6 / 12.3)))
  const boxes = [layout.root, ...layout.level2, ...layout.level3]
  const edges = [...layout.edgesRootToLevel2, ...layout.edgesLevel2ToLevel3]
  const png = renderFlowDiagramPng(boxes, edges, {
    width: layout.width, height: layout.height, amountFormatter: (v) => formatAmount(v, d.currency, d.customCurrencyLabel),
    boxFill: (b) => (b === layout.root ? theme.navy : b.color),
    textColor: '#FFFFFF'
  })
  addChartImage(s, png, { x: 0.5, y: 1.15, w: 12.3, h: 5.6 })
}

function exportCards(s: pptxgen.Slide, d: AccountAllocationData, theme: ZetaTheme) {
  const visible = d.categories.filter((c) => c.visible)
  const summary = computeAllocationSummary(d)
  const allocatedPct = d.totalIncome > 0 ? Math.min(100, (summary.allocatedTotal / d.totalIncome) * 100) : 0

  s.addShape('roundRect', { x: 0.6, y: 1.15, w: 12.1, h: 0.85, fill: { color: hex(theme.navy) }, rectRadius: 0.1 })
  s.addText('總收入', { x: 0.85, y: 1.25, w: 2, h: 0.3, fontSize: 9, color: hex(theme.cream), fontFace: PPT_FONT })
  s.addText(formatAmount(d.totalIncome, d.currency, d.customCurrencyLabel), { x: 0.85, y: 1.5, w: 3, h: 0.4, fontSize: 16, bold: true, color: hex(theme.gold), fontFace: PPT_FONT })
  s.addShape('roundRect', { x: 4.2, y: 1.45, w: 6.5, h: 0.18, fill: { color: '#FFFFFF', transparency: 80 }, rectRadius: 0.09 })
  s.addShape('roundRect', { x: 4.2, y: 1.45, w: Math.max(0.1, 6.5 * (allocatedPct / 100)), h: 0.18, fill: { color: hex(theme.gold) }, rectRadius: 0.09 })
  s.addText(`${allocatedPct.toFixed(0)}% 已分配`, { x: 10.9, y: 1.25, w: 1.6, h: 0.6, fontSize: 10, color: hex(theme.white), fontFace: PPT_FONT, valign: 'middle' })

  const cols = 3
  const cardW = (12.1 - (cols - 1) * 0.2) / cols
  const cardH = 2.5
  visible.forEach((cat, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = 0.6 + col * (cardW + 0.2)
    const y = 2.2 + row * (cardH + 0.2)
    const pct = d.totalIncome > 0 ? (Math.max(0, cat.amount) / d.totalIncome) * 100 : 0

    s.addShape('roundRect', { x, y, w: cardW, h: cardH, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 1 }, rectRadius: 0.08 })
    s.addText(cat.name, { x: x + 0.15, y: y + 0.12, w: cardW - 0.3, h: 0.3, fontSize: 11, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
    s.addText(`${formatAmount(cat.amount, d.currency, d.customCurrencyLabel)}（${pct.toFixed(0)}%）`, { x: x + 0.15, y: y + 0.42, w: cardW - 0.3, h: 0.3, fontSize: 11, bold: true, color: hex(cat.color), fontFace: PPT_FONT })
    s.addShape('roundRect', { x: x + 0.15, y: y + 0.78, w: cardW - 0.3, h: 0.08, fill: { color: hex(theme.bgSecondary === theme.white ? '#F3F4F6' : theme.ivory) }, rectRadius: 0.04 })
    s.addShape('roundRect', { x: x + 0.15, y: y + 0.78, w: Math.max(0.05, (cardW - 0.3) * (Math.min(100, pct) / 100)), h: 0.08, fill: { color: hex(cat.color) }, rectRadius: 0.04 })

    cat.subItems.filter((sub) => sub.visible).slice(0, 4).forEach((sub, j) => {
      s.addText(`${sub.name}　${formatAmount(sub.amount, d.currency, d.customCurrencyLabel)}`, {
        x: x + 0.15, y: y + 1.0 + j * 0.32, w: cardW - 0.3, h: 0.3, fontSize: 8.5, color: hex(theme.text), fontFace: PPT_FONT
      })
    })
  })
}
