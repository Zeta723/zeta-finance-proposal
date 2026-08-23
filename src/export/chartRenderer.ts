import { CHART_PALETTE } from '../styles/theme'

/**
 * 圖表轉 PNG 工具（Keynote 相容匯出、PDF 匯出共用）。
 *
 * 為什麼需要這個檔案：PowerPoint 原生 Chart Part（PptxGenJS 的 s.addChart）
 * 在 Apple Keynote 匯入時支援不完整，常見狀況是圖表物件被靜默捨棄。
 * 因此「Keynote相容PowerPoint」匯出模式一律不使用 s.addChart，改用這裡的
 * canvas 繪圖函式，畫出固定尺寸、高解析度（預設 3x）的 PNG，再以 addImage 方式
 * 嵌入投影片 —— 圖片在任何 PPTX 檢視器（含 Keynote）都能正常顯示。
 *
 * 所有函式都使用「固定尺寸的匯出專用畫布」，不擷取畫面上任何縮小後的 DOM 元素，
 * 也不包含編輯器按鈕、外框或控制元件。
 */

const SCALE = 3 // 高解析度倍率

export interface PieSlice {
  name: string
  value: number
  color: string
}

function makeCanvas(cssW: number, cssH: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = cssW * SCALE
  canvas.height = cssH * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)
  ctx.textBaseline = 'middle'
  return { canvas, ctx }
}

function toPng(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

/** 圓餅圖／環形圖 PNG（背景可指定，預設透明以便融入投影片背景色） */
export function renderPieChartPng(
  slices: PieSlice[],
  opts: { width?: number; height?: number; donut?: boolean; background?: string; showLegend?: boolean; legendColor?: string; fontFamily?: string } = {}
): string {
  const width = opts.width ?? 640
  const height = opts.height ?? 480
  const { canvas, ctx } = makeCanvas(width, height)
  const font = opts.fontFamily ?? '"Microsoft JhengHei", "Noto Sans TC", sans-serif'

  if (opts.background) {
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, width, height)
  }

  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0)
  const cx = opts.showLegend ? width * 0.35 : width / 2
  const cy = height / 2
  const radius = Math.min(cx, cy) - 20

  if (total <= 0) {
    ctx.fillStyle = '#999999'
    ctx.font = `14px ${font}`
    ctx.textAlign = 'center'
    ctx.fillText('尚未輸入資產金額', width / 2, height / 2)
    return toPng(canvas)
  }

  let angle = -Math.PI / 2
  slices.forEach((slice) => {
    const sweep = (Math.max(0, slice.value) / total) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, angle, angle + sweep)
    ctx.closePath()
    ctx.fillStyle = slice.color || CHART_PALETTE[0]
    ctx.fill()
    angle += sweep
  })

  if (opts.donut) {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }

  if (opts.showLegend) {
    let ly = cy - (slices.length * 22) / 2
    ctx.textAlign = 'left'
    slices.forEach((s) => {
      ctx.fillStyle = s.color
      ctx.fillRect(cx + radius + 30, ly - 6, 12, 12)
      ctx.fillStyle = opts.legendColor ?? '#333333'
      ctx.font = `13px ${font}`
      const pct = total > 0 ? ((Math.max(0, s.value) / total) * 100).toFixed(1) : '0.0'
      ctx.fillText(`${s.name}（${pct}%）`, cx + radius + 48, ly)
      ly += 22
    })
  }

  return toPng(canvas)
}

