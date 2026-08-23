import type pptxgen from 'pptxgenjs'
import type { ProposalSlide, RecommendationData } from '../../types'
import type { ZetaTheme } from '../../styles/theme'
import { PPT_FONT, SLIDE_H, SLIDE_W, formatAmount, hex, richTextToPptxRuns } from '../pptxHelpers'
import { isRecFieldVisible } from '../../data/recommendationFieldVisibility'

export function exportRecommendationSlide(pptx: pptxgen, slide: ProposalSlide<RecommendationData>, theme: ZetaTheme) {
  const s = pptx.addSlide()
  const d = slide.data
  s.background = { color: hex(theme.bgPrimary) }

  switch (slide.layoutId) {
    case 'advisorCard':
      exportAdvisorCard(s, d, theme)
      break
    case 'dataHighlight':
    default:
      exportDataHighlight(s, d, theme)
  }
}

function exportDataHighlight(s: pptxgen.Slide, d: RecommendationData, theme: ZetaTheme) {
  const show = (key: keyof RecommendationData) => isRecFieldVisible(d, key)
  const hasEstimatedResult = show('estimatedResult') && d.estimatedResult
  const hasWithdraw = show('withdrawTiming') && (d.withdrawTiming || d.withdrawMethod)
  const hasAdvantages = show('advantages') && d.advantages.length > 0
  const hasCautions = show('cautions') && d.cautions.length > 0
  const hasRiskNotes = show('riskNotes') && d.riskNotes.length > 0
  const hasImage = show('image') && d.image?.dataUrl
  const hasAdvisorNote = show('advisorNote') && d.advisorNote

  s.addText(d.heading || d.planName || '建議方案', { x: 0.6, y: 0.4, w: hasImage ? 8 : 9, h: 0.6, fontSize: 24, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  if (hasImage) s.addImage({ data: d.image!.dataUrl, x: 8.7, y: 0.4, w: 0.7, h: 0.7, rounding: true })
  s.addShape('roundRect', { x: 9.9, y: 0.45, w: 2.8, h: 0.5, fill: { color: hex(theme.gold) }, rectRadius: 0.25 })
  s.addText(d.planType, { x: 9.9, y: 0.45, w: 2.8, h: 0.5, fontSize: 11, bold: true, color: hex(theme.navy), fontFace: PPT_FONT, align: 'center', valign: 'middle' })
  s.addShape('line', { x: 0.62, y: 1.0, w: 1.6, h: 0, line: { color: hex(theme.gold), width: 2 } })

  s.addShape('roundRect', { x: 0.6, y: 1.25, w: 4.1, h: 4.9, fill: { color: hex(theme.navy) }, rectRadius: 0.12 })
  s.addText('核心目標', { x: 0.9, y: 1.5, w: 3.5, h: 0.35, fontSize: 11, color: hex(theme.gold), fontFace: PPT_FONT })
  s.addText(d.coreGoal, { x: 0.9, y: 1.85, w: 3.5, h: 0.7, fontSize: 13, color: hex(theme.white), fontFace: PPT_FONT })

  const stats: [string, string][] = [
    ['建議每月投入', formatAmount(d.monthlyAmount, d.currency, d.customCurrencyLabel)],
    ['一次性投入', formatAmount(d.lumpSumAmount, d.currency, d.customCurrencyLabel)],
    ['規劃期間', `${d.durationYears} 年`],
    ['預估年化報酬率', `${d.estimatedAnnualReturn}%`]
  ]
  stats.forEach(([label, value], i) => {
    const y = 2.7 + i * 0.62
    s.addText(label, { x: 0.9, y, w: 3.5, h: 0.25, fontSize: 10, color: hex(theme.cream), fontFace: PPT_FONT })
    s.addText(value, { x: 0.9, y: y + 0.24, w: 3.5, h: 0.35, fontSize: 16, bold: true, color: hex(theme.gold), fontFace: PPT_FONT })
  })
  if (hasWithdraw) {
    const parts = [d.withdrawTiming ? `提取時間：${d.withdrawTiming}` : '', d.withdrawMethod ? `提取方式：${d.withdrawMethod}` : ''].filter(Boolean)
    s.addText(parts.join('\n'), { x: 0.9, y: 5.65, w: 3.5, h: 0.4, fontSize: 8.5, color: hex(theme.cream), fontFace: PPT_FONT })
  }

  const blocks: [string, RecommendationData['clientProblem']][] = [
    ['客戶目前的問題', d.clientProblem],
    ['顧問建議', d.advisorSuggestion],
    ['適合客戶的原因', d.whySuitable]
  ]
  let ry = 1.25
  blocks.forEach(([label, content]) => {
    s.addText(label, { x: 5.0, y: ry, w: 7.6, h: 0.3, fontSize: 11, bold: true, color: hex(theme.gold), fontFace: PPT_FONT })
    s.addText(richTextToPptxRuns(content, { fontSize: 12, color: hex(theme.text) }), { x: 5.0, y: ry + 0.32, w: 7.6, h: 0.6, fontFace: PPT_FONT })
    ry += 1.0
  })

  if (hasEstimatedResult) {
    s.addText('預估成果', { x: 5.0, y: ry, w: 7.6, h: 0.28, fontSize: 11, bold: true, color: hex(theme.positive), fontFace: PPT_FONT })
    s.addText(richTextToPptxRuns(d.estimatedResult, { fontSize: 10.5, color: hex(theme.text) }), { x: 5.0, y: ry + 0.3, w: 7.6, h: 0.5, fontFace: PPT_FONT })
    ry += 0.85
  }

  s.addText('執行步驟', { x: 5.0, y: ry + 0.1, w: 3.6, h: 0.3, fontSize: 11, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  d.steps.slice(0, 4).forEach((step, i) => {
    s.addText(`${i + 1}. ${step}`, { x: 5.0, y: ry + 0.45 + i * 0.32, w: 3.6, h: 0.3, fontSize: 10, color: hex(theme.text), fontFace: PPT_FONT })
  })

  if (hasCautions || hasRiskNotes) {
    s.addText('注意事項與風險提醒', { x: 8.8, y: ry + 0.1, w: 3.8, h: 0.3, fontSize: 11, bold: true, color: hex(theme.danger), fontFace: PPT_FONT })
    const notes = [...(hasCautions ? d.cautions : []), ...(hasRiskNotes ? d.riskNotes : [])].slice(0, 4)
    notes.forEach((n, i) => {
      s.addText(`• ${n}`, { x: 8.8, y: ry + 0.45 + i * 0.32, w: 3.8, h: 0.3, fontSize: 9.5, color: hex(theme.text), fontFace: PPT_FONT })
    })
  }

  if (hasAdvantages) {
    s.addText(`方案優勢：${d.advantages.slice(0, 5).join('、')}`, { x: 5.0, y: SLIDE_H - 1.05, w: 7.6, h: 0.3, fontSize: 9, color: hex(theme.navy), fontFace: PPT_FONT, bold: true })
  }
  if (hasAdvisorNote) {
    s.addText(richTextToPptxRuns(d.advisorNote, { fontSize: 9, color: hex(theme.text) }), { x: 0.6, y: SLIDE_H - 0.7, w: SLIDE_W - 1.2, h: 0.4, fontFace: PPT_FONT, italic: true })
  }
}

function exportAdvisorCard(s: pptxgen.Slide, d: RecommendationData, theme: ZetaTheme) {
  const show = (key: keyof RecommendationData) => isRecFieldVisible(d, key)
  const hasEstimatedResult = show('estimatedResult') && d.estimatedResult
  const hasWithdraw = show('withdrawTiming') && (d.withdrawTiming || d.withdrawMethod)
  const hasAdvantages = show('advantages') && d.advantages.length > 0
  const hasCautions = show('cautions') && d.cautions.length > 0
  const hasRiskNotes = show('riskNotes') && d.riskNotes.length > 0
  const hasImage = show('image') && d.image?.dataUrl
  const hasAdvisorNote = show('advisorNote') && d.advisorNote
  const hasFooter = hasEstimatedResult || hasWithdraw || hasAdvantages || hasCautions || hasRiskNotes || hasAdvisorNote

  // 上方橫幅
  s.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: 1.7, fill: { color: hex(theme.navy) } })
  const bannerTextX = hasImage ? 1.5 : 0.6
  if (hasImage) s.addImage({ data: d.image!.dataUrl, x: 0.6, y: 0.4, w: 0.85, h: 0.85, rounding: true })
  s.addText(d.planType, { x: bannerTextX, y: 0.25, w: 6, h: 0.3, fontSize: 10, color: hex(theme.gold), fontFace: PPT_FONT })
  s.addText(d.heading || d.planName || '建議方案', { x: bannerTextX, y: 0.5, w: 7, h: 0.55, fontSize: 22, bold: true, color: hex(theme.white), fontFace: PPT_FONT })
  s.addText(d.coreGoal, { x: bannerTextX, y: 1.1, w: 7, h: 0.4, fontSize: 11, color: hex(theme.white), fontFace: PPT_FONT })

  const stats: [string, string][] = [
    ['每月投入', formatAmount(d.monthlyAmount, d.currency, d.customCurrencyLabel)],
    ['規劃期間', `${d.durationYears}年`],
    ['預估報酬率', `${d.estimatedAnnualReturn}%`]
  ]
  stats.forEach(([label, value], i) => {
    const x = 8.3 + i * 1.6
    s.addText(label, { x, y: 0.4, w: 1.5, h: 0.3, fontSize: 8, color: hex(theme.white), fontFace: PPT_FONT, align: 'right' })
    s.addText(value, { x, y: 0.68, w: 1.5, h: 0.45, fontSize: 14, bold: true, color: hex(theme.gold), fontFace: PPT_FONT, align: 'right' })
  })

  // 三張卡片並列
  const cardsH = hasFooter ? 2.35 : 2.7
  const blocks: [string, RecommendationData['clientProblem'], string][] = [
    ['客戶目前的問題', d.clientProblem, theme.danger],
    ['顧問建議', d.advisorSuggestion, theme.gold],
    ['適合客戶的原因', d.whySuitable, theme.positive]
  ]
  const cardW = (SLIDE_W - 1.2 - 0.4) / 3
  blocks.forEach(([label, content, accent], i) => {
    const x = 0.6 + i * (cardW + 0.2)
    s.addShape('roundRect', { x, y: 1.95, w: cardW, h: cardsH, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 1 }, rectRadius: 0.1 })
    s.addText(label, { x: x + 0.2, y: 2.1, w: cardW - 0.4, h: 0.3, fontSize: 11, bold: true, color: hex(accent), fontFace: PPT_FONT })
    s.addText(richTextToPptxRuns(content, { fontSize: 10, color: hex(theme.text) }), { x: x + 0.2, y: 2.42, w: cardW - 0.4, h: cardsH - 0.5, fontFace: PPT_FONT })
  })

  // 底部橫向步驟時間軸
  const stepsY = 1.95 + cardsH + 0.2
  const stepsH = hasFooter ? 1.55 : 1.9
  s.addShape('roundRect', { x: 0.6, y: stepsY, w: SLIDE_W - 1.2, h: stepsH, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 1 }, rectRadius: 0.1 })
  s.addText('執行步驟', { x: 0.85, y: stepsY + 0.15, w: 3, h: 0.3, fontSize: 11, bold: true, color: hex(theme.navy), fontFace: PPT_FONT })
  const steps = d.steps.slice(0, 5)
  const stepW = (SLIDE_W - 1.8) / Math.max(1, steps.length)
  steps.forEach((step, i) => {
    const x = 0.9 + i * stepW
    const circleY = stepsY + 0.55
    s.addShape('ellipse', { x, y: circleY, w: 0.35, h: 0.35, fill: { color: hex(theme.gold) } })
    s.addText(String(i + 1), { x, y: circleY, w: 0.35, h: 0.35, fontSize: 12, bold: true, color: hex(theme.navy), fontFace: PPT_FONT, align: 'center', valign: 'middle' })
    s.addText(step, { x: x - 0.4, y: circleY + 0.45, w: stepW - 0.1, h: 0.5, fontSize: 9, color: hex(theme.text), fontFace: PPT_FONT, align: 'center' })
    if (i < steps.length - 1) {
      s.addShape('line', { x: x + 0.35, y: circleY + 0.175, w: stepW - 0.35, h: 0, line: { color: hex(theme.cream), width: 1.5 } })
    }
  })

  // 補充資訊列
  if (hasFooter) {
    const footerY = stepsY + stepsH + 0.15
    const lines: string[] = []
    if (hasEstimatedResult) lines.push('預估成果：（詳見內文）')
    if (hasWithdraw) lines.push(`提取：${[d.withdrawTiming, d.withdrawMethod].filter(Boolean).join('／')}`)
    if (hasAdvantages) lines.push(`方案優勢：${d.advantages.slice(0, 5).join('、')}`)
    if (hasCautions || hasRiskNotes) lines.push([...(hasCautions ? d.cautions : []), ...(hasRiskNotes ? d.riskNotes : [])].slice(0, 3).join('｜'))

    s.addShape('roundRect', { x: 0.6, y: footerY, w: SLIDE_W - 1.2, h: SLIDE_H - footerY - 0.3, fill: { color: hex(theme.white) }, line: { color: hex(theme.cream), width: 1 }, rectRadius: 0.08 })
    if (hasEstimatedResult) {
      s.addText(richTextToPptxRuns(d.estimatedResult, { fontSize: 8.5, color: hex(theme.positive) }), { x: 0.8, y: footerY + 0.1, w: SLIDE_W - 1.6, h: 0.3, fontFace: PPT_FONT })
    }
    const restLines = lines.filter((_, i) => !(i === 0 && hasEstimatedResult))
    if (restLines.length > 0) {
      s.addText(restLines.join('　｜　'), { x: 0.8, y: footerY + (hasEstimatedResult ? 0.35 : 0.1), w: SLIDE_W - 1.6, h: 0.3, fontSize: 8.5, color: hex(theme.text), fontFace: PPT_FONT })
    }
    if (hasAdvisorNote) {
      s.addText(richTextToPptxRuns(d.advisorNote, { fontSize: 8, color: hex(theme.text) }), { x: 0.8, y: footerY + 0.6, w: SLIDE_W - 1.6, h: 0.3, fontFace: PPT_FONT, italic: true })
    }
  }
}
