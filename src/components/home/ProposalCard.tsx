import React from 'react'
import { Copy, Download, FileJson, FileText, FolderInput, MonitorPlay, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProposalCategory, ProposalSummary } from '../../types'

interface Props {
  summary: ProposalSummary
  categories: ProposalCategory[]
  onOpen: () => void
  onDuplicate: () => void
  onRename: () => void
  onDelete: () => void
  onSetCategory: (categoryId: string | undefined) => void
  onExportPptx: () => void
  onExportKeynotePptx: () => void
  onExportPdf: () => void
  onExportJSON: () => void
}

export function ProposalCard({ summary, categories, onOpen, onDuplicate, onRename, onDelete, onSetCategory, onExportPptx, onExportKeynotePptx, onExportPdf, onExportJSON }: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [categorySubmenuOpen, setCategorySubmenuOpen] = React.useState(false)
  const currentCategory = categories.find((c) => c.id === summary.categoryId)

  return (
    <div className="bg-white rounded-card shadow-soft border border-zeta-bg overflow-hidden group relative">
      <div onClick={onOpen} className="cursor-pointer">
        <div className="aspect-video bg-gradient-to-br from-zeta-navy to-zeta-cream flex items-center justify-center relative">
          {summary.thumbnail ? (
            <img src={summary.thumbnail} className="w-full h-full object-cover" alt={summary.name} />
          ) : (
            <span className="text-white/70 text-xs">{summary.slideCount} 頁簡報</span>
          )}
          <div className="absolute bottom-1.5 left-1.5 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded">{summary.slideCount} 頁</div>
          {currentCategory && (
            <div className="absolute top-1.5 left-1.5 bg-zeta-gold text-zeta-navy text-[10px] px-1.5 py-0.5 rounded-full font-medium">{currentCategory.name}</div>
          )}
        </div>
        <div className="p-3">
          <div className="text-sm font-semibold text-zeta-navy truncate">{summary.name}</div>
          <div className="text-xs text-zeta-text/60 truncate mt-0.5">{summary.clientName}｜{summary.topic}</div>
          <div className="text-[10px] text-zeta-text/40 mt-1.5">最後編輯：{new Date(summary.updatedAt).toLocaleString('zh-Hant-TW')}</div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); setCategorySubmenuOpen(false) }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-zeta-navy shadow-soft opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical size={15} />
      </button>
      {menuOpen && (
        <div className="absolute top-10 right-2 bg-white rounded-lg shadow-soft border border-zeta-bg py-1 z-10 w-44 text-sm" onMouseLeave={() => { setMenuOpen(false); setCategorySubmenuOpen(false) }}>
          <MenuItem icon={Pencil} label="重新命名" onClick={onRename} />
          <MenuItem icon={Copy} label="複製提案" onClick={onDuplicate} />
          <div className="relative">
            <button
              onClick={() => setCategorySubmenuOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zeta-bg text-zeta-text"
            >
              <FolderInput size={14} /> 選擇分類
            </button>
            {categorySubmenuOpen && (
              <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-soft border border-zeta-bg py-1 w-40 max-h-52 overflow-y-auto">
                <button
                  onClick={() => { onSetCategory(undefined); setMenuOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-zeta-bg ${!summary.categoryId ? 'text-zeta-navy font-medium' : 'text-zeta-text/70'}`}
                >
                  未分類
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { onSetCategory(c.id); setMenuOpen(false) }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-zeta-bg truncate ${summary.categoryId === c.id ? 'text-zeta-navy font-medium' : 'text-zeta-text/70'}`}
                  >
                    {c.name}
                  </button>
                ))}
                {categories.length === 0 && <div className="px-3 py-1.5 text-xs text-zeta-text/40">尚未建立分類</div>}
              </div>
            )}
          </div>
          <MenuItem icon={Download} label="匯出可編輯PowerPoint" onClick={onExportPptx} />
          <MenuItem icon={MonitorPlay} label="匯出Keynote相容PowerPoint" onClick={onExportKeynotePptx} />
          <MenuItem icon={FileText} label="匯出PDF" onClick={onExportPdf} />
          <MenuItem icon={FileJson} label="匯出JSON" onClick={onExportJSON} />
          <MenuItem icon={Trash2} label="刪除提案" onClick={onDelete} danger />
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zeta-bg ${danger ? 'text-zeta-danger' : 'text-zeta-text'}`}
    >
      <Icon size={14} /> {label}
    </button>
  )
}
