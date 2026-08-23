import type { ImageAsset } from '../types'

/**
 * 圖片服務：處理上傳、壓縮與轉 base64。
 * localStorage 容量有限（多數瀏覽器約 5-10MB），所以圖片上傳時一律壓縮到
 * 合理的最大邊長與 JPEG 品質，避免單一提案就把容量塞爆。
 */
const MAX_DIMENSION = 1280
const JPEG_QUALITY = 0.72
/** 單張圖片壓縮後如果還是超過這個大小，提示使用者 */
const WARN_SIZE_BYTES = 600 * 1024

export async function fileToCompressedImageAsset(file: File): Promise<{ asset: ImageAsset; warning?: string }> {
  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImage(dataUrl)

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { asset: { dataUrl, sizeBytes: file.size } }
  }
  ctx.drawImage(img, 0, 0, width, height)
  const compressedDataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  const sizeBytes = estimateBase64Bytes(compressedDataUrl)

  const asset: ImageAsset = { dataUrl: compressedDataUrl, sizeBytes, fit: 'cover', shape: 'rounded' }
  const warning = sizeBytes > WARN_SIZE_BYTES ? '圖片壓縮後仍偏大，建議使用較小的圖片以避免儲存失敗。' : undefined
  return { asset, warning }
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('READ_FAILED'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'))
    img.src = src
  })
}

function estimateBase64Bytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.round((base64.length * 3) / 4)
}

export async function loadImageNaturalSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'))
    img.src = dataUrl
  })
}
/** 粗估目前 localStorage 已使用容量（近似值，用於容量提示） */
export function estimateLocalStorageUsageBytes(): number {
  let total = 0
  for (const key in localStorage) {
    if (!Object.prototype.hasOwnProperty.call(localStorage, key)) continue
    total += (localStorage.getItem(key)?.length ?? 0) + key.length
  }
  return total * 2 // UTF-16
}
