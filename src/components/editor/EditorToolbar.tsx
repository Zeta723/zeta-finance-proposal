import React from 'react'
import { ArrowLeft, FileJson, Loader2, Redo2, Undo2, CheckCircle2, AlertCircle } from 'lucide-react'
import type { SaveStatus } from '../../store/useProposalEditor'
import { ExportMenu } from './ExportMenu'

interface Props {
  proposalName: string
  saveStatus: SaveStatus
  canUndo: boolean
  canRedo: boolean
  onBack: () => void
  onUndo: () => void
  onRedo: () => void
  onExportJSON: () => void
  onExportEditable: () => void
  onExportKeynote: () => void
  onExportPdf: () => void
  isExporting: boolean
}

const STATUS_LABEL: Record<SaveStatus, { label: string; icon: React.ReactNode; className: string }> = {
  idle: { label: '', icon: null, className: '' },
  saving: { label: '儲存中…', icon: <Loader2 size={13} className="animate-spin" />, className: 'text-zeta-text/50' },
  saved: { label: '已儲存', icon: <CheckCircle2 size={13} />, className: 'text-zeta-positive' },
  error: { label: '儲存失敗', icon: <AlertCircle size={13} />, className: 'text-zeta-danger' }
}

export function EditorToolbar({
  proposalName, saveStatus, canUndo, canRedo, onBack, onUndo, onRedo, onExportJSON,
  onExportEditable, onExportKeynote, onExportPdf, isExporting
}: Props) {
  const status = STATUS_LABEL[saveStatus]
  return (
    <div className="h-14 shrink-0 bg-white border-b border-zeta-bg flex items-center justify-between px-4">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-zeta-bg text-zeta-navy shrink-0" title="返回提案列表">
          <ArrowLeft size={17} />
        </button>
        <span className="text-sm font-semibold text-zeta-navy truncate max-w-[240px]">{proposalName || '未命名提案'}</span>
        {status.label && (
          <span className={`flex items-center gap-1 text-xs ${status.className}`}>
            {status.icon} {status.label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-full hover:bg-zeta-bg disabled:opacity-30 text-zeta-navy" title="復原">
          <Undo2 size={16} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-full hover:bg-zeta-bg disabled:opacity-30 text-zeta-navy" title="重做">
          <Redo2 size={16} />
        </button>
        <div className="w-px h-5 bg-zeta-bg mx-1" />
        <button onClick={onExportJSON} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-zeta-navy/20 text-zeta-navy hover:bg-zeta-bg">
          <FileJson size={14} /> 匯出JSON
        </button>
        <ExportMenu
          disabled={isExporting}
          onExportEditable={onExportEditable}
          onExportKeynote={onExportKeynote}
          onExportPdf={onExportPdf}
        />
      </div>
    </div>
  )
}
