import { jsPDF } from 'jspdf'
import { toPng } from 'html-to-image'
import ReactDOM from 'react-dom/client'
import React from 'react'
import type { Proposal, ProposalSlide } from '../types'
import { SlideRenderer } from '../components/preview/SlideRenderer'
import { ExportRenderContext } from './ExportRenderContext'
import { buildPdfFileName } from './pptxExport'
import { waitForFonts, waitForImages } from './chartRenderer'

/**
 * PDF 匯出的核心原則：「網站預覽＝正確版本，PDF＝複製網站預覽」。
 *
 * 網站上的投影片預覽（SlidePreviewPanel）在 100% 縮放時，實際渲染容器寬度是
 * 800px（見該檔案 `.zeta-slide-canvas` + `style={{ width: 800 * zoom }}`）。
 * 所有投影片模板的字體大小、卡片高度、留白、圖表比例，都是在「投影片內容
 * 實際被塞進一個 800px 寬容器」這個前提下寫的 Tailwind class（例如 text-2xl、
 * p-[4%]）。PDF 匯出必須複製這個同樣的前提，而不是另外發明一組尺寸（例如
 * 1280px 或 1600px）—— 那會讓同一批 CSS class 相對於容器的比例跑掉，導致
 * PDF 看起來字變小、卡片變矮，即使程式碼上是同一份模板元件。
 *
 * 因此這裡離螢幕容器固定使用 800×450（16:9，和網站預覽 100% 縮放時完全相同的
 * CSS px 尺寸），只用 html-to-image 的 pixelRatio 提高輸出解析度（不影響版面），
 * 讓 PDF 印出來夠清晰。
 */
const RENDER_W = 800
const RENDER_H = 450
// 只影響輸出圖片的解析度（越清晰），不影響版面比例或文字大小
const PIXEL_RATIO = 3

// jsPDF 頁面尺寸（mm），對應 13.333in x 7.5in 的 16:9 投影片。
// 來源圖片（800x450）與目標頁面皆為 16:9，比例一致，不會被拉伸或壓扁。
const PAGE_W_MM = 13.333 * 25.4
const PAGE_H_MM = 7.5 * 25.4

/**
 * 建立離螢幕渲染容器，尺寸與網站預覽 100% 縮放時完全相同（800x450）。
 *
 * 不可使用 `position: fixed` 搭配極端負值座標（例如 left: -99999px）——瀏覽器
 * 對距離視窗極遠的 fixed 定位元素可能會略過繪製（painting），導致擷取到空白畫面。
 * 改用「零尺寸、overflow:hidden 的外層包裹容器」：內層容器維持正常文件流內的
 * 定位與完整尺寸（因此會被正常繪製），外層把可視範圍裁切為 0，使用者看不到閃爍。
 */
function createOffscreenContainer(): { clipWrapper: HTMLDivElement; container: HTMLDivElement } {
  const clipWrapper = document.createElement('div')
  clipWrapper.style.position = 'absolute'
  clipWrapper.style.top = '0'
  clipWrapper.style.left = '0'
  clipWrapper.style.width = '0'
  clipWrapper.style.height = '0'
  clipWrapper.style.overflow = 'hidden'
  clipWrapper.style.zIndex = '-1'

  const container = document.createElement('div')
  container.style.width = `${RENDER_W}px`
  container.style.height = `${RENDER_H}px`
  container.style.overflow = 'hidden'
  container.style.backgroundColor = '#FFFFFF'

  clipWrapper.appendChild(container)
  document.body.appendChild(clipWrapper)
  return { clipWrapper, container }
}

async function renderSlideToPng(slide: ProposalSlide, defaultTheme: Proposal['themeSettings']['defaultTheme']): Promise<string> {
  const { clipWrapper, container } = createOffscreenContainer()
  const root = ReactDOM.createRoot(container)

  try {
    await new Promise<void>((resolve) => {
      root.render(
        // 直接渲染跟網站預覽同一顆 <SlideRenderer>，同樣的 slide.type / layoutId / data / theme，
        // 容器尺寸也和網站預覽 100% 縮放時完全相同（800x450）—— 不是另一套排版。
        // ExportRenderContext=true 只關閉 Recharts 動畫，確保擷取到的是渲染完成後的最終畫面。
        React.createElement(
          ExportRenderContext.Provider,
          { value: true },
          React.createElement('div', { style: { width: RENDER_W, height: RENDER_H } }, React.createElement(SlideRenderer, { slide, defaultTheme }))
        )
      )
      // 等待兩次 requestAnimationFrame，確保瀏覽器完成一次完整的版面配置與繪製
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })

    await waitForFonts()
    await waitForImages(container)
    // 額外緩衝時間，確保 SVG/Canvas 相關版面計算（如 Recharts 的 ResponsiveContainer）完成量測
    await new Promise((r) => setTimeout(r, 300))

    const dataUrl = await toPng(container, {
      width: RENDER_W,
      height: RENDER_H,
      pixelRatio: PIXEL_RATIO,
      cacheBust: true,
      backgroundColor: '#FFFFFF',
      // 不嘗試於匯出當下即時抓取外部 Google Fonts 樣式表：一來離線/受限網路環境會導致
      // 擷取掛起或整體失敗，二來畫面本身已透過 CSS font fallback（系統中文黑體）正常顯示，
      // 不強制內嵌外部字型並不影響實際渲染出的文字內容或版面比例。
      skipFonts: true
    })
    return dataUrl
  } finally {
    root.unmount()
    clipWrapper.remove()
  }
}

export interface PdfExportProgress {
  current: number
  total: number
}

/**
 * 匯出完整 PDF：每一張未隱藏的頁面各自離螢幕渲染成高解析度 PNG，再依序加入 jsPDF。
 * 離螢幕容器尺寸（800x450）與網站預覽 100% 縮放時完全相同，只用 pixelRatio 提升
 * 輸出解析度，不改變任何文字大小、卡片高度或版面比例。
 */
export async function exportProposalToPdf(proposal: Proposal, onProgress?: (p: PdfExportProgress) => void): Promise<void> {
  const visibleSlides = [...proposal.slides].filter((s) => !s.hidden).sort((a, b) => a.order - b.order)

  if (visibleSlides.length === 0) {
    throw new Error('NO_VISIBLE_SLIDES')
  }

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [PAGE_W_MM, PAGE_H_MM] })

  for (let i = 0; i < visibleSlides.length; i++) {
    const slide = visibleSlides[i]
    onProgress?.({ current: i + 1, total: visibleSlides.length })

    const png = await renderSlideToPng(slide, proposal.themeSettings.defaultTheme)
    if (i > 0) pdf.addPage([PAGE_W_MM, PAGE_H_MM], 'landscape')
    pdf.addImage(png, 'PNG', 0, 0, PAGE_W_MM, PAGE_H_MM, undefined, 'FAST')
  }

  pdf.save(buildPdfFileName(proposal))
}
