import React, { useRef } from 'react'
import { AlignCenter, AlignEndHorizontal, AlignEndVertical, AlignStartHorizontal, AlignStartVertical, ImagePlus, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react'
import type { ImageAsset } from '../../types'
import { fileToCompressedImageAsset } from '../../services/imageService'
import { useToast } from '../common/Toast'

interface Props {
  label: string
  value?: ImageAsset
  onChange: (asset: ImageAsset | undefined) => void
  shape?: 'rounded' | 'circle'
  /** 是否顯示「完整顯示／填滿畫面」切換（用於背景圖片這類滿版圖片） */
  showFitToggle?: boolean
}

const POSITION_X_OPTIONS: { value: NonNullable<ImageAsset['positionX']>; icon: typeof AlignStartVertical; label: string }[] = [
  { value: 'left', icon: AlignStartVertical, label: '靠左' },
  { value: 'center', icon: AlignCenter, label: '水平置中' },
  { value: 'right', icon: AlignEndVertical, label: '靠右' }
]
const POSITION_Y_OPTIONS: { value: NonNullable<ImageAsset['positionY']>; icon: typeof AlignStartHorizontal; label: string }[] = [
  { value: 'top', icon: AlignStartHorizontal, label: '靠上' },
  { value: 'center', icon: AlignCenter, label: '垂直置中' },
  { value: 'bottom', icon: AlignEndHorizontal, label: '靠下' }
]

/**
 * 共用圖片上傳欄位。上傳成功後才顯示縮放與位置控制項（沒有圖片時不顯示，
 * 避免介面顯得雜亂）。每個欄位使用的 ImageAsset 都是各自獨立的物件
 * （d.logo / d.coverPhoto / d.backgroundImage / ... 各自分開儲存），
 * 所以在這裡調整縮放／位置只會影響「這一個」欄位，不會影響同一頁其他圖片。
 */
export function ImageUploadField({ label, value, onChange, shape = 'rounded', showFitToggle }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('請上傳圖片檔案', 'error')
      return
    }
    try {
      const { asset, warning } = await fileToCompressedImageAsset(file)
      onChange({ ...asset, scale: 100, positionX: 'center', positionY: 'center' })
      if (warning) showToast(warning, 'warning')
    } catch {
      showToast('圖片處理失敗，請換一張圖片再試一次。', 'error')
    }
  }

  const set = (patch: Partial<ImageAsset>) => {
    if (!value) return
    onChange({ ...value, ...patch })
  }
  const scale = value?.scale ?? 100

  return (
    <div>
      <label className="text-xs font-medium text-zeta-navy mb-1 block">{label}</label>
      <div className="flex items-center gap-3">
        {value?.dataUrl ? (
          <div className="w-16 h-16 rounded-lg border border-zeta-cream overflow-hidden bg-zeta-bg/30 flex items-center justify-center">
            <img
              src={value.dataUrl}
              className={`w-full h-full object-cover ${shape === 'circle' ? 'rounded-full' : ''}`}
              style={{ transform: `scale(${scale / 100})`, transformOrigin: `${value.positionX ?? 'center'} ${value.positionY ?? 'center'}` }}
              alt={label}
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-zeta-bg flex items-center justify-center text-zeta-text/30">
            <ImagePlus size={20} />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-full border border-zeta-navy/20 text-zeta-navy hover:bg-zeta-bg"
          >
            {value?.dataUrl ? '更換圖片' : '上傳圖片'}
          </button>
          {value?.dataUrl && (
            <button onClick={() => onChange(undefined)} className="text-xs px-3 py-1.5 rounded-full text-zeta-danger hover:bg-zeta-danger/10 flex items-center gap-1">
              <Trash2 size={12} /> 刪除圖片
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

      {/* 上傳成功後才顯示縮放與位置控制項，避免沒有圖片時介面顯得雜亂 */}
      {value?.dataUrl && (
        <div className="mt-2 border border-zeta-bg rounded-lg p-2.5 space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zeta-text/60">圖片大小</span>
              <span className="text-[10px] text-zeta-navy font-medium">{scale}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => set({ scale: Math.max(20, scale - 10) })} className="p-1 rounded-md border border-zeta-bg text-zeta-text/60 hover:bg-zeta-bg shrink-0">
                <Minus size={12} />
              </button>
              <input
                type="range"
                min={20}
                max={300}
                step={5}
                value={scale}
                onChange={(e) => set({ scale: Number(e.target.value) })}
                className="flex-1"
              />
              <button onClick={() => set({ scale: Math.min(300, scale + 10) })} className="p-1 rounded-md border border-zeta-bg text-zeta-text/60 hover:bg-zeta-bg shrink-0">
                <Plus size={12} />
              </button>
            </div>
          </div>

          {showFitToggle && (
            <div>
              <span className="text-[10px] text-zeta-text/60 block mb-1">背景顯示方式</span>
              <div className="flex gap-1">
                <button
                  onClick={() => set({ fit: 'contain' })}
                  className={`flex-1 text-[10.5px] px-2 py-1 rounded-md border ${value.fit !== 'cover' ? 'border-zeta-gold bg-zeta-gold/10 text-zeta-navy' : 'border-zeta-bg text-zeta-text/60'}`}
                >
                  完整顯示
                </button>
                <button
                  onClick={() => set({ fit: 'cover' })}
                  className={`flex-1 text-[10.5px] px-2 py-1 rounded-md border ${value.fit === 'cover' ? 'border-zeta-gold bg-zeta-gold/10 text-zeta-navy' : 'border-zeta-bg text-zeta-text/60'}`}
                >
                  填滿畫面
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-zeta-text/60 block mb-1">水平位置</span>
              <div className="flex gap-1">
                {POSITION_X_OPTIONS.map(({ value: v, icon: Icon, label: l }) => (
                  <button
                    key={v}
                    title={l}
                    onClick={() => set({ positionX: v })}
                    className={`flex-1 p-1.5 rounded-md border flex items-center justify-center ${(value.positionX ?? 'center') === v ? 'border-zeta-gold bg-zeta-gold/10' : 'border-zeta-bg'}`}
                  >
                    <Icon size={13} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zeta-text/60 block mb-1">垂直位置</span>
              <div className="flex gap-1">
                {POSITION_Y_OPTIONS.map(({ value: v, icon: Icon, label: l }) => (
                  <button
                    key={v}
                    title={l}
                    onClick={() => set({ positionY: v })}
                    className={`flex-1 p-1.5 rounded-md border flex items-center justify-center ${(value.positionY ?? 'center') === v ? 'border-zeta-gold bg-zeta-gold/10' : 'border-zeta-bg'}`}
                  >
                    <Icon size={13} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => set({ scale: 100, positionX: 'center', positionY: 'center' })}
            className="w-full flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-md border border-dashed border-zeta-bg text-zeta-text/50 hover:bg-zeta-bg"
          >
            <RotateCcw size={11} /> 還原預設（100%、置中）
          </button>
        </div>
      )}
    </div>
  )
}
