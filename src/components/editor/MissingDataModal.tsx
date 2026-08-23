import React from 'react'
import { Modal } from '../common/Modal'
import type { MissingDataIssue } from '../../export/pptxExport'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  issues: MissingDataIssue[]
  onBack: () => void
  onContinue: () => void
}

/** 匯出前資料檢查：列出缺少的內容，讓使用者選擇返回補充或仍然繼續匯出 */
export function MissingDataModal({ open, issues, onBack, onContinue }: Props) {
  return (
    <Modal
      open={open}
      onClose={onBack}
      title="匯出前提醒"
      footer={
        <>
          <button onClick={onBack} className="px-4 py-2 rounded-full text-sm border border-zeta-bg">返回補充資料</button>
          <button onClick={onContinue} className="px-4 py-2 rounded-full text-sm bg-zeta-gold text-zeta-navy font-medium hover:opacity-90">仍然繼續匯出</button>
        </>
      }
    >
      <div className="flex items-start gap-2 mb-3 text-zeta-navy">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p className="text-sm">以下內容尚未填寫完整，仍可以匯出，但建議先確認：</p>
      </div>
      <ul className="space-y-1.5 text-sm text-zeta-text">
        {issues.map((issue, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-zeta-gold">•</span>
            <span><strong className="text-zeta-navy">{issue.slideLabel}</strong>：{issue.message}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
