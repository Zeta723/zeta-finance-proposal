import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { FontSize } from './FontSizeExtension'
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Eraser,
  Sparkles,
  Minus,
  Plus
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { RichTextContent } from '../../types'
import { useToast } from '../common/Toast'

export const BRAND_COLOR_SWATCHES: { label: string; value: string }[] = [
  { label: '深藍色', value: '#19324A' },
  { label: '品牌金', value: '#D3AF37' },
  { label: '奶茶色', value: '#E8DCCB' },
  { label: '深灰色', value: '#333333' },
  { label: '紅色警示', value: '#B54A4A' },
  { label: '綠色正向', value: '#4F7965' },
  { label: '白色', value: '#FFFFFF' }
]

const FONT_SIZE_PRESETS = [16, 20, 24, 28, 32, 36, 40]

interface RichTextEditorProps {
  value: RichTextContent
  onChange: (value: RichTextContent) => void
  placeholder?: string
  editable?: boolean
  minimal?: boolean
}

/**
 * 結構化 Rich Text 編輯器（Tiptap）。
 * value/onChange 使用 Tiptap JSON，之後可安全轉換成 PptxGenJS 的 text runs。
 *
 * 重要（局部格式修正）：所有工具列按鈕都必須在 onMouseDown 時呼叫
 * preventDefault()，否則瀏覽器會在 click 事件觸發前，先把 contentEditable
 * 的焦點/選取範圍搶走或重置，導致格式指令套用範圍不正確（例如整段文字都
 * 被套上樣式，而不是只有選取的那一小段）。每個格式指令也都改成單一原子
 * chain 呼叫（一次 .run()），避免像舊版那樣建立了 chain 卻忘記 .run()
 * 而完全沒有作用，或是分成好幾個獨立 chain 各自套用、彼此互相覆蓋。
 */
export function RichTextEditor({ value, onChange, placeholder, editable = true, minimal = false }: RichTextEditorProps) {
  const { showToast } = useToast()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['paragraph'] })
    ],
    content: value ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editable,
    onUpdate: ({ editor }) => onChange(editor.getJSON())
  })

  React.useEffect(() => {
    if (!editor) return
    const current = JSON.stringify(editor.getJSON())
    const incoming = JSON.stringify(value ?? { type: 'doc', content: [{ type: 'paragraph' }] })
    if (current !== incoming) editor.commands.setContent(value ?? { type: 'doc', content: [{ type: 'paragraph' }] }, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  /** 設為重點：只套用在目前選取的文字；沒有選取任何文字時提示使用者，不會整段套用。 */
  const applyHighlightPreset = () => {
    if (editor.state.selection.empty) {
      showToast('請先選取要標示的文字。', 'warning')
      return
    }
    editor.chain().focus().setColor('#D3AF37').setBold().run()
  }

  const clearSelectionFormatting = () => {
    if (editor.state.selection.empty) {
      showToast('請先選取要清除格式的文字。', 'warning')
      return
    }
    editor.chain().focus().unsetAllMarks().run()
  }

  const currentFontSize = (editor.getAttributes('textStyle').fontSize as number | undefined) ?? null

  const setFontSize = (size: number) => {
    if (editor.state.selection.empty) {
      showToast('請先選取要調整大小的文字。', 'warning')
      return
    }
    editor.chain().focus().setFontSize(size).run()
  }

  const bumpFontSize = (delta: number) => {
    if (editor.state.selection.empty) {
      showToast('請先選取要調整大小的文字。', 'warning')
      return
    }
    const base = currentFontSize ?? 16
    setFontSize(Math.min(96, Math.max(8, base + delta)))
  }

  return (
    <div className="zeta-richtext border border-zeta-bg rounded-xl bg-white overflow-hidden">
      {editable && (
        <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-zeta-bg bg-zeta-bg/40">
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} icon={Bold} label="粗體" />
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} icon={Italic} label="斜體" />
          <ToolBtn
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            icon={UnderlineIcon}
            label="底線"
          />
          <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} icon={Strikethrough} label="刪除線" />
          <div className="w-px h-5 bg-zeta-bg mx-1" />
          <ToolBtn
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            icon={AlignLeft}
            label="靠左"
          />
          <ToolBtn
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            icon={AlignCenter}
            label="置中"
          />
          <ToolBtn
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            icon={AlignRight}
            label="靠右"
          />
          <div className="w-px h-5 bg-zeta-bg mx-1" />
          <ToolBtn
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={List}
            label="項目符號"
          />
          <ToolBtn
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={ListOrdered}
            label="編號清單"
          />
          {!minimal && (
            <>
              <div className="w-px h-5 bg-zeta-bg mx-1" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => bumpFontSize(-2)}
                title="縮小選取文字"
                className="p-1.5 rounded-md text-zeta-text/70 hover:bg-zeta-bg"
              >
                <Minus size={13} />
              </button>
              <select
                value={currentFontSize ?? ''}
                onMouseDown={(e) => e.preventDefault()}
                onChange={(e) => {
                  const size = Number(e.target.value)
                  if (size) setFontSize(size)
                  editor.chain().focus().run()
                }}
                className="text-xs border border-zeta-bg rounded-md px-1 py-1 w-14 bg-white"
                title="選取文字的字體大小"
              >
                <option value="">字級</option>
                {FONT_SIZE_PRESETS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => bumpFontSize(2)}
                title="放大選取文字"
                className="p-1.5 rounded-md text-zeta-text/70 hover:bg-zeta-bg"
              >
                <Plus size={13} />
              </button>
            </>
          )}
          <div className="w-px h-5 bg-zeta-bg mx-1" />
          {!minimal && (
            <div className="flex items-center gap-1">
              {BRAND_COLOR_SWATCHES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().setColor(c.value).run()}
                  className="w-5 h-5 rounded-full border border-black/10"
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <button
                type="button"
                title="標記背景色"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleHighlight({ color: '#E8DCCB' }).run()}
                className="w-5 h-5 rounded-full border border-black/10 bg-zeta-cream flex items-center justify-center"
              />
            </div>
          )}
          <div className="w-px h-5 bg-zeta-bg mx-1" />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyHighlightPreset}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zeta-gold/15 text-zeta-navy hover:bg-zeta-gold/25"
            title="設為重點：僅套用在選取的文字（品牌金＋粗體）"
          >
            <Sparkles size={13} /> 設為重點
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearSelectionFormatting}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-zeta-text/60 hover:bg-zeta-bg"
            title="清除選取文字的格式"
          >
            <Eraser size={13} /> 清除格式
          </button>
        </div>
      )}
      <div className="px-3 py-2 text-sm">
        <EditorContent editor={editor} />
        {editable && !editor.getText() && placeholder && (
          <div className="pointer-events-none -mt-6 text-zeta-text/30">{placeholder}</div>
        )}
      </div>
    </div>
  )
}

function ToolBtn({
  active,
  onClick,
  icon: Icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${active ? 'bg-zeta-navy text-white' : 'text-zeta-text/70 hover:bg-zeta-bg'}`}
    >
      <Icon size={14} />
    </button>
  )
}
