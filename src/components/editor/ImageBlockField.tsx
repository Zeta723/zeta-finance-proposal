import React, { useRef } from 'react'
import { Lock, LockOpen, RotateCcw, Trash2, Upload } from 'lucide-react'
import type { ImageBlock } from '../../types'
import { fileToCompressedImageAsset, loadImageNaturalSize } from '../../services/imageService'
import { defaultImageBlock } from '../../data/slideDefaults'
import { useToast } from '../common/Toast'

interface Props {
  block: ImageBlock | undefined
  onChange: (block: ImageBlock | undefined) => void
}

function NumField({ label, value, onChange, min = 0, max = 100, step = 1, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <div>
      <label className="text-[10px] text-zeta-text/60 block mb-0.5">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={Math.round(value * 10) / 10}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1 focus:outline-none focus:border-zeta-gold"
        />
        {suffix && <span className="text-[10px] text-zeta-text/40 shrink-0">{suffix}</span>}
      </div>
    </div>
  )
}

/** 圖片區塊編輯器：上傳／更換／刪除，以及 X/Y/寬/高/顯示模式/透明度/圓角/比例鎖定 的精確數值控制 */
export function ImageBlockField({ block, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const [loading, setLoading] = React.useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const supported = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (file.type === 'image/heic' || file.type === 'image/heif' || /\.heic$|\.heif$/i.test(file.name)) {
      showToast('目前瀏覽器不支援直接顯示 HEIC/HEIF 格式，請先轉存為 JPG 或 PNG 再上傳。', 'error')
      return
    }
    if (!supported.includes(file.type)) {
      showToast('請上傳 JPG、PNG 或 WebP 格式的圖片。', 'error')
      return
    }
    setLoading(true)
    try {
      const { asset, warning } = await fileToCompressedImageAsset(file)
      const natural = await loadImageNaturalSize(asset.dataUrl).catch(() => undefined)
      const ratio = natural ? natural.width / natural.height : undefined
      const next = defaultImageBlock(asset.dataUrl, ratio)
      if (ratio) {
        // 依原始比例調整預設高度，避免一開始就明顯變形
        next.height = Math.min(90, next.width / ratio)
      }
      onChange(next)
      if (warning) showToast(warning, 'warning')
    } catch {
      showToast('圖片載入失敗，請確認檔案是否損毀或換一張圖片再試一次。', 'error')
    } finally {
      setLoading(false)
    }
  }

  const set = (patch: Partial<ImageBlock>) => {
    if (!block) return
    onChange({ ...block, ...patch })
  }

  const setWidthKeepRatio = (width: number) => {
    if (!block) return
    if (block.aspectRatioLocked && block.naturalAspectRatio) {
      onChange({ ...block, width, height: width / block.naturalAspectRatio })
    } else {
      onChange({ ...block, width })
    }
  }
  const setHeightKeepRatio = (height: number) => {
    if (!block) return
    if (block.aspectRatioLocked && block.naturalAspectRatio) {
      onChange({ ...block, height, width: height * block.naturalAspectRatio })
    } else {
      onChange({ ...block, height })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-zeta-navy/20 text-zeta-navy hover:bg-zeta-bg disabled:opacity-50"
        >
          <Upload size={13} /> {loading ? '處理中…' : block ? '更換圖片' : '上傳圖片'}
        </button>
        {block && (
          <button onClick={() => onChange(undefined)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-zeta-danger hover:bg-zeta-danger/10">
            <Trash2 size={13} /> 刪除
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

      {block && (
        <div className="border border-zeta-bg rounded-lg p-2.5 space-y-2">
          <div className="flex gap-2">
            <img src={block.src} className="w-16 h-16 object-cover rounded-lg border border-zeta-bg shrink-0" alt="" />
            <div className="flex-1 grid grid-cols-2 gap-1.5">
              <NumField label="X 座標" value={block.x} onChange={(v) => set({ x: v })} min={0} max={100} suffix="%" />
              <NumField label="Y 座標" value={block.y} onChange={(v) => set({ y: v })} min={0} max={100} suffix="%" />
              <NumField label="寬度" value={block.width} onChange={setWidthKeepRatio} min={5} max={100} suffix="%" />
              <NumField label="高度" value={block.height} onChange={setHeightKeepRatio} min={5} max={100} suffix="%" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zeta-text/60">鎖定長寬比例</span>
            <button
              onClick={() => set({ aspectRatioLocked: !block.aspectRatioLocked })}
              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full ${block.aspectRatioLocked ? 'bg-zeta-gold/20 text-zeta-navy' : 'bg-zeta-bg text-zeta-text/50'}`}
            >
              {block.aspectRatioLocked ? <Lock size={11} /> : <LockOpen size={11} />}
              {block.aspectRatioLocked ? '已鎖定' : '未鎖定'}
            </button>
          </div>

          <div>
            <label className="text-[10px] text-zeta-text/60 block mb-1">顯示模式</label>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  ['contain', '完整顯示'],
                  ['cover', '填滿裁切'],
                  ['original', '原始比例'],
                  ['free', '自由調整']
                ] as [ImageBlock['objectFit'], string][]
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => set({ objectFit: mode })}
                  className={`text-[9.5px] px-1 py-1.5 rounded-md border ${block.objectFit === mode ? 'border-zeta-gold bg-zeta-gold/10 text-zeta-navy' : 'border-zeta-bg text-zeta-text/60'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <NumField label="透明度" value={block.opacity} onChange={(v) => set({ opacity: Math.min(100, Math.max(0, v)) })} min={0} max={100} suffix="%" />
            <NumField label="圓角" value={block.borderRadius} onChange={(v) => set({ borderRadius: Math.max(0, v) })} min={0} max={80} suffix="px" />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => set({ x: 4, y: 18, width: 92, height: 20 })}
              className="text-[10px] px-2 py-1 rounded-md border border-zeta-bg text-zeta-text/60 hover:bg-zeta-bg flex items-center justify-center gap-1"
            >
              靠上
            </button>
            <button
              onClick={() => set({ x: 4, y: 78, width: 92, height: 18 })}
              className="text-[10px] px-2 py-1 rounded-md border border-zeta-bg text-zeta-text/60 hover:bg-zeta-bg"
            >
              靠下
            </button>
            <button
              onClick={() => set({ x: 4, y: 18, width: 46, height: 76 })}
              className="text-[10px] px-2 py-1 rounded-md border border-zeta-bg text-zeta-text/60 hover:bg-zeta-bg"
            >
              靠左
            </button>
            <button
              onClick={() => set({ x: 50, y: 18, width: 46, height: 76 })}
              className="text-[10px] px-2 py-1 rounded-md border border-zeta-bg text-zeta-text/60 hover:bg-zeta-bg"
            >
              靠右
            </button>
          </div>

          <button
            onClick={() => {
              const ratio = block.naturalAspectRatio
              const fresh = defaultImageBlock(block.src, ratio)
              if (ratio) fresh.height = Math.min(90, fresh.width / ratio)
              onChange(fresh)
            }}
            className="w-full flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg border border-dashed border-zeta-bg text-zeta-text/60 hover:bg-zeta-bg"
          >
            <RotateCcw size={12} /> 還原圖片位置與大小
          </button>
        </div>
      )}
    </div>
  )
}
