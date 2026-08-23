import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
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
  Sparkles
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { RichTextContent } from '../../types'

export const BRAND_COLOR_SWATCHES: { label: string; value: string }[] = [
  { label: '深藍色', value: '#19324A' },
  { label: '品牌金', value: '#D3AF37' },
  { label: '奶茶色', value: '#E8DCCB' },
  { label: '深灰色', value: '#333333' },
  { label: '紅色警示', value: '#B54A4A' },
  { label: '綠色正向', value: '#4F7965' },
  { label: '白色', value: '#FFFFFF' }
]

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
 */
export function RichTextEditor({ value, onChange, placeholder, editable = true, minimal = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextStyle,
      Color,
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

  const setHighlightPreset = (color: string, bold: boolean) => {
    editor.chain().focus().setColor(color)
    if (bold) editor.chain().focus().setColor(color).run()
    editor.chain().focus().setMark('textStyle', { color }).run()
    if (bold && !editor.isActive('bold')) editor.chain().focus().toggleBold().run()
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
          <div className="w-px h-5 bg-zeta-bg mx-1" />
          {!minimal && (
            <div className="flex items-center gap-1">
              {BRAND_COLOR_SWATCHES.map((c) => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => editor.chain().focus().setColor(c.value).run()}
                  className="w-5 h-5 rounded-full border border-black/10"
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <button
                title="標記背景色"
                onClick={() => editor.chain().focus().toggleHighlight({ color: '#E8DCCB' }).run()}
                className="w-5 h-5 rounded-full border border-black/10 bg-zeta-cream flex items-center justify-center"
              />
            </div>
          )}
          <div className="w-px h-5 bg-zeta-bg mx-1" />
          <button
            onClick={() => setHighlightPreset('#D3AF37', true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zeta-gold/15 text-zeta-navy hover:bg-zeta-gold/25"
            title="設為重點：品牌金＋粗體"
          >
            <Sparkles size={13} /> 設為重點
          </button>
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-zeta-text/60 hover:bg-zeta-bg"
            title="清除格式"
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
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${active ? 'bg-zeta-navy text-white' : 'text-zeta-text/70 hover:bg-zeta-bg'}`}
    >
      <Icon size={14} />
    </button>
  )
}
