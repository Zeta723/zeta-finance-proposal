import React from 'react'
import { AlignCenter, AlignLeft, AlignRight, Minus, Plus } from 'lucide-react'
import type { TextBlockStyle } from '../../types'
import { defaultTextBlockStyle } from '../../types'

interface Props {
  style: TextBlockStyle | undefined
  onChange: (style: TextBlockStyle) => void
}

const FONT_SIZE_PRESETS = [16, 20, 24, 28, 32, 36, 40]

/** 內文區塊版面設定：整段字級、行高、對齊、字距、段落間距。不影響選取文字的局部格式。 */
export function BodyTextStyleEditor({ style, onChange }: Props) {
  const s = style ?? defaultTextBlockStyle()
  const set = (patch: Partial<TextBlockStyle>) => onChange({ ...s, ...patch })

  return (
    <div className="border border-zeta-bg rounded-lg p-2.5 space-y-2.5">
      <div>
        <label className="text-[10px] text-zeta-text/60 block mb-1">整段內文字體大小</label>
        <div className="flex items-center gap-2">
          <button onClick={() => set({ fontSize: Math.max(10, s.fontSize - 2) })} className="p-1.5 rounded-md border border-zeta-bg text-zeta-text/60 hover:bg-zeta-bg">
            <Minus size={12} />
          </button>
          <input
            type="range"
            min={10}
            max={64}
            value={s.fontSize}
            onChange={(e) => set({ fontSize: Number(e.target.value) })}
            className="flex-1"
          />
          <button onClick={() => set({ fontSize: Math.min(64, s.fontSize + 2) })} className="p-1.5 rounded-md border border-zeta-bg text-zeta-text/60 hover:bg-zeta-bg">
            <Plus size={12} />
          </button>
          <input
            type="number"
            value={s.fontSize}
            onChange={(e) => set({ fontSize: Number(e.target.value) })}
            className="w-14 text-xs border border-zeta-bg rounded-md px-1.5 py-1"
          />
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {FONT_SIZE_PRESETS.map((size) => (
            <button
              key={size}
              onClick={() => set({ fontSize: size })}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${s.fontSize === size ? 'border-zeta-gold bg-zeta-gold/10 text-zeta-navy' : 'border-zeta-bg text-zeta-text/50'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-zeta-text/60 block mb-1">行高</label>
          <input type="number" step={0.1} min={1} max={3} value={s.lineHeight} onChange={(e) => set({ lineHeight: Number(e.target.value) })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1" />
        </div>
        <div>
          <label className="text-[10px] text-zeta-text/60 block mb-1">字距(px)</label>
          <input type="number" step={0.5} value={s.letterSpacing} onChange={(e) => set({ letterSpacing: Number(e.target.value) })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1" />
        </div>
        <div>
          <label className="text-[10px] text-zeta-text/60 block mb-1">段落間距(px)</label>
          <input type="number" min={0} value={s.paragraphSpacing} onChange={(e) => set({ paragraphSpacing: Number(e.target.value) })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1" />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-zeta-text/60 block mb-1">對齊方式</label>
        <div className="flex gap-1">
          <button onClick={() => set({ textAlign: 'left' })} className={`flex-1 p-1.5 rounded-md border flex items-center justify-center ${s.textAlign === 'left' ? 'border-zeta-gold bg-zeta-gold/10' : 'border-zeta-bg'}`}><AlignLeft size={13} /></button>
          <button onClick={() => set({ textAlign: 'center' })} className={`flex-1 p-1.5 rounded-md border flex items-center justify-center ${s.textAlign === 'center' ? 'border-zeta-gold bg-zeta-gold/10' : 'border-zeta-bg'}`}><AlignCenter size={13} /></button>
          <button onClick={() => set({ textAlign: 'right' })} className={`flex-1 p-1.5 rounded-md border flex items-center justify-center ${s.textAlign === 'right' ? 'border-zeta-gold bg-zeta-gold/10' : 'border-zeta-bg'}`}><AlignRight size={13} /></button>
        </div>
      </div>
    </div>
  )
}
