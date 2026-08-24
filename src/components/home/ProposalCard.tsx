import React, { useRef, useState } from 'react'
import { Copy, Download, FileJson, FileText, FolderInput, MonitorPlay, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProposalCategory, ProposalSummary } from '../../types'
import { PortalMenu } from '../common/PortalMenu'
import { CategoryPickerModal } from './CategoryPickerModal'

interface Props {
  summary: ProposalSummary
  categories: ProposalCategory[]
  onOpen: () => void
  onDuplicate: () => void
  onRename: () => void
  onDelete: () => void
  onSetCategory: (categoryId: string | undefined) => void
  onCreateCategory: (name: string) => string
  onExportPptx: () => void
  onExportKeynotePptx: () => void
  onExportPdf: () => void
  onExportJSON: () => void
}

export function ProposalCard({
  summary, categories, onOpen, onDuplicate, onRename, onDelete, onSetCategory, onCreateCategory,
  onExportPptx, onExportKeynotePptx, onExportPdf, onExportJSON
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const currentCategory = categories.find((c) => c.id === summary.categoryId)

  const runAndClose = (fn: () => void) => {
    fn()
    setMenuOpen(false)
  }

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
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-zeta-navy shadow-soft opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical size={15} />
      </button>

      {/* 選單改用 Portal 掛到 document.body，脫離本卡片 overflow-hidden 的裁切範圍 */}
      <PortalMenu open={menuOpen} anchorRef={triggerRef} onClose={() => setMenuOpen(false)}>
        <MenuItem icon={Pencil} label="重新命名" onClick={() => runAndClose(onRename)} />
        <MenuItem icon={Copy} label="複製提案" onClick={() => runAndClose(onDuplicate)} />
        <MenuItem icon={FolderInput} label={`選擇分類${currentCategory ? `（${currentCategory.name}）` : ''}`} onClick={() => runAndClose(() => setCategoryPickerOpen(true))} />
        <MenuItem icon={Download} label="匯出可編輯PowerPoint" onClick={() => runAndClose(onExportPptx)} />
        <MenuItem icon={MonitorPlay} label="匯出Keynote相容PowerPoint" onClick={() => runAndClose(onExportKeynotePptx)} />
        <MenuItem icon={FileText} label="匯出PDF" onClick={() => runAndClose(onExportPdf)} />
        <MenuItem icon={FileJson} label="匯出JSON" onClick={() => runAndClose(onExportJSON)} />
        <MenuItem icon={Trash2} label="刪除提案" onClick={() => runAndClose(onDelete)} danger />
      </PortalMenu>

      <CategoryPickerModal
        open={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        categories={categories}
        currentCategoryId={summary.categoryId}
        proposalName={summary.name}
        onSelect={onSetCategory}
        onCreateCategory={onCreateCategory}
      />
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zeta-bg text-left ${danger ? 'text-zeta-danger' : 'text-zeta-text'}`}
    >
      <Icon size={14} className="shrink-0" /> <span className="truncate">{label}</span>
    </button>
  )
}
