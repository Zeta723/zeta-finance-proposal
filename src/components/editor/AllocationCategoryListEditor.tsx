import React from 'react'
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import type { AllocationCategory, AllocationSubItem } from '../../types'
import { CHART_PALETTE } from '../../styles/theme'
import { newId } from '../../services/idGenerator'

interface Props {
  categories: AllocationCategory[]
  onChange: (categories: AllocationCategory[]) => void
}

/** 大項目／小項目編輯器：新增/刪除/改名/改金額/改顏色/顯示隱藏/排序，並可在大項目下新增小項目 */
export function AllocationCategoryListEditor({ categories, onChange }: Props) {
  const updateCat = (id: string, patch: Partial<AllocationCategory>) => onChange(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const removeCat = (id: string) => onChange(categories.filter((c) => c.id !== id))
  const moveCat = (index: number, dir: -1 | 1) => {
    const to = index + dir
    if (to < 0 || to >= categories.length) return
    const next = [...categories]
    const [item] = next.splice(index, 1)
    next.splice(to, 0, item)
    onChange(next)
  }
  const addCat = () => onChange([...categories, { id: newId(), name: '新大項目', amount: 0, color: CHART_PALETTE[categories.length % CHART_PALETTE.length], visible: true, subItems: [] }])

  const updateSub = (catId: string, subId: string, patch: Partial<AllocationSubItem>) =>
    onChange(categories.map((c) => (c.id === catId ? { ...c, subItems: c.subItems.map((s) => (s.id === subId ? { ...s, ...patch } : s)) } : c)))
  const removeSub = (catId: string, subId: string) =>
    onChange(categories.map((c) => (c.id === catId ? { ...c, subItems: c.subItems.filter((s) => s.id !== subId) } : c)))
  const addSub = (catId: string) =>
    onChange(categories.map((c) => (c.id === catId ? { ...c, subItems: [...c.subItems, { id: newId(), name: '新小項目', amount: 0, visible: true }] } : c)))

  return (
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <div key={cat.id} className="border border-zeta-bg rounded-lg overflow-hidden">
          <div className="flex items-center gap-1.5 p-2 bg-zeta-bg/40">
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
            <button onClick={() => moveCat(i, -1)} className="text-zeta-text/40 hover:text-zeta-navy shrink-0"><ChevronUp size={14} /></button>
            <button onClick={() => moveCat(i, 1)} className="text-zeta-text/40 hover:text-zeta-navy shrink-0"><ChevronDown size={14} /></button>
            <button onClick={() => updateCat(cat.id, { visible: !cat.visible })} className="text-zeta-text/40 hover:text-zeta-navy shrink-0">
              {cat.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button onClick={() => removeCat(cat.id)} className="text-zeta-danger/70 hover:text-zeta-danger shrink-0"><Trash2 size={14} /></button>
          </div>
          <div className="p-2 pl-6 space-y-1.5">
            <input
              value={cat.note ?? ''}
              onChange={(e) => updateCat(cat.id, { note: e.target.value })}
              placeholder="大項目備註（選填）"
              className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1 focus:outline-none focus:border-zeta-gold mb-1.5"
            />
            {cat.subItems.map((sub) => (
              <div key={sub.id} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-zeta-text/30 shrink-0" />
                <input
                  value={sub.name}
                  onChange={(e) => updateSub(cat.id, sub.id, { name: e.target.value })}
                  className="flex-1 text-xs border border-zeta-bg rounded-md px-2 py-1 focus:outline-none focus:border-zeta-gold min-w-0"
                  placeholder="小項目名稱"
                />
                <input
                  type="number"
                  value={sub.amount}
                  onChange={(e) => updateSub(cat.id, sub.id, { amount: Number(e.target.value) })}
                  className="w-20 text-xs border border-zeta-bg rounded-md px-2 py-1 text-right focus:outline-none focus:border-zeta-gold"
                />
                <button onClick={() => updateSub(cat.id, sub.id, { visible: !sub.visible })} className="text-zeta-text/40 hover:text-zeta-navy shrink-0">
                  {sub.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button onClick={() => removeSub(cat.id, sub.id)} className="text-zeta-danger/70 hover:text-zeta-danger shrink-0"><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => addSub(cat.id)} className="text-[11px] text-zeta-navy hover:underline">+ 新增小項目</button>
          </div>
        </div>
      ))}
      <button onClick={addCat} className="w-full flex items-center justify-center gap-1 text-xs py-2 rounded-lg border border-dashed border-zeta-gold/60 text-zeta-navy hover:bg-zeta-gold/10">
        <Plus size={14} /> 新增大項目
      </button>
    </div>
  )
}
