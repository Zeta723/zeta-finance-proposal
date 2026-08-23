import type pptxgen from 'pptxgenjs'
import type { CustomSlideData, ImageBlock, ProposalSlide } from '../../types'
import type { ZetaTheme } from '../../styles/theme'
import { PPT_FONT, SLIDE_H, SLIDE_W, hex, richTextToPptxRuns } from '../pptxHelpers'

/** 依 imageBlock 的百分比座標換算成投影片實際英吋座標，並加入圖片 */
function addImageBlock(s: pptxgen.Slide, block: ImageBlock) {
  const x = (block.x / 100) * SLIDE_W
  const y = (block.y / 100) * SLIDE_H
  const w = (block.width / 100) * SLIDE_W
  const h = (block.height / 100) * SLIDE_H

  const sizingType = block.objectFit === 'contain' ? 'contain' : block.objectFit === 'cover' ? 'cover' : undefined

  s.addImage({
    data: block.src,
    x,
    y,
    w,
    h,
    ...(sizingType ? { sizing: { type: sizingType, w, h } } : {}),
    // PptxGenJS 的 rounding 是二元的圓角/橢圓效果，無法對應網頁預覽的任意像素圓角，
    // 這裡以「有設定圓角就套用 rounding」做最接近的近似呈現。
    rounding: block.borderRadius > 0,
    transparency: Math.round(100 - block.opacity)
  })
}

export function exportCustomSlide(pptx: pptxgen, slide: ProposalSlide<CustomSlideData>, theme: ZetaTheme) {
  const s = pptx.addSlide()
  const d = slide.data
  s.background = { color: hex(theme.bgPrimary) }

  s.addText(d.heading || d.title || '自訂主題頁', { x: 0.6, y: 0.4, w: 10, h: 0.6, fontSize: 24, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  s.addShape('line', { x: 0.62, y: 1.0, w: 1.6, h: 0, line: { color: hex(theme.gold), width: 2 } })

  if (d.subtitle) {
    s.addText(d.subtitle, { x: 0.6, y: 1.1, w: 10, h: 0.4, fontSize: 14, color: hex(theme.text), fontFace: PPT_FONT })
  }

  const layout = slide.layoutId
  const bodyFontSize = d.bodyStyle?.fontSize ? Math.round(d.bodyStyle.fontSize * 0.75) : undefined // px → pt 概略換算

  if (layout === 'imageText') {
    if (d.imageBlock) {
      addImageBlock(s, d.imageBlock)
    } else if (d.image?.dataUrl) {
      // 舊版資料相容：沒有 imageBlock 時維持原本固定位置的顯示方式
      s.addImage({ data: d.image.dataUrl, x: 7.4, y: 1.7, w: 5.3, h: 4.6, sizing: { type: 'cover', w: 5.3, h: 4.6 }, rounding: true })
    }
    if (d.body) {
      s.addText(richTextToPptxRuns(d.body, { fontSize: bodyFontSize ?? 13, color: hex(theme.text), align: d.bodyStyle?.textAlign }), {
        x: 0.6, y: 1.7, w: 6.5, h: 4.6, fontFace: PPT_FONT
      })
    }
  } else if (layout === 'threeCards' && d.highlights.length > 0) {
    const cardW = 3.9
    d.highlights.slice(0, 3).forEach((h, i) => {
      const x = 0.6 + i * (cardW + 0.2)
      s.addShape('roundRect', { x, y: 1.8, w: cardW, h: 3.6, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 1 }, rectRadius: 0.12 })
      s.addShape('roundRect', { x: x + 0.25, y: 2.05, w: 0.55, h: 0.55, fill: { color: hex(theme.gold) }, rectRadius: 0.28 })
      s.addText(String(i + 1), { x: x + 0.25, y: 2.05, w: 0.55, h: 0.55, fontSize: 16, bold: true, color: hex(theme.navy), fontFace: PPT_FONT, align: 'center', valign: 'middle' })
      s.addText(h.title, { x: x + 0.25, y: 2.75, w: cardW - 0.5, h: 0.4, fontSize: 13, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
      s.addText(richTextToPptxRuns(h.content, { fontSize: 11, color: hex(theme.text) }), { x: x + 0.25, y: 3.2, w: cardW - 0.5, h: 2.0, fontFace: PPT_FONT })
    })
  } else {
    // textHighlight（預設）
    if (d.body) {
      s.addText(richTextToPptxRuns(d.body, { fontSize: bodyFontSize ?? 14, color: hex(theme.text), align: d.bodyStyle?.textAlign }), {
        x: 0.6, y: 1.7, w: 8.4, h: 3.2, fontFace: PPT_FONT
      })
    }
    let hy = 1.7
    d.highlights.slice(0, 4).forEach((h) => {
      s.addShape('roundRect', { x: 9.3, y: hy, w: 3.4, h: 1.0, fill: { color: hex(theme.white) }, line: { color: hex(theme.gold), width: 0.75 }, rectRadius: 0.1 })
      s.addText(h.title, { x: 9.5, y: hy + 0.08, w: 3.0, h: 0.3, fontSize: 10, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
      s.addText(richTextToPptxRuns(h.content, { fontSize: 12, color: hex(theme.gold) }), { x: 9.5, y: hy + 0.38, w: 3.0, h: 0.5, fontFace: PPT_FONT, bold: true })
      hy += 1.15
    })
  }

  if (d.note) {
    s.addText(d.note, { x: 0.6, y: SLIDE_H - 0.7, w: SLIDE_W - 1.2, h: 0.35, fontSize: 9, color: hex(theme.text), fontFace: PPT_FONT })
  }
}
