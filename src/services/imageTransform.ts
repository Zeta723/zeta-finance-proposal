import type React from 'react'
import type { ImageAsset } from '../types'

/**
 * 依 ImageAsset 的 scale／positionX／positionY 算出 CSS transform 樣式。
 * 用 transform: scale() 而不是改變版面尺寸，這樣調整大小不會推擠其他內容，
 * 也不需要重新計算容器的版面配置；每張圖片的設定都保存在自己的 ImageAsset
 * 物件裡，彼此完全獨立。
 */
export function imageTransformStyle(asset: Pick<ImageAsset, 'scale' | 'positionX' | 'positionY'> | undefined): React.CSSProperties {
  const scale = (asset?.scale ?? 100) / 100
  const originX = asset?.positionX === 'left' ? '0%' : asset?.positionX === 'right' ? '100%' : '50%'
  const originY = asset?.positionY === 'top' ? '0%' : asset?.positionY === 'bottom' ? '100%' : '50%'
  return {
    transform: `scale(${scale})`,
    transformOrigin: `${originX} ${originY}`
  }
}

/** object-position 字串，用於填滿型（cover/背景）圖片依位置錨點裁切對齊 */
export function imageObjectPosition(asset: Pick<ImageAsset, 'positionX' | 'positionY'> | undefined): string {
  const x = asset?.positionX ?? 'center'
  const y = asset?.positionY ?? 'center'
  return `${x} ${y}`
}
