import React, { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { Modal } from '../common/Modal'
import type { ProposalCategory } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  categories: ProposalCategory[]
  currentCategoryId: string | undefined
  proposalName: string
  onSelect: (categoryId: string | undefined) => void
  onCreateCategory: (name: string) => string
}

/**
 * 分類選擇視窗：實際可以選擇既有分類、新增分類、把專案移到指定分類，
 * 並清楚顯示目前所屬分類 —— 不是只有選單文字，點下去就能真的操作。
 * 用獨立置中 Modal（而不是選單裡的巢狀 flyout），避免和「⋯」選單一樣被裁切。
 */
export function CategoryPickerModal({ open, onClose, categories, currentCategoryId, proposalName, onSelect, onCreateCategory }: Props) {
  const [newName, setNewName] = useState('')

  const choose = (id: string | undefined) => {
    onSelect(id)
    onClose()
  }

  const createAndChoose = () => {
    if (!newName.trim()) return
    const id = onCreateCategory(newName.trim())
    setNewName('')
    choose(id)
  }

  return (
    <Modal open={open} onClose={onClose} title={`選擇分類 — ${proposalName}`} maxWidthClass="max-w-sm">
      <div className="space-y-1 mb-3 max-h-64 overflow-y-auto">
        <button
          onClick={() => choose(undefined)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${!currentCategoryId ? 'bg-zeta-gold/15 text-zeta-navy font-medium' : 'hover:bg-zeta-bg text-zeta-text'}`}
        >
          未分類
          {!currentCategoryId && <Check size={14} />}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => choose(c.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${currentCategoryId === c.id ? 'bg-zeta-gold/15 text-zeta-navy font-medium' : 'hover:bg-zeta-bg text-zeta-text'}`}
          >
            <span className="truncate">{c.name}</span>
            {currentCategoryId === c.id && <Check size={14} className="shrink-0" />}
          </button>
        ))}
        {categories.length === 0 && <div className="text-xs text-zeta-text/40 text-center py-3">尚未建立任何分類</div>}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-zeta-bg">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createAndChoose()}
          placeholder="新增分類並套用，例如：初次諮詢"
          className="flex-1 text-sm border border-zeta-bg rounded-md px-3 py-2 focus:outline-none focus:border-zeta-gold"
        />
        <button
          onClick={createAndChoose}
          disabled={!newName.trim()}
          className="flex items-center gap-1 text-sm px-3 py-2 rounded-md bg-zeta-navy text-white hover:opacity-90 disabled:opacity-40 shrink-0"
        >
          <Plus size={14} /> 新增
        </button>
      </div>
    </Modal>
  )
}
