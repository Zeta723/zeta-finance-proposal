import React from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react'
import type { ProposalSlide } from '../../types'
import { SLIDE_TYPE_LABELS, LAYOUTS_BY_TYPE } from '../../data/slideDefaults'
import { SlideRenderer } from '../preview/SlideRenderer'

interface Props {
  slides: ProposalSlide[]
  activeSlideId: string | null
  defaultTheme: string
  onSelect: (id: string) => void
  onReorder: (orderedIds: string[]) => void
  onDuplicate: (id: string) => void
  onToggleHide: (id: string) => void
  onDelete: (id: string) => void
  onAddSlide: () => void
}

export function SlideListPanel({ slides, activeSlideId, defaultTheme, onSelect, onReorder, onDuplicate, onToggleHide, onDelete, onAddSlide }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const ordered = [...slides].sort((a, b) => a.order - b.order)

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = ordered.findIndex((s) => s.id === active.id)
    const newIndex = ordered.findIndex((s) => s.id === over.id)
    onReorder(arrayMove(ordered, oldIndex, newIndex).map((s) => s.id))
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-zeta-bg">
      <div className="px-3 py-3 border-b border-zeta-bg flex items-center justify-between">
        <span className="text-sm font-semibold text-zeta-navy">頁面列表（{slides.length}）</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ordered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {ordered.map((slide, idx) => (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                index={idx}
                active={slide.id === activeSlideId}
                defaultTheme={defaultTheme}
                onSelect={() => onSelect(slide.id)}
                onDuplicate={() => onDuplicate(slide.id)}
                onToggleHide={() => onToggleHide(slide.id)}
                onDelete={() => onDelete(slide.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="p-2 border-t border-zeta-bg">
        <button onClick={onAddSlide} className="w-full flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg bg-zeta-navy text-white hover:opacity-90">
          <Plus size={15} /> 新增頁面
        </button>
      </div>
    </div>
  )
}

function SortableSlideItem({
  slide, index, active, defaultTheme, onSelect, onDuplicate, onToggleHide, onDelete
}: {
  slide: ProposalSlide
  index: number
  active: boolean
  defaultTheme: string
  onSelect: () => void
  onDuplicate: () => void
  onToggleHide: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id })
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : slide.hidden ? 0.5 : 1 }
  const layoutName = LAYOUTS_BY_TYPE[slide.type].find((l) => l.id === slide.layoutId)?.name ?? slide.layoutId

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`rounded-lg border cursor-pointer overflow-hidden ${active ? 'border-zeta-gold ring-1 ring-zeta-gold' : 'border-zeta-bg hover:border-zeta-cream'}`}
    >
      <div className="flex items-center gap-1 px-1.5 py-1 bg-zeta-bg/50">
        <button {...attributes} {...listeners} className="cursor-grab text-zeta-text/40 shrink-0" onClick={(e) => e.stopPropagation()}>
          <GripVertical size={13} />
        </button>
        <span className="text-[10px] text-zeta-text/50 shrink-0">{index + 1}</span>
        <span className="text-[11px] text-zeta-navy font-medium truncate flex-1">{SLIDE_TYPE_LABELS[slide.type]}</span>
        <button onClick={(e) => { e.stopPropagation(); onToggleHide() }} className="text-zeta-text/40 hover:text-zeta-navy shrink-0" title={slide.hidden ? '顯示頁面' : '隱藏頁面'}>
          {slide.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate() }} className="text-zeta-text/40 hover:text-zeta-navy shrink-0" title="複製頁面">
          <Copy size={13} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="text-zeta-danger/60 hover:text-zeta-danger shrink-0" title="刪除頁面">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="aspect-video w-full pointer-events-none scale-100 origin-top-left overflow-hidden bg-zeta-bg/30">
        <div style={{ width: '400%', height: '400%', transform: 'scale(0.25)', transformOrigin: 'top left' }}>
          <SlideRenderer slide={slide} defaultTheme={defaultTheme as any} />
        </div>
      </div>
      <div className="px-1.5 py-1 text-[10px] text-zeta-text/50 truncate">{layoutName}</div>
    </div>
  )
}
