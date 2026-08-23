import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidthClass?: string
}

/** 品牌風格 Modal，取代瀏覽器原生 alert/confirm */
export function Modal({ open, onClose, title, children, footer, maxWidthClass = 'max-w-lg' }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zeta-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidthClass} bg-white rounded-card shadow-soft border border-zeta-cream/60 max-h-[85vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zeta-bg">
          <h2 className="text-lg font-semibold text-zeta-navy">{title}</h2>
          <button onClick={onClose} className="text-zeta-text/50 hover:text-zeta-navy transition-colors" aria-label="關閉">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-zeta-bg flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
