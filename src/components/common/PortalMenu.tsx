import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  anchorRef: React.RefObject<HTMLElement>
  onClose: () => void
  children: React.ReactNode
  /** 選單寬度（px），用於計算是否超出視窗右緣 */
  width?: number
}

/**
 * 用 Portal 把選單直接掛到 document.body，脫離卡片的 overflow:hidden／z-index
 * 限制（這正是先前選單被卡片截斷的根本原因：選單是卡片內的 absolute 定位元素，
 * 而卡片本身為了讓縮圖圓角正確顯示而設定了 overflow-hidden，兩者衝突）。
 *
 * 位置固定用 position:fixed 依觸發按鈕的實際畫面座標計算：
 * - 靠近畫面底部時自動往上展開（flip）。
 * - 超出視窗高度時選單內部可捲動（max-height + overflow-y-auto）。
 * - 水平方向會夾在視窗範圍內，不會超出右緣或左緣。
 */
export function PortalMenu({ open, anchorRef, onClose, children, width = 176 }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 })

  useLayoutEffect(() => {
    if (!open) return
    const anchor = anchorRef.current
    if (!anchor) return

    const compute = () => {
      const rect = anchor.getBoundingClientRect()
      const viewportH = window.innerHeight
      const viewportW = window.innerWidth
      const margin = 8

      const spaceBelow = viewportH - rect.bottom - margin
      const spaceAbove = rect.top - margin
      const openUpward = spaceBelow < 200 && spaceAbove > spaceBelow

      const maxHeight = Math.max(120, (openUpward ? spaceAbove : spaceBelow))
      let left = rect.right - width
      left = Math.min(Math.max(margin, left), viewportW - width - margin)

      const next: React.CSSProperties = {
        position: 'fixed',
        left,
        width,
        maxHeight,
        overflowY: 'auto',
        opacity: 1,
        zIndex: 1000
      }
      if (openUpward) next.bottom = viewportH - rect.top + 4
      else next.top = rect.bottom + 4

      setStyle(next)
    }

    compute()
    window.addEventListener('resize', compute)
    window.addEventListener('scroll', compute, true)
    return () => {
      window.removeEventListener('resize', compute)
      window.removeEventListener('scroll', compute, true)
    }
  }, [open, anchorRef, width])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return
      if (anchorRef.current?.contains(e.target as Node)) return
      onClose()
    }
    // 用 timeout 避免觸發按鈕自己的 onClick 立刻又把選單關掉
    const t = setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open, onClose, anchorRef])

  if (!open) return null

  return createPortal(
    <div ref={menuRef} style={style} className="bg-white rounded-lg shadow-soft border border-zeta-bg py-1 text-sm">
      {children}
    </div>,
    document.body
  )
}