/** 長條圖 PNG（水平長條） */
export function renderBarChartPng(
  items: { name: string; value: number; color: string }[],
  opts: { width?: number; height?: number; background?: string; textColor?: string; fontFamily?: string } = {}
): string {
  const width = opts.width ?? 640
  const height = opts.height ?? 400
  const { canvas, ctx } = makeCanvas(width, height)
  const font = opts.fontFamily ?? '"Microsoft JhengHei", "Noto Sans TC", sans-serif'

  if (opts.background) {
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, width, height)
  }

  const max = Math.max(1, ...items.map((i) => Math.max(0, i.value)))
  const labelW = 90
  const chartW = width - labelW - 20
  const rowH = items.length > 0 ? Math.min(40, (height - 20) / items.length) : 0

  items.forEach((item, i) => {
    const y = 10 + i * rowH
    ctx.fillStyle = opts.textColor ?? '#333333'
    ctx.font = `12px ${font}`
    ctx.textAlign = 'right'
    ctx.fillText(item.name, labelW - 8, y + rowH / 2 - 6)

    const barW = (Math.max(0, item.value) / max) * chartW
    ctx.fillStyle = item.color
    ctx.fillRect(labelW, y, barW, rowH - 10)

    ctx.textAlign = 'left'
    ctx.fillText(item.value.toLocaleString('zh-Hant-TW'), labelW + barW + 6, y + rowH / 2 - 6)
  })

  return toPng(canvas)
}

export interface LineSeries {
  name: string
  color: string
  values: number[]
  strokeWidth?: number
  dashed?: boolean
}

