import type pptxgen from 'pptxgenjs'
import type { AssetAllocationData, ProposalSlide } from '../../types'
import type { ZetaTheme } from '../../styles/theme'
import { PPT_FONT, SLIDE_H, SLIDE_W, formatAmount, formatPercent, hex, addChartImage, type PptChartMode } from '../pptxHelpers'
import { renderPieChartPng, renderBarChartPng } from '../chartRenderer'

function visibleTotal(d: AssetAllocationData) {
  const visible = d.items.filter((i) => i.visible)
  const total = visible.reduce((s, i) => s + Math.max(0, i.amount), 0)
  return { visible, total }
}

function addChartOrImage(
  pptx: pptxgen,
  s: pptxgen.Slide,
  d: AssetAllocationData,
  mode: PptChartMode,
  box: { x: number; y: number; w: number; h: number }
) {
  const { visible, total } = visibleTotal(d)
  if (total <= 0 || visible.length === 0) return

  if (mode === 'editable' && d.chartType !== 'bar') {
    s.addChart(pptx.ChartType.doughnut, [{ name: '資產配置', labels: visible.map((i) => i.name), values: visible.map((i) => Math.max(0, i.amount)) }], {
      x: box.x, y: box.y, w: box.w, h: box.h,
      holeSize: d.chartType === 'donut' ? 55 : 0,
      showLegend: true, legendPos: 'b', chartColors: visible.map((i) => hex(i.color)), showPercent: d.showPercentage
    })
    return
  }
  if (mode === 'editable' && d.chartType === 'bar') {
    s.addChart(pptx.ChartType.bar, [{ name: '資產配置', labels: visible.map((i) => i.name), values: visible.map((i) => Math.max(0, i.amount)) }], {
      x: box.x, y: box.y, w: box.w, h: box.h, barDir: 'bar', showLegend: false, chartColors: visible.map((i) => hex(i.color))
    })
    return
  }

  // Keynote 模式：一律轉成高解析度 PNG，避免原生 Chart 消失。
  // 重要：PNG 的寬高比例必須與實際要放入的 box 完全一致（皆以 96px/in 換算），
  // 否則圖片會被 PptxGenJS 依 box 的 w/h 拉伸，造成圖表變形、版面跑掉。
  const pngW = Math.round(box.w * 96)
  const pngH = Math.round(box.h * 96)
  const png = d.chartType === 'bar'
    ? renderBarChartPng(visible.map((i) => ({ name: i.name, value: i.amount, color: i.color })), { width: pngW, height: pngH })
    : renderPieChartPng(visible.map((i) => ({ name: i.name, value: i.amount, color: i.color })), { width: pngW, height: pngH, donut: d.chartType === 'donut', showLegend: false })
  addChartImage(s, png, box)
}

export function exportAssetAllocationSlide(pptx: pptxgen, slide: ProposalSlide<AssetAllocationData>, theme: ZetaTheme, mode: PptChartMode) {
  const s = pptx.addSlide()
  const d = slide.data
  s.background = { color: hex(theme.bgPrimary) }
  const { visible, total } = visibleTotal(d)

  switch (slide.layoutId) {
    case 'topTotalBottomChart':
      exportTopTotalBottomChart(pptx, s, d, theme, mode, visible, total)
      break
    case 'cardStyle':
      exportDashboard(pptx, s, d, theme, mode, visible, total)
      break
    case 'leftChartRightTable':
    default:
      exportLeftChartRightTable(pptx, s, d, theme, mode, visible, total)
  }
}

