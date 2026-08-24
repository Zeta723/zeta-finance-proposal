import React from 'react'
import { Settings2 } from 'lucide-react'
import type { ProposalCategory } from '../../types'

interface Props {
  categories: ProposalCategory[]
  activeCategoryId: string | 'all' | 'uncategorized'
  countAll: number
  countUncategorized: number
  countByCategory: Record<string, number>
  onSelect: (id: string | 'all' | 'uncategorized') => void
  onManage: () => void
}

/** 首頁分類標籤列：全部／未分類／各自訂分類，各自顯示專案數量 */
export function CategoryTabs({ categories, activeCategoryId, countAll, countUncategorized, countByCategory, onSelect, onManage }: Props) {
  const tab = (id: string | 'all' | 'uncategorized', label: string, count: number) => (
    <button
      key={id}
      onClick={() => onSelect(id)}
      className={`shrink-0 text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
        activeCategoryId === id ? 'bg-zeta-navy text-white' : 'bg-white text-zeta-text/70 border border-zeta-bg hover:border-zeta-cream'
      }`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  )

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {tab('all', '全部', countAll)}
      {categories.map((c) => tab(c.id, c.name, countByCategory[c.id] ?? 0))}
      {tab('uncategorized', '未分類', countUncategorized)}
      <button onClick={onManage} className="shrink-0 text-xs px-2.5 py-1.5 rounded-full text-zeta-text/50 hover:bg-zeta-bg flex items-center gap-1">
        <Settings2 size={13} /> 管理分類
      </button>
    </div>
  )
}
