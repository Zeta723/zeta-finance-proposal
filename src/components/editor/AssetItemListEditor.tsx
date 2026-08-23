import React from 'react'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import type { AssetItem } from '../../types'
import { CHART_PALETTE } from '../../styles/theme'
import { newId } from '../../services/idGenerator'
import { BRAND_COLOR_SWATCHES } from '../richtext/RichTextEditor'

interface Props {
  items: AssetItem[]
  onChange: (items: AssetItem[]) => void
  /** 顯示每個項目自己的年化報酬率輸入欄（用於「資產成長折線比較圖」逐項試算） */
  showReturnRate?: boolean
  /** 該側（調整前／調整後）沒有個別設定報酬率時使用的預設值，僅供欄位提示顯示 */
  defaultReturnRate?: number
}

/** 資產項目清單編輯器：新增、刪除、改名、改金額、改顏色、顯示/隱藏、備註，可選逐項報酬率 */
export function AssetItemListEditor({ items, onChange, showReturnRate, defaultReturnRate }: Props) {
  const update = (id: string, patch: Partial<AssetItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id))
  const add = () => {
    const color = CHART_PALETTE[items.length % CHART_PALETTE.length]
    onChange([...items, { id: newId(), name: '新資產項目', amount: 0, color, note: '', visible: true }])
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="border border-zeta-bg rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              value={item.name}
              onChange={(e) => update(item.id, { name: e.target.value })}
              className="flex-1 text-sm border border-zeta-bg rounded-md px-2 py-1 focus:outline-none focus:border-zeta-gold"
              placeholder="資產名稱"
            />
            <input
              type="number"
              value={item.amount}
              onChange={(e) => update(item.id, { amount: Number(e.target.value) })}
              className="w-28 text-sm border border-zeta-bg rounded-md px-2 py-1 text-right focus:outline-none focus:border-zeta-gold"
              placeholder="金額"
            />
            <button onClick={() => update(item.id, { visible: !item.visible })} className="text-zeta-text/50 hover:text-zeta-navy" title={item.visible ? '隱藏此項目' : '顯示此項目'}>
              {item.visible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button onClick={() => remove(item.id)} className="text-zeta-danger/70 hover:text-zeta-danger" title="刪除">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {BRAND_COLOR_SWATCHES.concat(CHART_PALETTE.map((v) => ({ label: v, value: v }))).slice(0, 8).map((c) => (
                <button
                  key={c.value}
                  onClick={() => update(item.id, { color: c.value })}
                  className={`w-4 h-4 rounded-full border ${item.color === c.value ? 'ring-2 ring-offset-1 ring-zeta-navy' : 'border-black/10'}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <input
                type="color"
                value={item.color}
                onChange={(e) => update(item.id, { color: e.target.value })}
                className="w-4 h-4 rounded-full overflow-hidden border-0 p-0"
                title="自訂顏色"
              />
            </div>
            <input
              value={item.note ?? ''}
              onChange={(e) => update(item.id, { note: e.target.value })}
              className="flex-1 text-xs border border-zeta-bg rounded-md px-2 py-1 focus:outline-none focus:border-zeta-gold"
              placeholder="備註（選填）"
            />
          </div>
          {showReturnRate && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zeta-text/50 shrink-0">此項目年化報酬率</span>
              <input
                type="number"
                step={0.1}
                value={item.annualReturnRate ?? ''}
                onChange={(e) => update(item.id, { annualReturnRate: e.target.value === '' ? undefined : Number(e.target.value) })}
                placeholder={defaultReturnRate !== undefined ? `預設 ${defaultReturnRate}%` : '未設定則用預設值'}
                className="w-28 text-xs border border-zeta-bg rounded-md px-2 py-1 text-right focus:outline-none focus:border-zeta-gold"
              />
              <span className="text-[10px] text-zeta-text/40">%</span>
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="w-full flex items-center justify-center gap-1 text-xs py-2 rounded-lg border border-dashed border-zeta-gold/60 text-zeta-navy hover:bg-zeta-gold/10">
        <Plus size={14} /> 新增資產項目
      </button>
    </div>
  )
}
