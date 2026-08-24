import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '../common/Modal'
import { ConfirmDialog } from '../common/ConfirmDialog'
import type { ProposalCategory } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  categories: ProposalCategory[]
  proposalCountByCategory: Record<string, number>
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

/** 分類管理：新增、修改名稱、刪除。刪除分類不會刪除該分類內的專案（自動變成未分類）。 */
export function ManageCategoriesModal({ open, onClose, categories, proposalCountByCategory, onCreate, onRename, onDelete }: Props) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ProposalCategory | null>(null)

  const startEdit = (c: ProposalCategory) => {
    setEditingId(c.id)
    setEditingName(c.name)
  }
  const saveEdit = () => {
    if (editingId && editingName.trim()) onRename(editingId, editingName.trim())
    setEditingId(null)
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="管理分類" maxWidthClass="max-w-md">
        <div className="space-y-2 mb-4">
          {categories.length === 0 && <div className="text-sm text-zeta-text/40 text-center py-4">還沒有任何分類</div>}
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 border border-zeta-bg rounded-lg px-3 py-2">
              {editingId === c.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className="flex-1 text-sm border border-zeta-gold rounded-md px-2 py-1"
                />
              ) : (
                <button onClick={() => startEdit(c)} className="flex-1 text-left text-sm text-zeta-navy hover:underline">
                  {c.name}
                </button>
              )}
              <span className="text-xs text-zeta-text/40 shrink-0">{proposalCountByCategory[c.id] ?? 0} 個專案</span>
              <button onClick={() => setDeleteTarget(c)} className="text-zeta-danger/60 hover:text-zeta-danger shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newName.trim()) {
                onCreate(newName.trim())
                setNewName('')
              }
            }}
            placeholder="新分類名稱，例如：初次諮詢"
            className="flex-1 text-sm border border-zeta-bg rounded-md px-3 py-2 focus:outline-none focus:border-zeta-gold"
          />
          <button
            onClick={() => {
              if (!newName.trim()) return
              onCreate(newName.trim())
              setNewName('')
            }}
            className="flex items-center gap-1 text-sm px-3 py-2 rounded-md bg-zeta-navy text-white hover:opacity-90 shrink-0"
          >
            <Plus size={14} /> 新增
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除分類"
        message={`確定要刪除「${deleteTarget?.name}」這個分類嗎？此分類內的專案不會被刪除，會自動移到「未分類」。`}
        confirmLabel="刪除分類"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
