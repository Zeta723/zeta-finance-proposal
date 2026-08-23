import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-zeta-cream/60 flex items-center justify-center mb-4">
          <Icon size={26} className="text-zeta-navy" />
        </div>
      )}
      <h3 className="text-base font-medium text-zeta-navy mb-1">{title}</h3>
      {description && <p className="text-sm text-zeta-text/60 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}
