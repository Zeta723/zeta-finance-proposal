import type { AccountAllocationData, AllocationCategory } from '../types'

export interface FlowBox {
  x: number
  y: number
  w: number
  h: number
  label: string
  amount: number
  color: string
  pct: number
}

export interface FlowEdge {
  x1: number
  y1: number
  x2: number
  y2: number
  strokeWidth: number
  color: string
}

export interface MoneyFlowLayout {
  width: number
  height: number
  income: FlowBox
  categories: FlowBox[]
  subItems: (FlowBox & { categoryId: string })[]
  edgesIncomeToCategory: FlowEdge[]
}

function visibleCategories(data: AccountAllocationData): AllocationCategory[] {
  return data.categories.filter((c) => c.visible)
}

/**
 * 計算「資金流向圖」版面座標。純函式、不依賴 DOM 量測，
 * 讓網頁 SVG 預覽與 Canvas PNG 匯出可以共用完全一致的座標資料。
 */
export function buildMoneyFlowLayout(data: AccountAllocationData, width = 1000, height = 560): MoneyFlowLayout {
  const cats = visibleCategories(data)
  const total = data.totalIncome > 0 ? data.totalIncome : cats.reduce((s, c) => s + Math.max(0, c.amount), 0) || 1

  const incomeW = 140
  const incomeH = 90
  const income: FlowBox = { x: 20, y: height / 2 - incomeH / 2, w: incomeW, h: incomeH, label: '總收入', amount: data.totalIncome, color: '#19324A', pct: 100 }

  const catX = 240
  const catW = 190
  const gap = 14
  const rowH = cats.length > 0 ? Math.min(70, (height - gap * (cats.length - 1)) / cats.length) : 0
  const totalCatHeight = cats.length * rowH + (cats.length - 1) * gap
  let cursorY = (height - totalCatHeight) / 2

  const categories: FlowBox[] = []
  const edgesIncomeToCategory: FlowEdge[] = []
  const subItems: (FlowBox & { categoryId: string })[] = []

  const subX = catX + catW + 90
  const subW = width - subX - 20

  cats.forEach((cat) => {
    const pct = (Math.max(0, cat.amount) / total) * 100
    const box: FlowBox = { x: catX, y: cursorY, w: catW, h: rowH, label: cat.name, amount: cat.amount, color: cat.color, pct }
    categories.push(box)

    edgesIncomeToCategory.push({
      x1: income.x + income.w,
      y1: income.y + income.h / 2,
      x2: box.x,
      y2: box.y + box.h / 2,
      strokeWidth: Math.max(2, Math.min(28, (pct / 100) * 60)),
      color: cat.color
    })

    const visibleSub = cat.subItems.filter((s) => s.visible)
    const subGap = 6
    const subRowH = visibleSub.length > 0 ? Math.min(28, (rowH - subGap * (visibleSub.length - 1)) / visibleSub.length) : 0
    let subCursorY = box.y + (rowH - (visibleSub.length * subRowH + (visibleSub.length - 1) * subGap)) / 2
    const subTotal = cat.amount > 0 ? cat.amount : visibleSub.reduce((s, i) => s + Math.max(0, i.amount), 0) || 1

    visibleSub.forEach((sub) => {
      subItems.push({
        x: subX,
        y: subCursorY,
        w: subW,
        h: subRowH,
        label: sub.name,
        amount: sub.amount,
        color: cat.color,
        pct: (Math.max(0, sub.amount) / subTotal) * 100,
        categoryId: cat.id
      })
      subCursorY += subRowH + subGap
    })

    cursorY += rowH + gap
  })

  return { width, height, income, categories, edgesIncomeToCategory, subItems }
}

export interface TreeLayout {
  width: number
  height: number
  root: FlowBox
  level2: FlowBox[]
  level3: (FlowBox & { categoryId: string })[]
  edgesRootToLevel2: FlowEdge[]
  edgesLevel2ToLevel3: FlowEdge[]
}

/** 計算「樹狀帳戶圖」版面座標：第一層總收入（頂端置中），第二層大項目，第三層小項目 */
export function buildTreeLayout(data: AccountAllocationData, width = 1000, height = 560): TreeLayout {
  const cats = visibleCategories(data)
  const total = data.totalIncome > 0 ? data.totalIncome : cats.reduce((s, c) => s + Math.max(0, c.amount), 0) || 1

  const root: FlowBox = { x: width / 2 - 90, y: 10, w: 180, h: 60, label: '總收入', amount: data.totalIncome, color: '#19324A', pct: 100 }

  const level2Y = 110
  const level2H = 60
  const colW = width / Math.max(1, cats.length)
  const level2: FlowBox[] = cats.map((cat, i) => ({
    x: colW * i + colW * 0.5 - 75,
    y: level2Y,
    w: 150,
    h: level2H,
    label: cat.name,
    amount: cat.amount,
    color: cat.color,
    pct: (Math.max(0, cat.amount) / total) * 100
  }))

  const edgesRootToLevel2: FlowEdge[] = level2.map((box, i) => ({
    x1: root.x + root.w / 2,
    y1: root.y + root.h,
    x2: box.x + box.w / 2,
    y2: box.y,
    strokeWidth: Math.max(1.5, Math.min(10, (box.pct / 100) * 24)),
    color: cats[i].color
  }))

  const level3: (FlowBox & { categoryId: string })[] = []
  const edgesLevel2ToLevel3: FlowEdge[] = []
  const level3Y = level2Y + level2H + 40

  cats.forEach((cat, i) => {
    const parent = level2[i]
    const visibleSub = cat.subItems.filter((s) => s.visible)
    const subTotal = cat.amount > 0 ? cat.amount : visibleSub.reduce((s, x) => s + Math.max(0, x.amount), 0) || 1
    const subW = Math.min(110, colW / Math.max(1, visibleSub.length) - 8)
    const rowStartX = parent.x + parent.w / 2 - (visibleSub.length * (subW + 8) - 8) / 2

    visibleSub.forEach((sub, j) => {
      const box = { x: rowStartX + j * (subW + 8), y: level3Y, w: subW, h: 50, label: sub.name, amount: sub.amount, color: cat.color, pct: (Math.max(0, sub.amount) / subTotal) * 100, categoryId: cat.id }
      level3.push(box)
      edgesLevel2ToLevel3.push({
        x1: parent.x + parent.w / 2,
        y1: parent.y + parent.h,
        x2: box.x + box.w / 2,
        y2: box.y,
        strokeWidth: Math.max(1, Math.min(6, (box.pct / 100) * 14)),
        color: cat.color
      })
    })
  })

  return { width, height, root, level2, level3, edgesRootToLevel2, edgesLevel2ToLevel3 }
}

export interface AllocationSummary {
  totalIncome: number
  allocatedTotal: number
  unallocated: number
  overAllocated: number
}

/** 計算已分配總額、尚未分配金額、超額分配金額（絕不因為金額不相等就視為錯誤） */
export function computeAllocationSummary(data: AccountAllocationData): AllocationSummary {
  const allocatedTotal = visibleCategories(data).reduce((s, c) => s + Math.max(0, c.amount), 0)
  const diff = data.totalIncome - allocatedTotal
  return {
    totalIncome: data.totalIncome,
    allocatedTotal,
    unallocated: diff > 0 ? diff : 0,
    overAllocated: diff < 0 ? Math.abs(diff) : 0
  }
}
