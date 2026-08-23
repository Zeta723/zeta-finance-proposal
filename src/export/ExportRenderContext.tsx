import { createContext, useContext } from 'react'

/**
 * 標記目前是否處於「匯出用離螢幕渲染」狀態。
 * true 時，圖表元件（Recharts）應關閉動畫（isAnimationActive=false），
 * 確保 PDF／截圖匯出時擷取到的是動畫結束後的最終畫面，而不是動畫過程中的某一幀。
 */
export const ExportRenderContext = createContext(false)

export function useIsExportRender(): boolean {
  return useContext(ExportRenderContext)
}
