import React from 'react'
import type { RichTextContent } from '../../types'

/**
 * 純顯示用途的 Rich Text 渲染器（不掛載 Tiptap editor 實例），
 * 用在投影片預覽／縮圖，避免大量頁面同時渲染時效能過重。
 * 讀取的是與 RichTextEditor 相同的 Tiptap JSON 結構。
 */
export function RichTextView({ value, className, style }: { value: RichTextContent; className?: string; style?: React.CSSProperties }) {
  if (!value || typeof value !== 'object') return null
  const doc = value as any
  return <div className={className} style={style}>{renderNodes(doc.content ?? [])}</div>
}

function renderNodes(nodes: any[]): React.ReactNode {
  return nodes.map((node, i) => renderNode(node, i))
}

function renderNode(node: any, key: number): React.ReactNode {
  switch (node.type) {
    case 'paragraph': {
      const align = node.attrs?.textAlign
      return (
        <p key={key} style={{ textAlign: align, margin: 0 }}>
          {node.content ? renderInline(node.content) : <br />}
        </p>
      )
    }
    case 'bulletList':
      return (
        <ul key={key} className="list-disc pl-5">
          {node.content?.map((li: any, i: number) => <li key={i}>{renderNodes(li.content ?? [])}</li>)}
        </ul>
      )
    case 'orderedList':
      return (
        <ol key={key} className="list-decimal pl-5">
          {node.content?.map((li: any, i: number) => <li key={i}>{renderNodes(li.content ?? [])}</li>)}
        </ol>
      )
    default:
      return node.content ? <React.Fragment key={key}>{renderNodes(node.content)}</React.Fragment> : null
  }
}

function renderInline(content: any[]): React.ReactNode {
  return content.map((textNode, i) => {
    if (textNode.type !== 'text') return null
    let el: React.ReactNode = textNode.text
    const style: React.CSSProperties = {}
    let highlightColor: string | undefined

    for (const mark of textNode.marks ?? []) {
      if (mark.type === 'bold') el = <strong>{el}</strong>
      if (mark.type === 'italic') el = <em>{el}</em>
      if (mark.type === 'underline') el = <u>{el}</u>
      if (mark.type === 'strike') el = <s>{el}</s>
      if (mark.type === 'textStyle' && mark.attrs?.color) style.color = mark.attrs.color
      if (mark.type === 'highlight') highlightColor = mark.attrs?.color ?? '#E8DCCB'
    }

    return (
      <span key={i} style={{ ...style, backgroundColor: highlightColor, borderRadius: highlightColor ? 3 : undefined, padding: highlightColor ? '0 2px' : undefined }}>
        {el}
      </span>
    )
  })
}

/** 把 Tiptap JSON 轉成單純字串（用於欄位驗證、非富文字場合） */
export function richTextToPlainString(value: RichTextContent): string {
  if (!value || typeof value !== 'object') return ''
  const doc = value as any
  const walk = (nodes: any[]): string =>
    (nodes ?? [])
      .map((n) => {
        if (n.type === 'text') return n.text ?? ''
        if (n.content) return walk(n.content)
        return ''
      })
      .join(n_content_separator(nodes))
  function n_content_separator(_nodes: any[]) {
    return ''
  }
  return walk(doc.content ?? []).trim()
}
