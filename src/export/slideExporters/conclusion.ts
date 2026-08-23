import type pptxgen from 'pptxgenjs'
import type { ConclusionData, ProposalSlide } from '../../types'
import type { ZetaTheme } from '../../styles/theme'
import { PPT_FONT, SLIDE_H, SLIDE_W, hex, richTextToPptxRuns } from '../pptxHelpers'

export function exportConclusionSlide(pptx: pptxgen, slide: ProposalSlide<ConclusionData>, theme: ZetaTheme) {
  const s = pptx.addSlide()
  const d = slide.data

  switch (slide.layoutId) {
    case 'warmClosing':
      exportWarmClosing(s, d, theme)
      break
    case 'threeStep':
    default:
      exportThreeStep(s, d, theme)
  }
}

function exportThreeStep(s: pptxgen.Slide, d: ConclusionData, theme: ZetaTheme) {
  s.background = { color: hex(theme.navy) }
  s.addText(d.heading || '結論與下一步', { x: 0.6, y: 0.4, w: 9, h: 0.6, fontSize: 26, bold: true, color: hex(theme.white), fontFace: PPT_FONT })
  s.addShape('line', { x: 0.62, y: 1.0, w: 1.6, h: 0, line: { color: hex(theme.gold), width: 2 } })

  if (d.summary) {
    s.addText(richTextToPptxRuns(d.summary, { fontSize: 12, color: hex(theme.cream) }), { x: 0.6, y: 1.15, w: 12, h: 0.7, fontFace: PPT_FONT })
  }

  const columns: [string, string[]][] = [
    ['核心建議', d.coreAdvice],
    ['優先執行事項', d.priorities],
    ['下一步行動', d.nextSteps]
  ]
  const colW = 3.9
  columns.forEach(([title, items], colIdx) => {
    const x = 0.6 + colIdx * (colW + 0.2)
    s.addShape('roundRect', { x, y: 2.0, w: colW, h: 3.3, fill: { color: hex(theme.white), transparency: 4 }, rectRadius: 0.12 })
    s.addText(title, { x: x + 0.25, y: 2.2, w: colW - 0.5, h: 0.35, fontSize: 13, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
    items.slice(0, 6).forEach((item, i) => {
      s.addText(`${i + 1}. ${item}`, { x: x + 0.25, y: 2.65 + i * 0.42, w: colW - 0.5, h: 0.38, fontSize: 10.5, color: hex(theme.text), fontFace: PPT_FONT })
    })
  })

  if (d.closingText) {
    s.addText(richTextToPptxRuns(d.closingText, { fontSize: 13, color: hex(theme.gold) }), { x: 0.6, y: 5.5, w: 12.1, h: 0.7, fontFace: PPT_FONT, italic: true, align: 'center' })
  }

  const contactParts = [d.contact, d.instagram, d.website].filter(Boolean).join('　｜　')
  if (contactParts) {
    s.addText(contactParts, { x: 0.6, y: SLIDE_H - 0.65, w: SLIDE_W - 1.2, h: 0.35, fontSize: 10, color: hex(theme.cream), fontFace: PPT_FONT, align: 'center' })
  }
  if (d.qrCode?.dataUrl) s.addImage({ data: d.qrCode.dataUrl, x: SLIDE_W - 1.6, y: 0.5, w: 1, h: 1 })
}

function exportWarmClosing(s: pptxgen.Slide, d: ConclusionData, theme: ZetaTheme) {
  s.background = { color: hex(theme.cream) }

  if (d.closingText) {
    s.addText(richTextToPptxRuns(d.closingText, { fontSize: 18, color: hex(theme.navy), align: 'center' }), {
      x: 1.2, y: 0.5, w: SLIDE_W - 2.4, h: 1.0, fontFace: PPT_FONT, italic: true, align: 'center'
    })
  }
  s.addShape('line', { x: SLIDE_W / 2 - 0.8, y: 1.6, w: 1.6, h: 0, line: { color: hex(theme.gold), width: 2 } })

  // 左側摘要卡
  s.addShape('roundRect', { x: 0.6, y: 1.9, w: 7.6, h: 4.6, fill: { color: hex(theme.white), transparency: 30 }, rectRadius: 0.1 })
  s.addText(d.heading || '結論與下一步', { x: 0.9, y: 2.1, w: 7, h: 0.4, fontSize: 15, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  if (d.summary) s.addText(richTextToPptxRuns(d.summary, { fontSize: 11, color: hex(theme.text) }), { x: 0.9, y: 2.55, w: 7, h: 0.8, fontFace: PPT_FONT })

  s.addText('核心建議', { x: 0.9, y: 3.5, w: 3.4, h: 0.3, fontSize: 12, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  d.coreAdvice.slice(0, 4).forEach((it, i) => {
    s.addText(`• ${it}`, { x: 0.9, y: 3.85 + i * 0.35, w: 3.4, h: 0.32, fontSize: 10, color: hex(theme.text), fontFace: PPT_FONT })
  })
  s.addText('下一步行動', { x: 4.5, y: 3.5, w: 3.4, h: 0.3, fontSize: 12, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  d.nextSteps.slice(0, 4).forEach((it, i) => {
    s.addText(`• ${it}`, { x: 4.5, y: 3.85 + i * 0.35, w: 3.4, h: 0.32, fontSize: 10, color: hex(theme.text), fontFace: PPT_FONT })
  })

  // 右側聯絡資訊卡
  s.addShape('roundRect', { x: 8.5, y: 1.9, w: 4.2, h: 4.6, fill: { color: hex(theme.white) }, rectRadius: 0.1 })
  if (d.advisorPhoto?.dataUrl) {
    s.addImage({ data: d.advisorPhoto.dataUrl, x: 8.5 + 4.2 / 2 - 0.6, y: 2.15, w: 1.2, h: 1.2, rounding: true })
  }
  s.addText('聯絡資訊', { x: 8.7, y: 3.5, w: 3.8, h: 0.3, fontSize: 12, bold: true, color: hex(theme.navy), fontFace: PPT_FONT, align: 'center' })
  const contactLines = [d.contact, d.instagram, d.website].filter(Boolean)
  contactLines.forEach((line, i) => {
    s.addText(line, { x: 8.7, y: 3.85 + i * 0.3, w: 3.8, h: 0.28, fontSize: 10, color: hex(theme.text), fontFace: PPT_FONT, align: 'center' })
  })
  if (d.qrCode?.dataUrl) s.addImage({ data: d.qrCode.dataUrl, x: 8.5 + 4.2 / 2 - 0.6, y: 5.0, w: 1.2, h: 1.2 })
  if (d.nextMeetingDate) {
    s.addShape('roundRect', { x: 8.9, y: 6.05, w: 3.4, h: 0.35, fill: { color: hex(theme.gold) }, rectRadius: 0.17 })
    s.addText(`下次會談：${d.nextMeetingDate}`, { x: 8.9, y: 6.05, w: 3.4, h: 0.35, fontSize: 9, color: hex(theme.navy), fontFace: PPT_FONT, align: 'center', valign: 'middle' })
  }
}
