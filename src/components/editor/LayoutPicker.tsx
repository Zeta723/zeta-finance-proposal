import React from 'react'
import type { SlideType } from '../../types'
import { LAYOUTS_BY_TYPE } from '../../data/slideDefaults'
import { TemplateThumbnail } from './TemplateThumbnail'
import { Check } from 'lucide-react'

interface Props {
  type: SlideType
  value: string
  defaultTheme: string
  onChange: (layoutId: string) => void
}

/**
 * 版型選擇器：縮圖為真實渲染畫面（TemplateThumbnail），並顯示模板名稱、說明與適用情境。
 * 切換版型只會改變 layoutId，不會動到 slide.data，因此原本輸入的文字/圖片/數據都會保留。
 */
export function LayoutPicker({ type, value, defaultTheme, onChange }: Props) {
  const layouts = LAYOUTS_BY_TYPE[type]
  return (
    <div className="grid grid-cols-1 gap-2">
      {layouts.map((l) => {
        const active = value === l.id
        return (
          <button
            key={l.id}
            onClick={() => onChange(l.id)}
            className={`text-left rounded-lg border-2 p-2 transition-colors ${active ? 'border-zeta-gold bg-zeta-gold/10' : 'border-zeta-bg hover:border-zeta-cream'}`}
          >
            <div className="flex gap-2">
              <div className="w-24 shrink-0">
                <TemplateThumbnail type={type} layoutId={l.id} defaultTheme={defaultTheme} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-zeta-navy">{l.name}</span>
                  {active && <Check size={12} className="text-zeta-gold" />}
                </div>
                <div className="text-[10px] text-zeta-text/60 mt-0.5 leading-tight">{l.description}</div>
                <div className="text-[10px] text-zeta-text/40 mt-0.5">{l.useCase}</div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