function exportLeftChartRightTable(pptx: pptxgen, s: pptxgen.Slide, d: AssetAllocationData, theme: ZetaTheme, mode: PptChartMode, visible: typeof d.items, total: number) {
  s.addText(d.heading || '資產配置', { x: 0.6, y: 0.45, w: 8, h: 0.6, fontSize: 26, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  s.addText(`總資產 ${formatAmount(total, d.currency, d.customCurrencyLabel)}`, { x: 9.5, y: 0.5, w: 3.2, h: 0.5, fontSize: 14, bold: true, align: 'right', color: hex(theme.navy), fontFace: PPT_FONT })
  s.addShape('line', { x: 0.62, y: 1.05, w: 1.6, h: 0, line: { color: hex(theme.gold), width: 2 } })

  if (total <= 0) {
    s.addText('目前尚未輸入資產項目金額，請於編輯器中補上資料。', { x: 1, y: 3.2, w: 8, h: 1, fontSize: 14, color: hex(theme.text), fontFace: PPT_FONT, align: 'center' })
  } else {
    addChartOrImage(pptx, s, d, mode, { x: 1.0, y: 1.35, w: 5.4, h: 4.8 })
  }

  const rows: pptxgen.TableRow[] = [[
    { text: '項目', options: { bold: true, color: hex(theme.white), fill: { color: hex(theme.navy) } } },
    { text: d.showAmount ? '金額' : '', options: { bold: true, color: hex(theme.white), fill: { color: hex(theme.navy) } } },
    { text: d.showPercentage ? '占比' : '', options: { bold: true, color: hex(theme.white), fill: { color: hex(theme.navy) } } }
  ]]
  visible.forEach((item) => {
    const pct = total > 0 ? (Math.max(0, item.amount) / total) * 100 : 0
    rows.push([
      { text: item.name, options: { color: hex(theme.text) } },
      { text: d.showAmount ? formatAmount(item.amount, d.currency, d.customCurrencyLabel) : '', options: { color: hex(theme.text) } },
      { text: d.showPercentage ? formatPercent(pct) : '', options: { color: hex(theme.text) } }
    ])
  })
  s.addTable(rows, { x: 6.8, y: 1.35, w: 5.9, h: 4.6, fontSize: 11, fontFace: PPT_FONT, border: { type: 'solid', color: 'E8DCCB', pt: 0.5 }, autoPage: false })
}

function exportTopTotalBottomChart(pptx: pptxgen, s: pptxgen.Slide, d: AssetAllocationData, theme: ZetaTheme, mode: PptChartMode, visible: typeof d.items, total: number) {
  s.addText(d.heading || '資產配置', { x: 0, y: 0.4, w: SLIDE_W, h: 0.5, fontSize: 22, bold: true, color: hex(theme.navy), fontFace: PPT_FONT, align: 'center' })
  s.addText(`總資產　${formatAmount(total, d.currency, d.customCurrencyLabel)}`, { x: 0, y: 0.95, w: SLIDE_W, h: 0.6, fontSize: 22, bold: true, color: hex(theme.navy), fontFace: PPT_FONT, align: 'center' })

  if (total > 0) addChartOrImage(pptx, s, d, mode, { x: SLIDE_W / 2 - 1.3, y: 1.6, w: 2.6, h: 2.6 })

  const cardW = (SLIDE_W - 1.2 - (visible.length - 1) * 0.2) / Math.max(1, visible.length)
  visible.forEach((item, i) => {
    const x = 0.6 + i * (cardW + 0.2)
    const pct = total > 0 ? (Math.max(0, item.amount) / total) * 100 : 0
    s.addShape('roundRect', { x, y: 4.5, w: cardW, h: 1.6, fill: { color: hex(theme.white) }, line: { color: hex(item.color), width: 1.5 }, rectRadius: 0.08 })
    s.addText(item.name, { x: x + 0.15, y: 4.65, w: cardW - 0.3, h: 0.3, fontSize: 10, color: hex(theme.text), fontFace: PPT_FONT })
    if (d.showAmount) s.addText(formatAmount(item.amount, d.currency, d.customCurrencyLabel), { x: x + 0.15, y: 4.95, w: cardW - 0.3, h: 0.4, fontSize: 13, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
    if (d.showPercentage) s.addText(formatPercent(pct), { x: x + 0.15, y: 5.35, w: cardW - 0.3, h: 0.3, fontSize: 10, color: hex(item.color), fontFace: PPT_FONT })
  })
}

function exportDashboard(pptx: pptxgen, s: pptxgen.Slide, d: AssetAllocationData, theme: ZetaTheme, mode: PptChartMode, visible: typeof d.items, total: number) {
  s.addText(d.heading || '資產配置', { x: 0.6, y: 0.4, w: 8, h: 0.5, fontSize: 20, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })

  s.addShape('roundRect', { x: 0.6, y: 1.0, w: 5.9, h: 1.15, fill: { color: hex(theme.navy) }, rectRadius: 0.1 })
  s.addText('總資產', { x: 0.85, y: 1.12, w: 3, h: 0.3, fontSize: 10, color: hex(theme.cream), fontFace: PPT_FONT })
  s.addText(formatAmount(total, d.currency, d.customCurrencyLabel), { x: 0.85, y: 1.4, w: 5.4, h: 0.6, fontSize: 22, bold: true, color: hex(theme.gold), fontFace: PPT_FONT })

  const largest = visible.reduce((max, i) => (i.amount > (max?.amount ?? -Infinity) ? i : max), visible[0])
  s.addShape('roundRect', { x: 6.8, y: 1.0, w: 5.9, h: 1.15, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 1 }, rectRadius: 0.1 })
  s.addText('最大資產類別', { x: 7.05, y: 1.12, w: 4, h: 0.3, fontSize: 10, color: hex(theme.text), fontFace: PPT_FONT })
  if (largest) {
    const pct = total > 0 ? (largest.amount / total) * 100 : 0
    s.addText(`${largest.name}　${formatAmount(largest.amount, d.currency, d.customCurrencyLabel)}（${formatPercent(pct)}）`, {
      x: 7.05, y: 1.4, w: 5.4, h: 0.6, fontSize: 15, bold: true, color: hex(largest.color), fontFace: PPT_FONT
    })
  }

  if (total > 0) {
    if (mode === 'editable') {
      addChartOrImage(pptx, s, { ...d, chartType: 'bar' }, mode, { x: 0.6, y: 2.4, w: 5.9, h: 4.3 })
    } else {
      const png = renderBarChartPng(visible.map((i) => ({ name: i.name, value: i.amount, color: i.color })), { width: Math.round(5.9 * 96), height: Math.round(4.3 * 96) })
      addChartImage(s, png, { x: 0.6, y: 2.4, w: 5.9, h: 4.3 })
    }
  }

  const colW = (5.9 - 0.15) / 2
  visible.forEach((item, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 6.8 + col * (colW + 0.15)
    const y = 2.4 + row * 0.9
    const pct = total > 0 ? (Math.max(0, item.amount) / total) * 100 : 0
    s.addShape('roundRect', { x, y, w: colW, h: 0.75, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 0.75 }, rectRadius: 0.06 })
    s.addText(item.name, { x: x + 0.1, y: y + 0.06, w: colW - 0.2, h: 0.25, fontSize: 9, color: hex(theme.text), fontFace: PPT_FONT })
    s.addText(`${formatAmount(item.amount, d.currency, d.customCurrencyLabel)}　${formatPercent(pct)}`, { x: x + 0.1, y: y + 0.32, w: colW - 0.2, h: 0.35, fontSize: 10, bold: true, color: hex(item.color), fontFace: PPT_FONT })
  })
}
