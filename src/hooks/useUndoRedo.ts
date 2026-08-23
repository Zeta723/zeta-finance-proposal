import { useCallback, useRef, useState } from 'react'

const HISTORY_LIMIT = 20

/**
 * 通用復原/重做 hook。用淺層快照方式保留最近 20 筆歷史紀錄，
 * 涵蓋文字修改、頁面排序、刪除頁面、更換版型等操作。
 */
export function useUndoRedo<T>(initial: T) {
  const [state, setStateRaw] = useState<T>(initial)
  const past = useRef<T[]>([])
  const future = useRef<T[]>([])

  const setState = useCallback((updater: T | ((prev: T) => T), recordHistory = true) => {
    setStateRaw((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater
      if (recordHistory) {
        past.current = [...past.current, prev].slice(-HISTORY_LIMIT)
        future.current = []
      }
      return next
    })
  }, [])

  const undo = useCallback(() => {
    setStateRaw((prev) => {
      const last = past.current.pop()
      if (last === undefined) return prev
      future.current = [prev, ...future.current].slice(0, HISTORY_LIMIT)
      return last
    })
  }, [])

  const redo = useCallback(() => {
    setStateRaw((prev) => {
      const [next, ...rest] = future.current
      if (next === undefined) return prev
      future.current = rest
      past.current = [...past.current, prev].slice(-HISTORY_LIMIT)
      return next
    })
  }, [])

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0
  }
}
