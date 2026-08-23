import React, { useState } from 'react'
import { ChevronDown, Download, FileText, MonitorPlay } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  onExportEditable: () => void
  onExportKeynote: () => void
  onExportPdf: () => void
  disabled?: boolean
  label?: string
}

/**
 * 匯出選單：可編輯PowerPoint／Keynote相容PowerPoint／PDF 三選一。
 * 對應規格「十、提供三種匯出選項」。
 */
export function ExportMenu({ onExportEditable, onExportKeynote, onExportPdf, disabled, label = '匯出' }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full bg-zeta-gold text-zeta-navy font-medium hover:opacity-90 disabled:opacity-50"
      >
        <Download size={14} /> {label} <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-soft border border-zeta-bg py-1 z-20 text-sm">
            <MenuItem
              icon={Download}
              title="匯出可編輯PowerPoint"
              desc="文字/圖形/圖表盡量保持可編輯"
              onClick={() => { setOpen(false); onExportEditable() }}
            />
            <MenuItem
              icon={MonitorPlay}
              title="匯出Keynote相容PowerPoint"
              desc="圖表轉高解析度圖片，避免在Keynote消失"
              onClick={() => { setOpen(false); onExportKeynote() }}
            />
            <MenuItem
              icon={FileText}
              title="匯出PDF"
              desc="完整保留視覺效果，直接下載"
              onClick={() => { setOpen(false); onExportPdf() }}
            />
          </div>
        </>
      )}
    </div>
  )
}

function MenuItem({ icon: Icon, title, desc, onClick }: { icon: LucideIcon; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-2 hover:bg-zeta-bg flex items-start gap-2">
      <Icon size={15} />
      <span>
        <span className="block text-zeta-navy font-medium">{title}</span>
        <span className="block text-[11px] text-zeta-text/50">{desc}</span>
      </span>
    </button>
  )
}
