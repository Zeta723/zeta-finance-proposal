import React, { useRef } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import type { ImageAsset } from '../../types'
import { fileToCompressedImageAsset } from '../../services/imageService'
import { useToast } from '../common/Toast'

interface Props {
  label: string
  value?: ImageAsset
  onChange: (asset: ImageAsset | undefined) => void
  shape?: 'rounded' | 'circle'
}

export function ImageUploadField({ label, value, onChange, shape = 'rounded' }: Props) {
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
      onChange(asset)
      if (warning) showToast(warning, 'warning')
    } catch {
      showToast('圖片處理失敗，請換一張圖片再試一次。', 'error')
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-zeta-navy mb-1 block">{label}</label>
      <div className="flex items-center gap-3">
        {value?.dataUrl ? (
          <img
            src={value.dataUrl}
            className={`w-16 h-16 object-cover border border-zeta-cream ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
            alt={label}
          />
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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
