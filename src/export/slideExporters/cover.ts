import type pptxgen from 'pptxgenjs'
import type { CoverData, ProposalSlide } from '../../types'
import type { ZetaTheme } from '../../styles/theme'
import { PPT_FONT, SLIDE_W, SLIDE_H, hex, richTextToPptxRuns, safeText } from '../pptxHelpers'

export function exportCoverSlide(pptx: pptxgen, slide: ProposalSlide<CoverData>, theme: ZetaTheme) {
  const s = pptx.addSlide()
  const d = slide.data
  const layout = slide.layoutId

  const bg = layout === 'warm' ? theme.cream : layout === 'minimal' ? theme.ivory : theme.navy
  const headingColor = layout === 'classic' ? theme.white : theme.navy

  s.background = { color: hex(bg) }

  if (d.backgroundImage?.dataUrl) {
    s.addImage({ data: d.backgroundImage.dataUrl, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, transparency: layout === 'classic' ? 55 : 75 })
  }

  // 品牌金線裝飾
  s.addShape('rect', { x: 0, y: 0, w: 0.14, h: SLIDE_H, fill: { color: hex(theme.gold) } })

  s.addText(safeText(d.proposalTopic, '財務規劃提案'), {
    x: 1, y: 1.3, w: 9.5, h: 0.5, fontSize: 14, color: hex(theme.gold), fontFace: PPT_FONT, charSpacing: 2, bold: true
  })

  s.addText(safeText(d.title, '財務規劃提案'), {
    x: 1, y: 1.9, w: 10.5, h: 1.3, fontSize: 40, bold: true, color: hex(headingColor), fontFace: PPT_FONT
  })

  s.addText(safeText(d.subtitle), {
    x: 1, y: 3.15, w: 10, h: 0.6, fontSize: 16, color: hex(headingColor), fontFace: PPT_FONT
  })

  if (d.quote) {
    s.addText(richTextToPptxRuns(d.quote, { fontSize: 13, color: hex(headingColor) }), {
      x: 1, y: 3.95, w: 9, h: 0.8, fontFace: PPT_FONT, italic: true
    })
  }

  // 客戶與顧問資訊卡
  s.addShape('roundRect', {
    x: 1, y: 5.05, w: 6.2, h: 1.5, fill: { color: hex(theme.white) }, line: { color: hex(theme.gold), width: 0.75 },
    rectRadius: 0.12
  })
  s.addText(
    [
      { text: `客戶：${safeText(d.clientName, '—')} ${safeText(d.clientTitle)}\n`, options: { fontSize: 13, bold: true, color: hex(theme.navy), breakLine: true } },
      { text: `提案日期：${safeText(d.proposalDate)}\n`, options: { fontSize: 11, color: hex(theme.text), breakLine: true } },
      { text: `財務顧問：${safeText(d.advisorName, 'Zeta')}｜${safeText(d.brandName)}`, options: { fontSize: 11, color: hex(theme.text) } }
    ],
    { x: 1.3, y: 5.25, w: 5.6, h: 1.1, fontFace: PPT_FONT, valign: 'top' }
  )

  if (d.logo?.dataUrl) {
    s.addImage({ data: d.logo.dataUrl, x: SLIDE_W - 2.2, y: 0.6, w: 1.2, h: 1.2, sizing: { type: 'contain', w: 1.2, h: 1.2 } })
  }
  if (d.coverPhoto?.dataUrl) {
    s.addImage({ data: d.coverPhoto.dataUrl, x: SLIDE_W - 4.4, y: 4.6, w: 3.6, h: 2.5, sizing: { type: 'cover', w: 3.6, h: 2.5 }, rounding: true })
  }
}
