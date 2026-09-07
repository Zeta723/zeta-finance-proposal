import React, { useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, CheckCircle2, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react'
import type { AllocationCategory, AllocationSubItem, CurrencyCode } from '../../types'
import { CHART_PALETTE } from '../../styles/theme'
import { newId } from '../../services/idGenerator'
import { currencySymbol } from '../../services/currencyService'

interface Props {
  categories: AllocationCategory[]
  onChange: (categories: AllocationCategory[]) => void
  currency?: CurrencyCode
  customCurrencyLabel?: string
}

/** 安全加總，NaN／非數字／undefined 一律視為 0，避免計算結果變成 NaN */
function safeNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function subTotalOf(subItems: AllocationSubItem[]): number {
  return subItems.reduce((sum, s) => sum + safeNum(s.amount), 0)
}

function findContainerId(categories: AllocationCategory[], subItemId: string): string | undefined {
  return categories.find((c) => c.subItems.some((s) => s.id === subItemId))?.id
}

function reorderSubItemWithin(categories: AllocationCategory[], categoryId: string, activeId: string, overId: string): AllocationCategory[] {
  return categories.map((c) => {
    if (c.id !== categoryId) return c
    const oldIndex = c.subItems.findIndex((s) => s.id === activeId)
    const newIndex = c.subItems.findIndex((s) => s.id === overId)
    if (oldIndex === -1 || newIndex === -1) return c
    return { ...c, subItems: arrayMove(c.subItems, oldIndex, newIndex) }
  })
}

/** 只搬移小項目在陣列中的位置／所屬大項目，完全不動金額 —— 金額調整留到拖曳結束時一次性計算 */
function moveSubItemAcrossContainers(
  categories: AllocationCategory[],
  activeId: string,
  fromCategoryId: string,
  toCategoryId: string,
  overSubItemId: string | undefined
): AllocationCategory[] {
  const fromCat = categories.find((c) => c.id === fromCategoryId)
  const item = fromCat?.subItems.find((s) => s.id === activeId)
  if (!item) return categories

  return categories.map((c) => {
    if (c.id === fromCategoryId) {
      return { ...c, subItems: c.subItems.filter((s) => s.id !== activeId) }
    }
    if (c.id === toCategoryId) {
      const insertAt = overSubItemId ? c.subItems.findIndex((s) => s.id === overSubItemId) : -1
      const idx = insertAt === -1 ? c.subItems.length : insertAt
      const next = c.subItems.filter((s) => s.id !== activeId) // 防呆：若已存在（理論上不會）先移除避免重複
      next.splice(idx, 0, item)
      return { ...c, subItems: next }
    }
    return c
  })
}

/**
 * 大項目／小項目編輯器：
 * - 大項目可拖曳排序（獨立的 useSortable，data.type='category'）。
 * - 小項目可在同一大項目內排序，也可以跨大項目拖曳移動（同一個 DndContext
 *   內用 data.type 區分兩種拖曳行為，這是 dnd-kit 官方建議的多容器排序作法 ——
 *   拖曳過程用 onDragOver 即時搬移小項目在畫面上所屬的大項目容器（只動位置，
 *   不動金額，避免使用者游標在兩個大項目之間來回經過時金額被重複增減）；
 *   真正的金額調整只在 onDragEnd 放開滑鼠那一刻、依「起始大項目」與「最終
 *   大項目」是否不同，一次性計算並套用，因此每次拖曳只會產生一筆完整的
 *   復原/重做紀錄，也只會呼叫一次 onChange。
 * - 大項目金額欄位保留、可手動輸入；只有跨大項目拖曳時才會自動增減金額。
 * - 小項目合計與相符/不相符提示只存在於這個編輯器內，不影響 AccountAllocationData
 *   本身的資料結構，預覽／PDF／PPT 都不會讀取或顯示這些提示文字。
 */
export function AllocationCategoryListEditor({ categories, onChange, currency = 'TWD', customCurrencyLabel }: Props) {
  const [draft, setDraft] = useState<AllocationCategory[] | null>(null)
  const draftRef = useRef<AllocationCategory[] | null>(null)
  const dragStartContainerRef = useRef<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // 拖曳中畫面顯示 draft（即時反映跨容器搬移的位置），沒有拖曳時直接顯示外部傳入的 categories
  const displayCategories = draft ?? categories

  const setDraftBoth = (next: AllocationCategory[] | null) => {
    draftRef.current = next
    setDraft(next)
  }

  const updateCat = (id: string, patch: Partial<AllocationCategory>) => onChange(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const removeCat = (id: string) => onChange(categories.filter((c) => c.id !== id))
  const addCat = () => onChange([...categories, { id: newId(), name: '新大項目', amount: 0, color: CHART_PALETTE[categories.length % CHART_PALETTE.length], visible: true, subItems: [] }])

  const updateSub = (catId: string, subId: string, patch: Partial<AllocationSubItem>) =>
    onChange(categories.map((c) => (c.id === catId ? { ...c, subItems: c.subItems.map((s) => (s.id === subId ? { ...s, ...patch } : s)) } : c)))
  const removeSub = (catId: string, subId: string) =>
    onChange(categories.map((c) => (c.id === catId ? { ...c, subItems: c.subItems.filter((s) => s.id !== subId) } : c)))
  const addSub = (catId: string) =>
    onChange(categories.map((c) => (c.id === catId ? { ...c, subItems: [...c.subItems, { id: newId(), name: '新小項目', amount: 0, visible: true }] } : c)))

  const handleDragStart = (e: DragStartEvent) => {
    const type = e.active.data.current?.type
    if (type === 'subitem') {
      dragStartContainerRef.current = findContainerId(categories, e.active.id as string) ?? null
      setDraftBoth(categories)
    }
  }

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    if (active.data.current?.type !== 'subitem') return

    const current = draftRef.current ?? categories
    const activeContainer = findContainerId(current, active.id as string)
    const overData = over.data.current
    const overContainer = overData?.type === 'subitem' || overData?.type === 'container' ? (overData.categoryId as string) : undefined
    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    const overSubId = overData?.type === 'subitem' ? (over.id as string) : undefined
    setDraftBoth(moveSubItemAcrossContainers(current, active.id as string, activeContainer, overContainer, overSubId))
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    const type = active.data.current?.type

    if (type === 'category') {
      if (over && active.id !== over.id) {
        const oldIndex = categories.findIndex((c) => c.id === active.id)
        const newIndex = categories.findIndex((c) => c.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) onChange(arrayMove(categories, oldIndex, newIndex))
      }
      return
    }

    if (type === 'subitem') {
      let result = draftRef.current ?? categories
      const finalContainer = findContainerId(result, active.id as string)

      // 同一容器內的最終順序，依 over 目標微調（跨容器移動時 dragOver 已經把它放進正確的大項目了）
      if (over && finalContainer) {
        const overData = over.data.current
        if (overData?.type === 'subitem' && overData.categoryId === finalContainer && over.id !== active.id) {
          result = reorderSubItemWithin(result, finalContainer, active.id as string, over.id as string)
        }
      }

      const sourceContainer = dragStartContainerRef.current
      if (sourceContainer && finalContainer && sourceContainer !== finalContainer) {
        const movedItem = result.find((c) => c.id === finalContainer)?.subItems.find((s) => s.id === active.id)
        const movedAmount = safeNum(movedItem?.amount)
        result = result.map((c) => {
          if (c.id === sourceContainer) return { ...c, amount: safeNum(c.amount) - movedAmount }
          if (c.id === finalContainer) return { ...c, amount: safeNum(c.amount) + movedAmount }
          return c
        })
      }

      onChange(result)
      setDraftBoth(null)
      dragStartContainerRef.current = null
    }
  }

  const handleDragCancel = () => {
    setDraftBoth(null)
    dragStartContainerRef.current = null
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={displayCategories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {displayCategories.map((cat) => (
            <SortableCategoryCard
              key={cat.id}
              cat={cat}
              currency={currency}
              customCurrencyLabel={customCurrencyLabel}
              updateCat={updateCat}
              removeCat={removeCat}
              updateSub={updateSub}
              removeSub={removeSub}
              addSub={addSub}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button onClick={addCat} className="w-full flex items-center justify-center gap-1 text-xs py-2 rounded-lg border border-dashed border-zeta-gold/60 text-zeta-navy hover:bg-zeta-gold/10">
        <Plus size={14} /> 新增大項目
      </button>
    </div>
  )
}

interface CategoryCardProps {
  cat: AllocationCategory
  currency: CurrencyCode
  customCurrencyLabel?: string
  updateCat: (id: string, patch: Partial<AllocationCategory>) => void
  removeCat: (id: string) => void
  updateSub: (catId: string, subId: string, patch: Partial<AllocationSubItem>) => void
  removeSub: (catId: string, subId: string) => void
  addSub: (catId: string) => void
}

function SortableCategoryCard({ cat, currency, customCurrencyLabel, updateCat, removeCat, updateSub, removeSub, addSub }: CategoryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id, data: { type: 'category' } })
  const { setNodeRef: setDropRef } = useDroppable({ id: `container-${cat.id}`, data: { type: 'container', categoryId: cat.id } })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative'
  }

  const subTotal = subTotalOf(cat.subItems)
  const catAmount = safeNum(cat.amount)
  const diff = catAmount - subTotal
  const symbol = currencySymbol(currency, customCurrencyLabel)
  const fmt = (v: number) => `${symbol}${Math.round(v).toLocaleString('zh-Hant-TW')}`

  return (
    <div ref={setNodeRef} style={style} className="border border-zeta-bg rounded-lg overflow-hidden bg-white">
      <div className="flex items-center gap-1.5 p-2 bg-zeta-bg/40">
        <button {...attributes} {...listeners} className="text-zeta-text/30 hover:text-zeta-navy cursor-grab active:cursor-grabbing shrink-0 touch-none" style={{ touchAction: 'none' }} title="拖曳調整順序" aria-label="拖曳調整大項目順序">
          <GripVertical size={16} />
        </button>
        <input
          type="color"
          value={cat.color}
          onChange={(e) => updateCat(cat.id, { color: e.target.value })}
          className="w-5 h-5 rounded-full overflow-hidden border-0 p-0 shrink-0"
        />
        <input
          value={cat.name}
          onChange={(e) => updateCat(cat.id, { name: e.target.value })}
          className="flex-1 text-sm border border-zeta-bg rounded-md px-2 py-1 focus:outline-none focus:border-zeta-gold min-w-0"
          placeholder="大項目名稱"
        />
        <input
          type="number"
          value={cat.amount}
          onChange={(e) => updateCat(cat.id, { amount: Number(e.target.value) })}
          className="w-24 text-sm border border-zeta-bg rounded-md px-2 py-1 text-right focus:outline-none focus:border-zeta-gold"
          placeholder="金額"
        />
        <button onClick={() => updateCat(cat.id, { visible: !cat.visible })} className="text-zeta-text/40 hover:text-zeta-navy shrink-0">
          {cat.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={() => removeCat(cat.id)} className="text-zeta-danger/70 hover:text-zeta-danger shrink-0"><Trash2 size={14} /></button>
      </div>

      {/* 小項目合計檢查：只存在於編輯介面，不會出現在預覽／PDF／PPT */}
      {diff === 0 ? (
        <div className="flex items-center gap-1 text-[10px] text-zeta-positive px-2 pt-1.5">
          <CheckCircle2 size={12} /> 小項目合計相符（{fmt(subTotal)}）
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[10px] px-2 pt-1.5" style={{ color: '#D97706' }}>
          <AlertTriangle size={12} />
          小項目合計 {fmt(subTotal)}，{diff > 0 ? `尚差 ${fmt(diff)}` : `超出 ${fmt(Math.abs(diff))}`}
        </div>
      )}

      <div className="p-2 pl-6 space-y-1.5">
        <SortableContext items={cat.subItems.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div ref={setDropRef} className="space-y-1.5 min-h-[28px] rounded-md">
            {cat.subItems.length === 0 && (
              <div className="text-[10px] text-zeta-text/30 border border-dashed border-zeta-bg rounded-md py-2 text-center">
                拖曳小項目到這裡，或點選下方新增
              </div>
            )}
            {cat.subItems.map((sub) => (
              <SortableSubItemRow key={sub.id} sub={sub} categoryId={cat.id} updateSub={updateSub} removeSub={removeSub} />
            ))}
          </div>
        </SortableContext>
        <button onClick={() => addSub(cat.id)} className="text-[11px] text-zeta-navy hover:underline">+ 新增小項目</button>
      </div>
    </div>
  )
}

interface SubItemRowProps {
  sub: AllocationSubItem
  categoryId: string
  updateSub: (catId: string, subId: string, patch: Partial<AllocationSubItem>) => void
  removeSub: (catId: string, subId: string) => void
}

function SortableSubItemRow({ sub, categoryId, updateSub, removeSub }: SubItemRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sub.id,
    data: { type: 'subitem', categoryId }
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative'
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1.5 bg-white">
      <button {...attributes} {...listeners} className="text-zeta-text/30 hover:text-zeta-navy cursor-grab active:cursor-grabbing shrink-0 touch-none" style={{ touchAction: 'none' }} title="拖曳調整順序或移到其他大項目" aria-label="拖曳調整小項目順序">
        <GripVertical size={13} />
      </button>
      <input
        value={sub.name}
        onChange={(e) => updateSub(categoryId, sub.id, { name: e.target.value })}
        className="flex-1 text-xs border border-zeta-bg rounded-md px-2 py-1 focus:outline-none focus:border-zeta-gold min-w-0"
        placeholder="小項目名稱"
      />
      <input
        type="number"
        value={sub.amount}
        onChange={(e) => updateSub(categoryId, sub.id, { amount: Number(e.target.value) })}
        className="w-20 text-xs border border-zeta-bg rounded-md px-2 py-1 text-right focus:outline-none focus:border-zeta-gold"
      />
      <button onClick={() => updateSub(categoryId, sub.id, { visible: !sub.visible })} className="text-zeta-text/40 hover:text-zeta-navy shrink-0">
        {sub.visible ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>
      <button onClick={() => removeSub(categoryId, sub.id)} className="text-zeta-danger/70 hover:text-zeta-danger shrink-0"><Trash2 size={12} /></button>
    </div>
  )
}
