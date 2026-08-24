import PptxGenJS from 'pptxgenjs'
import type { Proposal, ProposalSlide } from '../types'
import { getTheme } from '../styles/theme'
import { exportCoverSlide } from './slideExporters/cover'
import { exportAssetAllocationSlide } from './slideExporters/assetAllocation'
import { exportBeforeAfterSlide } from './slideExporters/beforeAfter'
import { exportRecommendationSlide } from './slideExporters/recommendation'
import { exportConclusionSlide } from './slideExporters/conclusion'
import { exportCustomSlide } from './slideExporters/custom'
import { exportAccountAllocationSlide } from './slideExporters/accountAllocation'
import { addHeaderFooter, type PptChartMode } from './pptxHelpers'

export interface MissingDataIssue {
  slideId: string
  slideLabel: string
  message: string
}

/** 匯出前的資料檢查：找出缺少的必要資料，讓使用者選擇是否仍要繼續匯出 */
export function checkMissingData(proposal: Proposal): MissingDataIssue[] {
  const issues: MissingDataIssue[] = []
  const visibleSlides = proposal.slides.filter((s) => !s.hidden)

  if (visibleSlides.length === 0) {
    issues.push({ slideId: 'none', slideLabel: '整份提案', message: '目前沒有任何顯示中的頁面可以匯出。' })
  }

  visibleSlides.forEach((slide) => {
    if (slide.type === 'cover') {
      const d = slide.data as any
      if (!d.clientName) issues.push({ slideId: slide.id, slideLabel: '封面', message: '尚未填寫客戶姓名。' })
      if (!d.title) issues.push({ slideId: slide.id, slideLabel: '封面', message: '尚未填寫提案標題。' })
    }
    if (slide.type === 'assetAllocation') {
      const d = slide.data as any
      if (!d.items?.some((i: any) => i.visible && i.amount > 0)) {
        issues.push({ slideId: slide.id, slideLabel: d.heading || '資產配置圖', message: '尚未輸入任何資產金額。' })
      }
    }
    if (slide.type === 'recommendation') {
      const d = slide.data as any
      if (!d.planName) issues.push({ slideId: slide.id, slideLabel: d.heading || '建議書', message: '尚未填寫方案名稱。' })
    }
    if (slide.type === 'accountAllocation') {
      const d = slide.data as any
      if (!d.totalIncome || d.totalIncome <= 0) issues.push({ slideId: slide.id, slideLabel: d.heading || '收入與帳戶分配圖', message: '尚未填寫總收入金額。' })
    }
  })

  return issues
}

function sanitizeFileNamePart(part: string): string {
  return part.replace(/[\\/:*?"<>|]/g, '').trim() || '未命名'
}

function buildExportBaseName(proposal: Proposal): string {
  const client = sanitizeFileNamePart(proposal.client.clientName || '客戶')
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${client}_財務規劃提案_${y}${m}${d}`
}

export function buildExportFileName(proposal: Proposal): string {
  return `${buildExportBaseName(proposal)}.pptx`
}

export function buildPdfFileName(proposal: Proposal): string {
  return `${buildExportBaseName(proposal)}.pdf`
}

function renderSlidesInto(pptx: PptxGenJS, proposal: Proposal, mode: PptChartMode) {
  const visibleSlides = [...proposal.slides].filter((s) => !s.hidden).sort((a, b) => a.order - b.order)

  visibleSlides.forEach((slide: ProposalSlide, index: number) => {
    const theme = getTheme((slide.slideTheme as any) || proposal.themeSettings.defaultTheme)
    switch (slide.type) {
      case 'cover':
        exportCoverSlide(pptx, slide as any, theme)
        break
      case 'assetAllocation':
        exportAssetAllocationSlide(pptx, slide as any, theme, mode)
        break
      case 'beforeAfter':
        exportBeforeAfterSlide(pptx, slide as any, theme, mode, proposal.currencySettings)
        break
      case 'recommendation':
        exportRecommendationSlide(pptx, slide as any, theme)
        break
      case 'conclusion':
        exportConclusionSlide(pptx, slide as any, theme)
        break
      case 'custom':
        exportCustomSlide(pptx, slide as any, theme)
        break
      case 'accountAllocation':
        exportAccountAllocationSlide(pptx, slide as any, theme, mode)
        break
    }
    // 頁首/頁尾：對非封面頁加上頁碼與品牌名稱
    if (slide.type !== 'cover') {
      const lastSlide = (pptx as any).slides?.[(pptx as any).slides.length - 1]
      if (lastSlide) addHeaderFooter(lastSlide, theme, { brandName: proposal.client.brandName || 'Zeta', pageNumber: index + 1 })
    }
  })
}

function createPresentation(proposal: Proposal): PptxGenJS {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'ZETA_16_9', width: 13.333, height: 7.5 })
  pptx.layout = 'ZETA_16_9'
  pptx.author = proposal.client.advisorName || 'Zeta'
  pptx.title = proposal.client.proposalName || 'Zeta 財務規劃提案'
  return pptx
}

/**
 * 匯出「可編輯 PowerPoint」：優先保留可編輯性 —— 資產配置圖／Before&After 雙圓餅圖等
 * 適合原生圖表的地方，使用 PowerPoint 原生 Chart（在 PowerPoint 中可直接編輯數據）。
 * 折線比較圖、資金流向圖、樹狀帳戶圖因結構複雜，兩種模式皆使用高解析度 PNG。
 */
export async function exportProposalToPptx(proposal: Proposal): Promise<void> {
  const pptx = createPresentation(proposal)
  renderSlidesInto(pptx, proposal, 'editable')
  await pptx.writeFile({ fileName: buildExportFileName(proposal) })
}

/**
 * 匯出「Keynote 相容 PowerPoint」：文字、標題、頁碼、簡單形狀（矩形/線條/圓形）仍是可編輯的
 * PowerPoint 物件；圓餅圖、環形圖、長條圖、折線圖與資金流向圖／樹狀圖一律轉成高解析度 PNG
 * 內嵌圖片，避免 Keynote 匯入原生 Chart Part 時圖表消失的已知相容性問題。
 */
export async function exportProposalToKeynotePptx(proposal: Proposal): Promise<void> {
  const pptx = createPresentation(proposal)
  renderSlidesInto(pptx, proposal, 'keynote')
  const base = buildExportBaseName(proposal)
  await pptx.writeFile({ fileName: `${base}_Keynote相容.pptx` })
}
