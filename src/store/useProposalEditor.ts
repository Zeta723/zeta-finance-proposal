import { useCallback, useEffect, useRef, useState } from 'react'
import type { Proposal, ProposalSlide, SlideData, SlideType } from '../types'
import { proposalStorage } from '../services/storageService'
import { useUndoRedo } from '../hooks/useUndoRedo'
import { createSlide } from '../data/slideDefaults'
import { newId, nowISO } from '../services/idGenerator'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const AUTOSAVE_DELAY_MS = 900

export function useProposalEditor(initial: Proposal) {
  const { state: proposal, setState: setProposal, undo, redo, canUndo, canRedo } = useUndoRedo<Proposal>(initial)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [activeSlideId, setActiveSlideId] = useState<string | null>(initial.slides[0]?.id ?? null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persist = useCallback((p: Proposal) => {
    setSaveStatus('saving')
    try {
      proposalStorage.saveProposal(p)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [])

  // Autosave：內容變更後 debounce 儲存
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => persist(proposal), AUTOSAVE_DELAY_MS)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal])

  const saveNow = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    persist(proposal)
  }, [persist, proposal])

  const activeSlide = proposal.slides.find((s) => s.id === activeSlideId) ?? null

  const updateClient = (patch: Partial<Proposal['client']>) => {
    setProposal((p) => ({ ...p, client: { ...p.client, ...patch }, updatedAt: nowISO() }))
  }

  const updateCurrencySettings = (settings: Proposal['currencySettings']) => {
    setProposal((p) => ({ ...p, currencySettings: settings, updatedAt: nowISO() }))
  }

  const updateCategoryId = (categoryId: string | undefined) => {
    setProposal((p) => ({ ...p, categoryId, updatedAt: nowISO() }))
  }

  const addSlide = (type: SlideType, layoutId?: string) => {
    setProposal((p) => {
      const slide = createSlide(type, p.slides.length, layoutId)
      setActiveSlideId(slide.id)
      return { ...p, slides: [...p.slides, slide], updatedAt: nowISO() }
    })
  }

  const updateSlideData = (slideId: string, data: SlideData) => {
    setProposal((p) => ({
      ...p,
      slides: p.slides.map((s) => (s.id === slideId ? { ...s, data, updatedAt: nowISO() } : s)),
      updatedAt: nowISO()
    }))
  }

  const updateSlideLayout = (slideId: string, layoutId: string) => {
    setProposal((p) => ({
      ...p,
      slides: p.slides.map((s) => (s.id === slideId ? { ...s, layoutId, updatedAt: nowISO() } : s)),
      updatedAt: nowISO()
    }))
  }

  const updateSlideTheme = (slideId: string, slideTheme: string) => {
    setProposal((p) => ({
      ...p,
      slides: p.slides.map((s) => (s.id === slideId ? { ...s, slideTheme, updatedAt: nowISO() } : s)),
      updatedAt: nowISO()
    }))
  }

  const duplicateSlide = (slideId: string) => {
    setProposal((p) => {
      const idx = p.slides.findIndex((s) => s.id === slideId)
      if (idx === -1) return p
      const original = p.slides[idx]
      const now = nowISO()
      const copy: ProposalSlide = { ...original, id: newId(), createdAt: now, updatedAt: now }
      const slides = [...p.slides]
      slides.splice(idx + 1, 0, copy)
      const reordered = slides.map((s, i) => ({ ...s, order: i }))
      setActiveSlideId(copy.id)
      return { ...p, slides: reordered, updatedAt: now }
    })
  }

  const deleteSlide = (slideId: string) => {
    setProposal((p) => {
      const slides = p.slides.filter((s) => s.id !== slideId).map((s, i) => ({ ...s, order: i }))
      if (activeSlideId === slideId) setActiveSlideId(slides[0]?.id ?? null)
      return { ...p, slides, updatedAt: nowISO() }
    })
  }

  const toggleHideSlide = (slideId: string) => {
    setProposal((p) => ({
      ...p,
      slides: p.slides.map((s) => (s.id === slideId ? { ...s, hidden: !s.hidden, updatedAt: nowISO() } : s)),
      updatedAt: nowISO()
    }))
  }

  const reorderSlides = (orderedIds: string[]) => {
    setProposal((p) => {
      const map = new Map(p.slides.map((s) => [s.id, s]))
      const slides = orderedIds.map((id, i) => ({ ...map.get(id)!, order: i }))
      return { ...p, slides, updatedAt: nowISO() }
    })
  }

  return {
    proposal,
    saveStatus,
    activeSlide,
    activeSlideId,
    setActiveSlideId,
    updateClient,
    updateCurrencySettings,
    updateCategoryId,
    addSlide,
    updateSlideData,
    updateSlideLayout,
    updateSlideTheme,
    duplicateSlide,
    deleteSlide,
    toggleHideSlide,
    reorderSlides,
    undo,
    redo,
    canUndo,
    canRedo,
    saveNow
  }
}
