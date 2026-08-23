import type pptxgen from 'pptxgenjs'
import type { AssetItem, BeforeAfterData, ProposalSlide } from '../../types'
import type { ZetaTheme } from '../../styles/theme'
import { PPT_FONT, SLIDE_H, SLIDE_W, formatAmount, hex, addChartImage, type PptChartMode } from '../pptxHelpers'
import { renderPieChartPng, renderLineChartPng } from '../chartRenderer'
import { resolveLineComparisonPoints, finalGap } from '../../services/lineComparisonCalc'
import { defaultLineComparisonData } from '../../data/slideDefaults'
import { currencyLabel } from '../pptxHelpers'

function sumVisible(items: AssetItem[]): number {
  return items.filter((i) => i.visible).reduce((s, i) => s + Math.max(0, i.amount), 0)
}

export function exportBeforeAfterSlide(pptx: pptxgen, slide: ProposalSlide<BeforeAfterData>, theme: ZetaTheme, mode: PptChartMode) {
  const s = pptx.addSlide()
  const d = slide.data
  s.background = { color: hex(theme.bgPrimary) }

  switch (slide.layoutId) {
    case 'sideCards':
      exportSideCards(s, d, theme)
      break
    case 'lineComparison':
      exportLineComparison(pptx, s, d, theme, mode)
      break
    case 'dualPie':
    default:
      exportDualPie(pptx, s, d, theme, mode)
  }
}

