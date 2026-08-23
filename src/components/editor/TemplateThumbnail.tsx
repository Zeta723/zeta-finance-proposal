import React, { useMemo } from 'react'
import type { SlideType } from '../../types'
import { createSlide } from '../../data/slideDefaults'
import { SlideRenderer } from '../preview/SlideRenderer'

interface Props {
  type: SlideType
  layoutId: string
  defaultTheme: string
}

/**
 * 模板縮圖：直接用真正的 SlideRenderer + 該頁面類型的預設範例資料渲染出縮小版畫面，
 * 確保縮圖與實際版面 100% 一致（不是通用圖示），並且未來新增/修改版型時縮圖會自動同步更新。
 */
export function TemplateThumbnail({ type, layoutId, defaultTheme }: Props) {
  const sampleSlide = useMemo(() => createSlide(type, 0, layoutId), [type, layoutId])

  return (
    <div className="w-full aspect-video overflow-hidden rounded-md bg-zeta-bg/40 pointer-events-none select-none">
      <div style={{ width: '400%', height: '400%', transform: 'scale(0.25)', transformOrigin: 'top left' }}>
        <SlideRenderer slide={sampleSlide} defaultTheme={defaultTheme as any} />
      </div>
    </div>
  )
}