/** XY 折線圖 PNG：X軸為時間標籤，Y軸為金額，可加水平目標參考線 */
export function renderLineChartPng(
  labels: string[],
  series: LineSeries[],
  opts: {
    width?: number
    height?: number
    background?: string
    gridColor?: string
    textColor?: string
    referenceLine?: { value: number; color: string; label: string }
    fontFamily?: string
    yFormatter?: (v: number) => string
  } = {}
): string {
  const width = opts.width ?? 800
  const height = opts.height ?? 480
  const { canvas, ctx } = makeCanvas(width, height)
  const font = opts.fontFamily ?? '"Microsoft JhengHei", "Noto Sans TC", sans-serif'
  const fmt = opts.yFormatter ?? ((v: number) => v.toLocaleString('zh-Hant-TW'))

  if (opts.background) {
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, width, height)
  }

  const marginL = 90
  const marginR = 20
  const marginT = 30
  const marginB = 50
  const plotW = width - marginL - marginR
  const plotH = height - marginT - marginB

  const allValues = series.flatMap((s) => s.values).concat(opts.referenceLine ? [opts.referenceLine.value] : [])
  const maxV = Math.max(1, ...allValues)
  const minV = Math.min(0, ...allValues)
  const range = maxV - minV || 1

  const xFor = (i: number) => marginL + (labels.length <= 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW)
  const yFor = (v: number) => marginT + plotH - ((v - minV) / range) * plotH

  // 格線與 Y 軸刻度
  ctx.strokeStyle = opts.gridColor ?? '#E8DCCB'
  ctx.fillStyle = opts.textColor ?? '#333333'
  ctx.font = `11px ${font}`
  ctx.textAlign = 'right'
  const ticks = 4
  for (let t = 0; t <= ticks; t++) {
    const v = minV + (range * t) / ticks
    const y = yFor(v)
    ctx.beginPath()
    ctx.moveTo(marginL, y)
    ctx.lineTo(width - marginR, y)
    ctx.stroke()
    ctx.fillText(fmt(v), marginL - 8, y)
  }

  // X 軸標籤
  ctx.textAlign = 'center'
  labels.forEach((label, i) => {
    if (labels.length > 12 && i % Math.ceil(labels.length / 12) !== 0) return
    ctx.fillText(label, xFor(i), height - marginB + 16)
  })

  // 目標參考線
  if (opts.referenceLine) {
    const y = yFor(opts.referenceLine.value)
    ctx.save()
    ctx.strokeStyle = opts.referenceLine.color
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(marginL, y)
    ctx.lineTo(width - marginR, y)
    ctx.stroke()
    ctx.restore()
    ctx.fillStyle = opts.referenceLine.color
    ctx.textAlign = 'left'
    ctx.font = `11px ${font}`
    ctx.fillText(opts.referenceLine.label, width - marginR - 60, y - 8)
  }

  // 折線
  series.forEach((s) => {
    ctx.beginPath()
    ctx.strokeStyle = s.color
    ctx.lineWidth = s.strokeWidth ?? 2.5
    if (s.dashed) ctx.setLineDash([6, 4])
    else ctx.setLineDash([])
    s.values.forEach((v, i) => {
      const x = xFor(i)
      const y = yFor(v)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = s.color
    s.values.forEach((v, i) => {
      ctx.beginPath()
      ctx.arc(xFor(i), yFor(v), 3, 0, Math.PI * 2)
      ctx.fill()
    })
  })

  // 圖例
  let lx = marginL
  const ly = 14
  ctx.font = `12px ${font}`
  series.forEach((s) => {
    ctx.fillStyle = s.color
    ctx.fillRect(lx, ly - 6, 12, 12)
    ctx.fillStyle = opts.textColor ?? '#333333'
    ctx.textAlign = 'left'
    ctx.fillText(s.name, lx + 16, ly)
    lx += ctx.measureText(s.name).width + 40
  })

  return toPng(canvas)
}

export interface FlowBoxLike {
  x: number
  y: number
  w: number
  h: number
  label: string
  amount: number
  color: string
  pct: number
}
export interface FlowEdgeLike {
  x1: number
  y1: number
  x2: number
  y2: number
  strokeWidth: number
  color: string
}

/** 資金流向圖／樹狀圖 PNG：直接用既有 layout 座標資料繪製，與網頁 SVG 預覽完全一致 */
export function renderFlowDiagramPng(
  boxes: FlowBoxLike[],
  edges: FlowEdgeLike[],
  opts: { width: number; height: number; background?: string; textColor?: string; amountFormatter: (v: number) => string; fontFamily?: string; boxFill?: (b: FlowBoxLike) => string }
): string {
  const scaleFactor = 1.6 // 放大基礎座標系以提升輸出解析度
  const width = opts.width * scaleFactor
  const height = opts.height * scaleFactor
  const { canvas, ctx } = makeCanvas(width, height)
  const font = opts.fontFamily ?? '"Microsoft JhengHei", "Noto Sans TC", sans-serif'

  if (opts.background) {
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, width, height)
  }

  ctx.lineCap = 'round'
  edges.forEach((e) => {
    ctx.beginPath()
    ctx.strokeStyle = e.color
    ctx.globalAlpha = 0.55
    ctx.lineWidth = e.strokeWidth * scaleFactor
    ctx.moveTo(e.x1 * scaleFactor, e.y1 * scaleFactor)
    const midX = ((e.x1 + e.x2) / 2) * scaleFactor
    ctx.bezierCurveTo(midX, e.y1 * scaleFactor, midX, e.y2 * scaleFactor, e.x2 * scaleFactor, e.y2 * scaleFactor)
    ctx.stroke()
    ctx.globalAlpha = 1
  })

  boxes.forEach((b) => {
    const x = b.x * scaleFactor
    const y = b.y * scaleFactor
    const w = b.w * scaleFactor
    const h = b.h * scaleFactor
    ctx.fillStyle = opts.boxFill ? opts.boxFill(b) : b.color
    roundRect(ctx, x, y, w, h, 8 * scaleFactor)
    ctx.fill()

    ctx.fillStyle = opts.textColor ?? '#FFFFFF'
    ctx.font = `bold ${13 * scaleFactor}px ${font}`
    ctx.textAlign = 'center'
    ctx.fillText(b.label, x + w / 2, y + h / 2 - 8 * scaleFactor)
    ctx.font = `${11 * scaleFactor}px ${font}`
    ctx.fillText(`${opts.amountFormatter(b.amount)}（${b.pct.toFixed(1)}%）`, x + w / 2, y + h / 2 + 10 * scaleFactor)
  })

  return toPng(canvas)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** 等待所有 <img> 載入完成（Keynote/PDF 匯出前呼叫，避免圖片尚未載入就開始匯出） */
export async function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll('img'))
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
    )
  )
}

/** 等待中文字型（Noto Sans TC）載入完成 */
export async function waitForFonts(): Promise<void> {
  const anyDoc = document as any
  if (anyDoc.fonts?.ready) {
    try {
      await anyDoc.fonts.ready
    } catch {
      // 部分瀏覽器可能不支援，忽略即可
    }
  }
  // 額外等一個 tick，確保 canvas/SVG 對字型量測已更新
  await new Promise((r) => setTimeout(r, 50))
}
