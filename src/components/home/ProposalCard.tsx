import React from 'react'
import { Copy, Download, FileJson, FileText, MonitorPlay, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProposalSummary } from '../../types'

interface Props {
  summary: ProposalSummary
  onOpen: () => void
  onDuplicate: () => void
  onRename: () => void
  onDelete: () => void
  onExportPptx: () => void
  onExportKeynotePptx: () => void
  onExportPdf: () => void
  onExportJSON: () => void
}

export function ProposalCard({ summary, onOpen, onDuplicate, onRename, onDelete, onExportPptx, onExportKeynotePptx, onExportPdf, onExportJSON }: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false)

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
        </div>
        <div className="p-3">
          <div className="text-sm font-semibold text-zeta-navy truncate">{summary.name}</div>
          <div className="text-xs text-zeta-text/60 truncate mt-0.5">{summary.clientName}｜{summary.topic}</div>
          <div className="text-[10px] text-zeta-text/40 mt-1.5">最後編輯：{new Date(summary.updatedAt).toLocaleString('zh-Hant-TW')}</div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-zeta-navy shadow-soft opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical size={15} />
      </button>
      {menuOpen && (
        <div className="absolute top-10 right-2 bg-white rounded-lg shadow-soft border border-zeta-bg py-1 z-10 w-40 text-sm" onMouseLeave={() => setMenuOpen(false)}>
          <MenuItem icon={Pencil} label="重新命名" onClick={onRename} />
          <MenuItem icon={Copy} label="複製提案" onClick={onDuplicate} />
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
