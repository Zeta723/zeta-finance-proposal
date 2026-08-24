import React, { useMemo, useRef, useState } from 'react'
import { Download, FileJson, Plus, Search, Upload } from 'lucide-react'
import type { ClientInfo, Proposal, ProposalCategory, ProposalSummary } from '../../types'
import { proposalStorage } from '../../services/storageService'
import { listCategories, createCategory, renameCategory, deleteCategory } from '../../services/categoryService'
import { SCHEMA_VERSION } from '../../types'
import { newId, nowISO } from '../../services/idGenerator'
import { ProposalCard } from './ProposalCard'
import { NewProposalModal } from './NewProposalModal'
import { ManageCategoriesModal } from './ManageCategoriesModal'
import { CategoryTabs } from './CategoryTabs'
import { EmptyState } from '../common/EmptyState'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { Modal } from '../common/Modal'
import { useToast } from '../common/Toast'
import { exportProposalToPptx, exportProposalToKeynotePptx } from '../../export/pptxExport'
import { exportProposalToPdf } from '../../export/pdfExport'
import { FileText } from 'lucide-react'

interface Props {
  onOpenProposal: (proposal: Proposal) => void
}

export function ProposalListPage({ onOpenProposal }: Props) {
  const { showToast } = useToast()
  const [summaries, setSummaries] = useState<ProposalSummary[]>(() => proposalStorage.listSummaries())
  const [categories, setCategories] = useState<ProposalCategory[]>(() => listCategories())
  const [activeCategoryId, setActiveCategoryId] = useState<string | 'all' | 'uncategorized'>('all')
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [newOpen, setNewOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [renameTarget, setRenameTarget] = useState<ProposalSummary | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const fileImportRef = useRef<HTMLInputElement>(null)
  const backupImportRef = useRef<HTMLInputElement>(null)

  const refresh = () => setSummaries(proposalStorage.listSummaries())
  const refreshCategories = () => setCategories(listCategories())

  const validCategoryIds = useMemo(() => new Set(categories.map((c) => c.id)), [categories])

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of summaries) {
      if (s.categoryId && validCategoryIds.has(s.categoryId)) counts[s.categoryId] = (counts[s.categoryId] ?? 0) + 1
    }
    return counts
  }, [summaries, validCategoryIds])

  const countUncategorized = useMemo(
    () => summaries.filter((s) => !s.categoryId || !validCategoryIds.has(s.categoryId)).length,
    [summaries, validCategoryIds]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = summaries
    if (activeCategoryId === 'uncategorized') {
      list = list.filter((s) => !s.categoryId || !validCategoryIds.has(s.categoryId))
    } else if (activeCategoryId !== 'all') {
      list = list.filter((s) => s.categoryId === activeCategoryId)
    }
    if (!q) return list
    return list.filter((s) => s.name.toLowerCase().includes(q) || s.clientName.toLowerCase().includes(q) || s.topic.toLowerCase().includes(q))
  }, [summaries, query, activeCategoryId, validCategoryIds])

  const handleCreate = (client: ClientInfo) => {
    const now = nowISO()
    const proposal: Proposal = {
      id: newId(),
      schemaVersion: SCHEMA_VERSION,
      client,
      slides: [],
      themeSettings: { defaultTheme: 'classicNavyGold' },
      createdAt: now,
      updatedAt: now,
      categoryId: activeCategoryId !== 'all' && activeCategoryId !== 'uncategorized' ? activeCategoryId : undefined
    }
    proposalStorage.saveProposal(proposal)
    setNewOpen(false)
    onOpenProposal(proposal)
  }

  const handleOpen = (id: string) => {
    const p = proposalStorage.getProposal(id)
    if (!p) {
      showToast('這份提案的資料似乎已損毀或不存在。', 'error')
      refresh()
      return
    }
    onOpenProposal(p)
  }

  const handleDuplicate = (id: string) => {
    const copy = proposalStorage.duplicateProposal(id)
    if (copy) {
      showToast('已複製提案。', 'success')
      refresh()
    }
  }

  const handleDelete = () => {
    if (!deleteId) return
    proposalStorage.deleteProposal(deleteId)
    setDeleteId(null)
    refresh()
    showToast('提案已刪除。', 'success')
  }

  const handleRename = () => {
    if (!renameTarget) return
    const p = proposalStorage.getProposal(renameTarget.id)
    if (!p) return
    p.client.proposalName = renameValue
    proposalStorage.saveProposal(p)
    setRenameTarget(null)
    refresh()
  }

  const handleSetCategory = (id: string, categoryId: string | undefined) => {
    const p = proposalStorage.getProposal(id)
    if (!p) return
    p.categoryId = categoryId
    proposalStorage.saveProposal(p)
    refresh()
  }

  const handleCreateCategory = (name: string) => {
    createCategory(name)
    refreshCategories()
  }
  const handleRenameCategory = (id: string, name: string) => {
    renameCategory(id, name)
    refreshCategories()
  }
  const handleDeleteCategory = (id: string) => {
    deleteCategory(id)
    refreshCategories()
    if (activeCategoryId === id) setActiveCategoryId('all')
    // 分類刪除後，該分類內的專案不會被刪除，只是 categoryId 變成找不到對應分類 —— 已自動視為「未分類」，不需要額外處理
    refresh()
    showToast('分類已刪除，原本的專案已自動移到「未分類」。', 'success')
  }

  const handleExportJSON = (id: string) => {
    const json = proposalStorage.exportProposalJSON(id)
    if (!json) return
    downloadText(json, `proposal-${id}.json`, 'application/json')
    showToast('已匯出 JSON。', 'success')
  }

  const handleExportPptx = async (id: string) => {
    const p = proposalStorage.getProposal(id)
    if (!p) return
    try {
      await exportProposalToPptx(p)
      showToast('可編輯 PowerPoint 已匯出。', 'success')
    } catch {
      showToast('匯出 PowerPoint 失敗，請稍後再試一次。', 'error')
    }
  }

  const handleExportKeynotePptx = async (id: string) => {
    const p = proposalStorage.getProposal(id)
    if (!p) return
    try {
      await exportProposalToKeynotePptx(p)
      showToast('Keynote 相容 PowerPoint 已匯出。', 'success')
    } catch {
      showToast('匯出 PowerPoint 失敗，請稍後再試一次。', 'error')
    }
  }

  const handleExportPdf = async (id: string) => {
    const p = proposalStorage.getProposal(id)
    if (!p) return
    try {
      await exportProposalToPdf(p)
      showToast('PDF 已匯出。', 'success')
    } catch {
      showToast('匯出 PDF 失敗，請稍後再試一次。', 'error')
    }
  }

  const handleImportSingleFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await file.text()
      proposalStorage.importProposalJSON(text)
      refresh()
      showToast('已匯入提案。', 'success')
    } catch {
      showToast('匯入失敗：JSON 格式不正確或檔案已損毀。', 'error')
    }
  }

  const handleImportBackup = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await file.text()
      const result = proposalStorage.importAllJSON(text)
      refresh()
      showToast(`已匯入 ${result.imported} 份提案${result.skipped ? `，${result.skipped} 份失敗` : ''}。`, result.skipped ? 'warning' : 'success')
    } catch {
      showToast('匯入失敗：備份檔案格式不正確。', 'error')
    }
  }

  const handleExportAllBackup = () => {
    const json = proposalStorage.exportAllJSON()
    downloadText(json, `zeta-proposals-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
    showToast('已匯出全部提案備份。', 'success')
  }

  return (
    <div className="min-h-screen bg-zeta-bg">
      <header className="bg-white border-b border-zeta-bg">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#19324A' }}>
                <FileText size={16} color="#D3AF37" />
              </div>
              <h1 className="text-lg font-bold text-zeta-navy">Zeta 財務提案生成器</h1>
            </div>
            <p className="text-xs text-zeta-text/50 mt-1 ml-10">Zeta｜錢與人生的整理室</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => backupImportRef.current?.click()} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border border-zeta-bg text-zeta-navy hover:bg-zeta-bg">
              <Upload size={14} /> 匯入全部備份
            </button>
            <button onClick={handleExportAllBackup} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border border-zeta-bg text-zeta-navy hover:bg-zeta-bg">
              <Download size={14} /> 匯出全部備份
            </button>
            <button onClick={() => fileImportRef.current?.click()} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border border-zeta-bg text-zeta-navy hover:bg-zeta-bg">
              <FileJson size={14} /> 匯入JSON
            </button>
            <button onClick={() => setNewOpen(true)} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-zeta-navy text-white hover:opacity-90">
              <Plus size={15} /> 建立新提案
            </button>
          </div>
          <input ref={fileImportRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleImportSingleFile(e.target.files?.[0])} />
          <input ref={backupImportRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleImportBackup(e.target.files?.[0])} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-4">
          <CategoryTabs
            categories={categories}
            activeCategoryId={activeCategoryId}
            countAll={summaries.length}
            countUncategorized={countUncategorized}
            countByCategory={countByCategory}
            onSelect={setActiveCategoryId}
            onManage={() => setManageCategoriesOpen(true)}
          />
        </div>

        <div className="relative max-w-sm mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zeta-text/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋提案名稱、客戶或主題"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-zeta-bg bg-white focus:outline-none focus:border-zeta-gold"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={summaries.length === 0 ? '還沒有任何提案' : '找不到符合的提案'}
            description={summaries.length === 0 ? '建立第一份提案，開始為客戶製作專屬的財務規劃簡報。' : '試試其他關鍵字或切換分類。'}
            action={
              summaries.length === 0 && (
                <button onClick={() => setNewOpen(true)} className="px-5 py-2 rounded-full bg-zeta-navy text-white text-sm hover:opacity-90">
                  建立新提案
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((s) => (
              <ProposalCard
                key={s.id}
                summary={s}
                categories={categories}
                onOpen={() => handleOpen(s.id)}
                onDuplicate={() => handleDuplicate(s.id)}
                onRename={() => { setRenameTarget(s); setRenameValue(s.name) }}
                onDelete={() => setDeleteId(s.id)}
                onSetCategory={(categoryId) => handleSetCategory(s.id, categoryId)}
                onExportPptx={() => handleExportPptx(s.id)}
                onExportKeynotePptx={() => handleExportKeynotePptx(s.id)}
                onExportPdf={() => handleExportPdf(s.id)}
                onExportJSON={() => handleExportJSON(s.id)}
              />
            ))}
          </div>
        )}
      </main>

      <NewProposalModal open={newOpen} onClose={() => setNewOpen(false)} onCreate={handleCreate} />

      <ManageCategoriesModal
        open={manageCategoriesOpen}
        onClose={() => setManageCategoriesOpen(false)}
        categories={categories}
        proposalCountByCategory={countByCategory}
        onCreate={handleCreateCategory}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategory}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="刪除提案"
        message="確定要刪除這份提案嗎？刪除後將無法復原。"
        confirmLabel="刪除"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <Modal
        open={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="重新命名提案"
        maxWidthClass="max-w-sm"
        footer={
          <>
            <button onClick={() => setRenameTarget(null)} className="px-4 py-2 rounded-full text-sm border border-zeta-bg">取消</button>
            <button onClick={handleRename} className="px-4 py-2 rounded-full text-sm bg-zeta-navy text-white">儲存</button>
          </>
        }
      >
        <input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          className="w-full text-sm border border-zeta-bg rounded-md px-3 py-2 focus:outline-none focus:border-zeta-gold"
        />
      </Modal>
    </div>
  )
}

function downloadText(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
