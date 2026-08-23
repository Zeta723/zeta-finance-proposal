import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { LAYOUTS_BY_TYPE, SLIDE_TYPE_LABELS } from '../../data/slideDefaults'
import type { SlideType } from '../../types'
import { TemplateThumbnail } from './TemplateThumbnail'
import { Check } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (type: SlideType, layoutId: string) => void
  defaultTheme: string
}

const TYPES: SlideType[] = ['cover', 'assetAllocation', 'beforeAfter', 'accountAllocation', 'recommendation', 'conclusion', 'custom']

/** 新增頁面流程：1. 選擇頁面類型 2. 查看版型縮圖與說明 3. 選擇版型 4. 加入提案 */
export function NewSlideModal({ open, onClose, onConfirm, defaultTheme }: Props) {
  const [type, setType] = useState<SlideType>('custom')
  const [layoutId, setLayoutId] = useState(LAYOUTS_BY_TYPE['custom'][0].id)

  const selectType = (t: SlideType) => {
    setType(t)
    setLayoutId(LAYOUTS_BY_TYPE[t][0].id)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="新增頁面"
      maxWidthClass="max-w-3xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm border border-zeta-bg">取消</button>
          <button
            onClick={() => { onConfirm(type, layoutId); onClose() }}
            className="px-4 py-2 rounded-full text-sm bg-zeta-navy text-white hover:opacity-90"
          >
            加入提案
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-xs font-medium text-zeta-navy mb-2">1. 選擇頁面類型</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => selectType(t)}
                className={`text-sm text-left px-3 py-2 rounded-lg border ${type === t ? 'border-zeta-gold bg-zeta-gold/10 text-zeta-navy' : 'border-zeta-bg text-zeta-text/70 hover:border-zeta-cream'}`}
              >
                {SLIDE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-zeta-navy mb-2">2. 選擇版型（縮圖為實際版面預覽）</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LAYOUTS_BY_TYPE[type].map((l) => {
              const active = layoutId === l.id
              return (
                <button
                  key={l.id}
                  onClick={() => setLayoutId(l.id)}
                  className={`text-left rounded-lg border-2 p-2 ${active ? 'border-zeta-gold bg-zeta-gold/10' : 'border-zeta-bg hover:border-zeta-cream'}`}
                >
                  <TemplateThumbnail type={type} layoutId={l.id} defaultTheme={defaultTheme} />
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="text-xs font-semibold text-zeta-navy">{l.name}</div>
                    {active && <Check size={12} className="text-zeta-gold" />}
                  </div>
                  <div className="text-[10px] text-zeta-text/60 mt-0.5 leading-tight">{l.description}</div>
                  <div className="text-[10px] text-zeta-text/40 mt-1">適用：{l.useCase}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}
