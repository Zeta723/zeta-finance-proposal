import React from 'react'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

interface Props {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}

/** 簡單字串清單編輯器：用於執行步驟、方案優勢、風險提醒、核心建議等可新增/刪除/排序欄位 */
export function StringListEditor({ label, items, onChange, placeholder }: Props) {
  const update = (i: number, value: string) => onChange(items.map((v, idx) => (idx === i ? value : v)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, ''])
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div>
      <label className="text-xs font-medium text-zeta-navy mb-1 block">{label}</label>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <button className="text-zeta-text/30 cursor-grab" onClick={() => move(i, i - 1)} title="上移">
              <GripVertical size={14} />
            </button>
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 text-sm border border-zeta-bg rounded-md px-2 py-1.5 focus:outline-none focus:border-zeta-gold"
            />
            <button onClick={() => remove(i)} className="text-zeta-danger/70 hover:text-zeta-danger">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-1.5 w-full flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-dashed border-zeta-gold/60 text-zeta-navy hover:bg-zeta-gold/10">
        <Plus size={13} /> 新增項目
      </button>
    </div>
  )
}
