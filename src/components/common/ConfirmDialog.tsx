import React from 'react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** 二次確認視窗，用於刪除提案／頁面等破壞性操作 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = '取消',
  danger = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      maxWidthClass="max-w-sm"
      footer={
        <>
          <button onClick={onCancel} className="px-4 py-2 rounded-full text-sm border border-zeta-bg text-zeta-text hover:bg-zeta-bg">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-full text-sm text-white ${danger ? 'bg-zeta-danger hover:opacity-90' : 'bg-zeta-navy hover:opacity-90'}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm text-zeta-text/80">{message}</div>
    </Modal>
  )
}
