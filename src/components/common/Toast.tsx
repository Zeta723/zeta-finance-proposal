import React, { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ToastKind = 'success' | 'error' | 'info' | 'warning'
interface ToastItem { id: number; kind: ToastKind; message: string }

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastKind, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle
}

const COLORS: Record<ToastKind, string> = {
  success: 'border-zeta-positive/40 text-zeta-positive',
  error: 'border-zeta-danger/40 text-zeta-danger',
  info: 'border-zeta-navy/30 text-zeta-navy',
  warning: 'border-zeta-gold/50 text-zeta-navy'
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, kind, message }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3800)
  }, [])

  const remove = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
        {items.map((t) => {
          const Icon = ICONS[t.kind]
          return (
            <div
              key={t.id}
              className={`bg-white border ${COLORS[t.kind]} rounded-xl shadow-soft px-4 py-3 flex items-start gap-2 text-sm animate-[fadeIn_0.15s_ease-out]`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1 text-zeta-text">{t.message}</span>
              <button onClick={() => remove(t.id)} className="text-zeta-text/40 hover:text-zeta-text">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 必須在 ToastProvider 內使用')
  return ctx
}