function exportDualPie(pptx: pptxgen, s: pptxgen.Slide, d: BeforeAfterData, theme: ZetaTheme, mode: PptChartMode) {
  s.addText(d.heading || 'Before & After', { x: 0.6, y: 0.4, w: 10, h: 0.6, fontSize: 26, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  s.addShape('line', { x: 0.62, y: 1.0, w: 1.6, h: 0, line: { color: hex(theme.gold), width: 2 } })

  const beforeTotal = sumVisible(d.beforeItems)
  const afterTotal = sumVisible(d.afterItems)
  const diff = afterTotal - beforeTotal

  const renderSide = (x: number, label: string, items: AssetItem[], total: number) => {
    s.addShape('roundRect', { x, y: 1.25, w: 5.8, h: 4.4, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 1 }, rectRadius: 0.1 })
    s.addText(label, { x: x + 0.3, y: 1.45, w: 4, h: 0.4, fontSize: 15, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })

    const visible = items.filter((i) => i.visible)
    if (visible.length === 0 || total <= 0) {
      s.addText('尚無資產項目', { x: x + 0.3, y: 2.4, w: 5.2, h: 0.5, fontSize: 12, color: hex(theme.text), fontFace: PPT_FONT })
    } else if (mode === 'editable') {
      s.addChart(pptx.ChartType.doughnut, [{ name: label, labels: visible.map((i) => i.name), values: visible.map((i) => Math.max(0, i.amount)) }], {
        x: x + 0.3, y: 1.85, w: 3.1, h: 2.5, holeSize: 55, showLegend: false, chartColors: visible.map((i) => hex(i.color))
      })
      let ty = 1.9
      visible.forEach((item, idx) => {
        const pct = total > 0 ? ((Math.max(0, item.amount) / total) * 100).toFixed(1) : '0.0'
        s.addShape('rect', { x: x + 3.5, y: ty + idx * 0.42, w: 0.14, h: 0.14, fill: { color: hex(item.color) } })
        s.addText(`${item.name}  ${formatAmount(item.amount, d.currency, d.customCurrencyLabel)}（${pct}%）`, { x: x + 3.72, y: ty + idx * 0.42 - 0.06, w: 2.0, h: 0.3, fontSize: 8.5, color: hex(theme.text), fontFace: PPT_FONT })
      })
    } else {
      // PNG 尺寸必須與放入的 box（5.2in x 2.5in）比例一致，否則會被拉伸變形
      const png = renderPieChartPng(visible.map((i) => ({ name: i.name, value: i.amount, color: i.color })), { width: Math.round(5.2 * 96), height: Math.round(2.5 * 96), donut: true, showLegend: true, legendColor: '#333333' })
      addChartImage(s, png, { x: x + 0.3, y: 1.85, w: 5.2, h: 2.5 })
    }

    s.addText(`總計：${formatAmount(total, d.currency, d.customCurrencyLabel)}`, { x: x + 0.3, y: 5.15, w: 5.2, h: 0.35, fontSize: 12, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  }

  renderSide(0.6, d.beforeLabel || '調整前', d.beforeItems, beforeTotal)
  renderSide(6.9, d.afterLabel || '調整後', d.afterItems, afterTotal)
  s.addShape('rightArrow', { x: 6.35, y: 3.0, w: 0.5, h: 0.4, fill: { color: hex(theme.gold) } })

  const diffLabel = diff === 0 ? '配置金額一致' : diff > 0 ? `增加 ${formatAmount(diff, d.currency, d.customCurrencyLabel)}` : `減少 ${formatAmount(Math.abs(diff), d.currency, d.customCurrencyLabel)}`
  s.addText(
    [
      { text: `差額說明：${diffLabel}\n`, options: { bold: true, color: hex(theme.navy), fontSize: 11, breakLine: true } },
      { text: d.differenceNote || '（尚未填寫用途說明）', options: { color: hex(theme.text), fontSize: 10 } }
    ],
    { x: 0.6, y: SLIDE_H - 1.05, w: 12.1, h: 0.6, fontFace: PPT_FONT }
  )
}

function exportSideCards(s: pptxgen.Slide, d: BeforeAfterData, theme: ZetaTheme) {
  s.addText(d.heading || 'Before & After', { x: 0.6, y: 0.4, w: 10, h: 0.6, fontSize: 26, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  s.addShape('line', { x: 0.62, y: 1.0, w: 1.6, h: 0, line: { color: hex(theme.gold), width: 2 } })

  const beforeTotal = sumVisible(d.beforeItems)
  const afterTotal = sumVisible(d.afterItems)

  s.addShape('roundRect', { x: 0.6, y: 1.25, w: 5.9, h: 0.9, fill: { color: hex(theme.navy) }, rectRadius: 0.08 })
  s.addText(`${d.beforeLabel}總額`, { x: 0.85, y: 1.35, w: 4, h: 0.3, fontSize: 10, color: hex(theme.cream), fontFace: PPT_FONT })
  s.addText(formatAmount(beforeTotal, d.currency, d.customCurrencyLabel), { x: 0.85, y: 1.6, w: 5.4, h: 0.5, fontSize: 18, bold: true, color: hex(theme.gold), fontFace: PPT_FONT })

  s.addShape('roundRect', { x: 6.8, y: 1.25, w: 5.9, h: 0.9, fill: { color: hex(theme.gold) }, rectRadius: 0.08 })
  s.addText(`${d.afterLabel}總額`, { x: 7.05, y: 1.35, w: 4, h: 0.3, fontSize: 10, color: hex(theme.navy), fontFace: PPT_FONT })
  s.addText(formatAmount(afterTotal, d.currency, d.customCurrencyLabel), { x: 7.05, y: 1.6, w: 5.4, h: 0.5, fontSize: 18, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })

  const names = Array.from(new Set([...d.beforeItems.filter((i) => i.visible).map((i) => i.name), ...d.afterItems.filter((i) => i.visible).map((i) => i.name)]))
  const rows: pptxgen.TableRow[] = [[
    { text: '項目', options: { bold: true, color: hex(theme.white), fill: { color: hex(theme.navy) } } },
    { text: d.beforeLabel, options: { bold: true, color: hex(theme.white), fill: { color: hex(theme.navy) }, align: 'right' } },
    { text: d.afterLabel, options: { bold: true, color: hex(theme.white), fill: { color: hex(theme.navy) }, align: 'right' } },
    { text: '差額', options: { bold: true, color: hex(theme.white), fill: { color: hex(theme.navy) }, align: 'right' } }
  ]]
  names.forEach((name) => {
    const before = d.beforeItems.find((i) => i.name === name && i.visible)
    const after = d.afterItems.find((i) => i.name === name && i.visible)
    const beforeAmt = before?.amount ?? 0
    const afterAmt = after?.amount ?? 0
    const delta = afterAmt - beforeAmt
    rows.push([
      { text: name, options: { color: hex(theme.text) } },
      { text: formatAmount(beforeAmt, d.currency, d.customCurrencyLabel), options: { color: hex(theme.text), align: 'right' } },
      { text: formatAmount(afterAmt, d.currency, d.customCurrencyLabel), options: { color: hex(theme.navy), bold: true, align: 'right' } },
      { text: `${delta >= 0 ? '+' : ''}${formatAmount(delta, d.currency, d.customCurrencyLabel)}`, options: { color: hex(delta >= 0 ? theme.positive : theme.danger), bold: true, align: 'right' } }
    ])
  })
  s.addTable(rows, { x: 0.6, y: 2.35, w: 12.1, h: 3.9, fontSize: 11, fontFace: PPT_FONT, border: { type: 'solid', color: 'E8DCCB', pt: 0.5 }, autoPage: false })

  s.addText(`差額說明：${d.differenceNote || '（尚未填寫用途說明）'}`, { x: 0.6, y: SLIDE_H - 0.55, w: 12.1, h: 0.35, fontSize: 10, color: hex(theme.text), fontFace: PPT_FONT })
}

function exportLineComparison(pptx: pptxgen, s: pptxgen.Slide, d: BeforeAfterData, theme: ZetaTheme, mode: PptChartMode) {
  const line = d.lineComparison ?? defaultLineComparisonData()
  const points = resolveLineComparisonPoints(line, d.beforeItems, d.afterItems)
  const fmt = (v: number) => `${currencyLabel(line.currency, line.customCurrencyLabel)}${Math.round(v).toLocaleString('zh-Hant-TW')}`

  s.addText(line.chartTitle || d.heading || '資產成長折線比較', { x: 0.6, y: 0.4, w: 10, h: 0.5, fontSize: 24, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  if (line.chartDescription) {
    s.addText(line.chartDescription, { x: 0.6, y: 0.9, w: 10, h: 0.35, fontSize: 11, color: hex(theme.text), fontFace: PPT_FONT })
  }
  s.addShape('line', { x: 0.62, y: 1.3, w: 1.6, h: 0, line: { color: hex(theme.gold), width: 2 } })

  if (points.length === 0) {
    s.addText('尚未輸入任何時間點資料', { x: 1, y: 3, w: 8, h: 1, fontSize: 14, color: hex(theme.text), fontFace: PPT_FONT, align: 'center' })
    return
  }

  // 折線圖必定使用 PNG（無論可編輯或Keynote模式）：PptxGenJS 原生折線圖同樣有
  // Keynote 相容性風險，且折線圖含多條線＋目標參考線的樣式用原生 Chart API 難以精準控制。
  // PNG 尺寸必須與放入的 box（9.2in x 4.9in）比例一致，否則折線圖會被拉伸變形。
  const png = renderLineChartPng(
    points.map((p) => p.label),
    [
      { name: line.beforeName, color: line.beforeColor, values: points.map((p) => p.beforeAmount), strokeWidth: 2 },
      { name: line.afterName, color: line.afterColor, values: points.map((p) => p.afterAmount), strokeWidth: 3 }
    ],
    {
      width: Math.round(9.2 * 96), height: Math.round(4.9 * 96),
      referenceLine: line.showTarget ? { value: line.targetAmount, color: line.targetColor, label: '目標' } : undefined,
      yFormatter: fmt
    }
  )
  addChartImage(s, png, { x: 0.6, y: 1.45, w: 9.2, h: 4.9 })

  const gap = finalGap(points)
  s.addShape('roundRect', { x: 10.0, y: 1.45, w: 2.7, h: 1.2, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 1 }, rectRadius: 0.08 })
  s.addText('最終差距', { x: 10.2, y: 1.6, w: 2.3, h: 0.3, fontSize: 10, color: hex(theme.text), fontFace: PPT_FONT })
  s.addText(`${gap >= 0 ? '+' : ''}${fmt(gap)}`, { x: 10.2, y: 1.9, w: 2.3, h: 0.5, fontSize: 16, bold: true, color: hex(gap >= 0 ? theme.positive : theme.danger), fontFace: PPT_FONT })

  if (line.showTarget) {
    s.addShape('roundRect', { x: 10.0, y: 2.8, w: 2.7, h: 1.2, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 1 }, rectRadius: 0.08 })
    s.addText('目標資產', { x: 10.2, y: 2.95, w: 2.3, h: 0.3, fontSize: 10, color: hex(theme.text), fontFace: PPT_FONT })
    s.addText(fmt(line.targetAmount), { x: 10.2, y: 3.25, w: 2.3, h: 0.5, fontSize: 16, bold: true, color: hex(line.targetColor), fontFace: PPT_FONT })
  }
}
